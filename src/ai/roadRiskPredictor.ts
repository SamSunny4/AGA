import { GraphNode, GraphEdge, HazardZone } from '../types/graph';
import { WeatherCondition } from '../types/simulation';
import { computePointHazardRisk } from './hazardSpread';

export interface RoadPredictionResult {
  predictedRisks: Record<string, number>;
  predictedClosures: string[]; // edge IDs
  earlyWarnings: {
    edgeId: string;
    roadName: string;
    warningTimeMin: number;
    riskScore: number;
    hazardType: string;
    recommendation: string;
  }[];
}

export function predictFutureRoadRisks(
  nodes: Record<string, GraphNode>,
  edges: Record<string, GraphEdge>,
  hazards: HazardZone[],
  weather: WeatherCondition,
  lookaheadHours: number = 1.0
): RoadPredictionResult {
  const predictedRisks: Record<string, number> = {};
  const predictedClosures: string[] = [];
  const earlyWarnings: RoadPredictionResult['earlyWarnings'] = [];

  for (const edge of Object.values(edges)) {
    const src = nodes[edge.source];
    const tgt = nodes[edge.target];
    if (!src || !tgt) continue;

    // Midpoint of road
    const midLat = (src.lat + tgt.lat) / 2;
    const midLng = (src.lng + tgt.lng) / 2;
    const midElevation = (src.elevation + tgt.elevation) / 2;

    const currentRisk = Math.max(
      src.hazardRisk,
      tgt.hazardRisk,
      computePointHazardRisk(midLat, midLng, midElevation, hazards, weather)
    );

    // AI Prediction factors:
    // 1. Structural vulnerability by road type
    let structureVuln = 1.0;
    if (edge.roadType === 'bridge') structureVuln = 1.4;
    else if (edge.roadType === 'tunnel') structureVuln = 1.5;
    else if (edge.roadType === 'mountain_pass') structureVuln = 1.6;

    // 2. Proximity expansion rate
    let maxHazardExpansionRate = 0;
    let dominantHazardType = 'General Hazard';
    for (const h of hazards) {
      if (h.expansionRateKmH > maxHazardExpansionRate) {
        maxHazardExpansionRate = h.expansionRateKmH;
        dominantHazardType = h.type.toUpperCase();
      }
    }

    // 3. Traffic surge overload (gridlock accelerates vulnerability)
    const trafficSurgeFactor = 1 + edge.trafficDensity * 0.35;

    // 4. Slope / rainfall vulnerability
    const slopeRainFactor = 1 + (edge.elevationSlope / 50) * (weather.rainfallMmH / 50);

    // Compute forecasted risk at t + lookaheadHours
    const riskGrowthRate = (0.15 + maxHazardExpansionRate * 0.08) * structureVuln * slopeRainFactor;
    const forecastedRisk = Math.min(
      1.0,
      currentRisk + riskGrowthRate * lookaheadHours * (currentRisk > 0.1 ? 1.5 : 0.5)
    );

    const roundedForecast = Math.round(forecastedRisk * 100) / 100;
    predictedRisks[edge.id] = roundedForecast;

    // Probability of imminent road blockage within lookahead window
    if (roundedForecast >= 0.85 && !edge.isBlocked) {
      predictedClosures.push(edge.id);
    }

    // Early warning notification trigger
    if (roundedForecast >= 0.65 && currentRisk < 0.65 && !edge.isBlocked) {
      const timeToClosureMin = Math.max(10, Math.round(((0.9 - currentRisk) / Math.max(0.01, riskGrowthRate)) * 60));
      earlyWarnings.push({
        edgeId: edge.id,
        roadName: `${src.name} – ${tgt.name} (${edge.roadType.toUpperCase()})`,
        warningTimeMin: Math.min(120, timeToClosureMin),
        riskScore: Math.round(roundedForecast * 100),
        hazardType: dominantHazardType,
        recommendation: `Reroute ongoing traffic via alternate perimeter arterial before ${timeToClosureMin}m.`
      });
    }
  }

  return {
    predictedRisks,
    predictedClosures,
    earlyWarnings
  };
}
