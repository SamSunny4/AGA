import math
from typing import List
from ..models.graph import HazardZone
from ..models.simulation import WeatherCondition

def distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = (lat2 - lat1) * 111.32
    d_lng = (lng2 - lng1) * 111.32 * math.cos(math.radians(lat1))
    return math.sqrt(d_lat * d_lat + d_lng * d_lng)

def compute_point_hazard_risk(
    lat: float,
    lng: float,
    elevation: float,
    hazards: List[HazardZone],
    weather: WeatherCondition
) -> float:
    max_risk = 0.0

    for hazard in hazards:
        dist = distance_km(hazard.centerLat, hazard.centerLng, lat, lng)

        if hazard.type == 'flood':
            effective_radius = hazard.radiusKm * (1.0 + (weather.rainfallMmH / 50.0) * 0.5)
            water_height = (hazard.waterLevelMeters or 3.0) - elevation * 0.1
            if dist <= effective_radius:
                proximity = 1.0 - dist / effective_radius
                flood_risk = proximity * hazard.intensity * (1.2 if water_height > 0 else 0.6)
                max_risk = max(max_risk, min(1.0, flood_risk))

        elif hazard.type == 'wildfire':
            wind_rad = math.radians(hazard.windAngleDeg if hazard.windAngleDeg is not None else weather.windDirectionDeg)
            dx = (lng - hazard.centerLng) * 111.32 * math.cos(math.radians(lat))
            dy = (lat - hazard.centerLat) * 111.32

            downwind_dist = dx * math.cos(wind_rad) + dy * math.sin(wind_rad)
            crosswind_dist = -dx * math.sin(wind_rad) + dy * math.cos(wind_rad)

            wind_speed = hazard.windSpeedKmH if hazard.windSpeedKmH is not None else weather.windSpeedKmH
            forward_radius = hazard.radiusKm * (1.0 + wind_speed / 30.0)
            flank_radius = hazard.radiusKm * 0.7

            fw_term = math.pow(max(0.0, downwind_dist) / forward_radius, 2)
            bw_term = math.pow(min(0.0, downwind_dist) / (hazard.radiusKm * 0.5), 2)
            cw_term = math.pow(crosswind_dist / flank_radius, 2)
            elliptical_dist_sq = fw_term + bw_term + cw_term

            if elliptical_dist_sq <= 1.0:
                fire_intensity = (1.0 - math.sqrt(elliptical_dist_sq)) * hazard.intensity * (1.0 + (100.0 - weather.humidityPct) / 100.0 * 0.3)
                max_risk = max(max_risk, min(1.0, fire_intensity))

        elif hazard.type == 'earthquake':
            depth = hazard.epicenterDepthKm or 10.0
            hypo_dist = math.sqrt(dist * dist + depth * depth)
            seismic_intensity = (hazard.intensity * 15.0) / (hypo_dist * 1.5 + 2.0)
            max_risk = max(max_risk, min(1.0, seismic_intensity))

        elif hazard.type == 'landslide':
            if dist <= hazard.radiusKm:
                proximity = 1.0 - dist / hazard.radiusKm
                rain_factor = min(1.5, 1.0 + weather.rainfallMmH / 40.0)
                max_risk = max(max_risk, min(1.0, proximity * hazard.intensity * rain_factor))

        elif hazard.type == 'cyclone':
            if dist <= hazard.radiusKm * 1.8:
                cyclone_risk = (1.0 - dist / (hazard.radiusKm * 1.8)) * hazard.intensity
                max_risk = max(max_risk, min(1.0, cyclone_risk))

    return round(max_risk, 3)

def advance_hazards(
    hazards: List[HazardZone],
    dt_hours: float,
    weather: WeatherCondition
) -> List[HazardZone]:
    updated_hazards = []
    for h in hazards:
        growth_rate = h.expansionRateKmH

        if h.type == 'wildfire':
            growth_rate *= (1.0 + weather.windSpeedKmH / 40.0) * (1.0 - weather.humidityPct / 200.0)
            wind_rad = math.radians(weather.windDirectionDeg)
            drift_speed = weather.windSpeedKmH * 0.08
            d_lat = (drift_speed * dt_hours * math.sin(wind_rad)) / 111.32
            d_lng = (drift_speed * dt_hours * math.cos(wind_rad)) / (111.32 * math.cos(math.radians(h.centerLat)))
            updated_hazards.append(h.model_copy(update={
                'centerLat': h.centerLat + d_lat,
                'centerLng': h.centerLng + d_lng,
                'radiusKm': min(15.0, h.radiusKm + growth_rate * dt_hours),
                'intensity': min(1.0, h.intensity + 0.02 * dt_hours)
            }))
        elif h.type == 'flood':
            growth_rate *= (1.0 + weather.rainfallMmH / 30.0)
            cur_water = h.waterLevelMeters or 3.0
            updated_hazards.append(h.model_copy(update={
                'radiusKm': min(18.0, h.radiusKm + growth_rate * dt_hours),
                'waterLevelMeters': cur_water + (weather.rainfallMmH / 100.0) * dt_hours,
                'intensity': min(1.0, h.intensity + 0.03 * dt_hours)
            }))
        else:
            updated_hazards.append(h.model_copy(update={
                'radiusKm': min(20.0, h.radiusKm + growth_rate * dt_hours)
            }))

    return updated_hazards
