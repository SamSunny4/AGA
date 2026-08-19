import { HazardZone, GraphNode, GraphEdge, DisasterType } from '../types/graph';
import { WeatherCondition } from '../types/simulation';

// Euclidean distance helper in km
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111.32;
  const dLng = (lng2 - lng1) * 111.32 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Compute hazard intensity at a given coordinate
export function computePointHazardRisk(
  lat: number,
  lng: number,
  elevation: number,
  hazards: HazardZone[],
  weather: WeatherCondition
): number {
  let maxRisk = 0;

  for (const hazard of hazards) {
    const dist = distanceKm(hazard.centerLat, hazard.centerLng, lat, lng);

    switch (hazard.type) {
      case 'flood': {
        // Floods spread wider at low elevations and high rainfall
        const effectiveRadius = hazard.radiusKm * (1 + (weather.rainfallMmH / 50) * 0.5);
        const waterHeight = (hazard.waterLevelMeters || 3) - elevation * 0.1;
        if (dist <= effectiveRadius) {
          const proximity = 1 - dist / effectiveRadius;
          const floodRisk = proximity * hazard.intensity * (waterHeight > 0 ? 1.2 : 0.6);
          maxRisk = Math.max(maxRisk, Math.min(1.0, floodRisk));
        }
        break;
      }

      case 'wildfire': {
        // Wildfire expands elliptically in the direction of the wind
        const windRad = ((hazard.windAngleDeg ?? weather.windDirectionDeg) * Math.PI) / 180;
        const dx = (lng - hazard.centerLng) * 111.32 * Math.cos((lat * Math.PI) / 180);
        const dy = (lat - hazard.centerLat) * 111.32;

        // Project coordinate along wind vector
        const downwindDist = dx * Math.cos(windRad) + dy * Math.sin(windRad);
        const crosswindDist = -dx * Math.sin(windRad) + dy * Math.cos(windRad);

        const windSpeed = hazard.windSpeedKmH ?? weather.windSpeedKmH;
        const forwardRadius = hazard.radiusKm * (1 + windSpeed / 30);
        const flankRadius = hazard.radiusKm * 0.7;

        const ellipticalDistSq =
          Math.pow(Math.max(0, downwindDist) / forwardRadius, 2) +
          Math.pow(Math.min(0, downwindDist) / (hazard.radiusKm * 0.5), 2) +
          Math.pow(crosswindDist / flankRadius, 2);

        if (ellipticalDistSq <= 1.0) {
          const fireIntensity = (1 - Math.sqrt(ellipticalDistSq)) * hazard.intensity * (1 + (100 - weather.humidityPct) / 100 * 0.3);
          maxRisk = Math.max(maxRisk, Math.min(1.0, fireIntensity));
        }
        break;
      }

      case 'earthquake': {
        // Seismic intensity attenuates exponentially with distance and depth
        const depth = hazard.epicenterDepthKm || 10;
        const hypoDist = Math.sqrt(dist * dist + depth * depth);
        const seismicIntensity = (hazard.intensity * 15) / (hypoDist * 1.5 + 2);
        maxRisk = Math.max(maxRisk, Math.min(1.0, seismicIntensity));
        break;
      }

      case 'landslide': {
        // High risk if close to center and steep slope
        if (dist <= hazard.radiusKm) {
          const proximity = 1 - dist / hazard.radiusKm;
          const rainFactor = Math.min(1.5, 1 + weather.rainfallMmH / 40);
          maxRisk = Math.max(maxRisk, Math.min(1.0, proximity * hazard.intensity * rainFactor));
        }
        break;
      }

      case 'cyclone': {
        // Cyclonic eye and high wind speed radius
        if (dist <= hazard.radiusKm * 1.8) {
          const cycloneRisk = (1 - dist / (hazard.radiusKm * 1.8)) * hazard.intensity;
          maxRisk = Math.max(maxRisk, Math.min(1.0, cycloneRisk));
        }
        break;
      }
    }
  }

  return Math.round(maxRisk * 1000) / 1000;
}

// Advance hazard positions and sizes over simulation time delta (hours)
export function advanceHazards(
  hazards: HazardZone[],
  dtHours: number,
  weather: WeatherCondition
): HazardZone[] {
  return hazards.map(h => {
    let growthRate = h.expansionRateKmH;

    if (h.type === 'wildfire') {
      growthRate *= (1 + weather.windSpeedKmH / 40) * (1 - weather.humidityPct / 200);
      // Drift center downwind
      const windRad = (weather.windDirectionDeg * Math.PI) / 180;
      const driftSpeedKmH = weather.windSpeedKmH * 0.08;
      const dLat = (driftSpeedKmH * dtHours * Math.sin(windRad)) / 111.32;
      const dLng = (driftSpeedKmH * dtHours * Math.cos(windRad)) / (111.32 * Math.cos((h.centerLat * Math.PI) / 180));
      return {
        ...h,
        centerLat: h.centerLat + dLat,
        centerLng: h.centerLng + dLng,
        radiusKm: Math.min(15, h.radiusKm + growthRate * dtHours),
        intensity: Math.min(1.0, h.intensity + 0.02 * dtHours)
      };
    } else if (h.type === 'flood') {
      growthRate *= (1 + weather.rainfallMmH / 30);
      return {
        ...h,
        radiusKm: Math.min(18, h.radiusKm + growthRate * dtHours),
        waterLevelMeters: (h.waterLevelMeters || 3) + (weather.rainfallMmH / 100) * dtHours,
        intensity: Math.min(1.0, h.intensity + 0.03 * dtHours)
      };
    } else {
      return {
        ...h,
        radiusKm: Math.min(20, h.radiusKm + growthRate * dtHours)
      };
    }
  });
}
