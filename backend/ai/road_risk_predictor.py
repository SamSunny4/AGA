from typing import Dict, List, Any
from ..models.graph import GraphNode, GraphEdge, HazardZone
from ..models.simulation import WeatherCondition
from .hazard_spread import compute_point_hazard_risk

def predict_future_road_risks(
    nodes: Dict[str, GraphNode],
    edges: Dict[str, GraphEdge],
    hazards: List[HazardZone],
    weather: WeatherCondition,
    lookahead_hours: float = 1.0
) -> Dict[str, Any]:
    predicted_risks: Dict[str, float] = {}
    predicted_closures: List[str] = []
    early_warnings: List[Dict[str, Any]] = []

    for edge in edges.values():
        src = nodes.get(edge.source)
        tgt = nodes.get(edge.target)
        if not src or not tgt:
            continue

        mid_lat = (src.lat + tgt.lat) / 2.0
        mid_lng = (src.lng + tgt.lng) / 2.0
        mid_elev = (src.elevation + tgt.elevation) / 2.0

        current_risk = max(
            src.hazardRisk,
            tgt.hazardRisk,
            compute_point_hazard_risk(mid_lat, mid_lng, mid_elev, hazards, weather)
        )

        structure_vuln = 1.0
        if edge.roadType == 'bridge':
            structure_vuln = 1.4
        elif edge.roadType == 'tunnel':
            structure_vuln = 1.5
        elif edge.roadType == 'mountain_pass':
            structure_vuln = 1.6

        max_hazard_expansion = max((h.expansionRateKmH for h in hazards), default=0.5)
        dominant_hazard = hazards[0].type.upper() if hazards else 'GENERAL HAZARD'

        traffic_factor = 1.0 + edge.trafficDensity * 0.35
        slope_rain_factor = 1.0 + (edge.elevationSlope / 50.0) * (weather.rainfallMmH / 50.0)

        risk_growth = (0.15 + max_hazard_expansion * 0.08) * structure_vuln * slope_rain_factor
        forecasted_risk = min(
            1.0,
            current_risk + risk_growth * lookahead_hours * (1.5 if current_risk > 0.1 else 0.5)
        )

        rounded_forecast = round(forecasted_risk, 2)
        predicted_risks[edge.id] = rounded_forecast

        if rounded_forecast >= 0.85 and not edge.isBlocked:
            predicted_closures.append(edge.id)

        if rounded_forecast >= 0.65 and current_risk < 0.65 and not edge.isBlocked:
            time_to_closure = max(10, int(((0.9 - current_risk) / max(0.01, risk_growth)) * 60))
            early_warnings.append({
                'edgeId': edge.id,
                'roadName': f"{src.name} – {tgt.name} ({edge.roadType.upper()})",
                'warningTimeMin': min(120, time_to_closure),
                'riskScore': int(rounded_forecast * 100),
                'hazardType': dominant_hazard,
                'recommendation': f"Reroute ongoing traffic via alternate perimeter arterial before {time_to_closure}m."
            })

    return {
        'predictedRisks': predicted_risks,
        'predictedClosures': predicted_closures,
        'earlyWarnings': early_warnings
    }
