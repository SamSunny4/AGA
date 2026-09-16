from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

NodeType = Literal['intersection', 'shelter', 'hospital', 'depot', 'residential', 'commercial']
RoadType = Literal['highway', 'arterial', 'local', 'bridge', 'tunnel', 'mountain_pass']
DisasterType = Literal['flood', 'earthquake', 'wildfire', 'landslide', 'cyclone']

class GraphNode(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    type: NodeType
    elevation: float = 0.0
    population: int = 0
    evacuatedCount: Optional[int] = 0
    capacity: Optional[int] = None
    currentOccupancy: Optional[int] = 0
    hazardRisk: float = 0.0
    zoneId: Optional[str] = None
    color: Optional[str] = None
    isDominatingHub: Optional[bool] = False
    isDistressActive: Optional[bool] = False
    distressPriority: Optional[Literal['P1', 'P2', 'P3']] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    distance: float
    baseSpeed: float = 50.0
    capacity: float = 1000.0
    currentFlow: float = 0.0
    roadType: RoadType = 'local'
    lanes: int = 2
    elevationSlope: float = 0.0
    hazardRisk: float = 0.0
    predictedRisk: float = 0.0
    isBlocked: bool = False
    blockageReason: Optional[str] = None
    isBridge: Optional[bool] = False
    isMstEdge: Optional[bool] = False
    isMinCut: Optional[bool] = False
    inActivePath: Optional[bool] = False
    trafficDensity: float = 0.0

class GraphData(BaseModel):
    nodes: Dict[str, GraphNode]
    edges: Dict[str, GraphEdge]
    adjacencyList: Dict[str, List[str]]

class HazardZone(BaseModel):
    id: str
    type: DisasterType
    centerLat: float
    centerLng: float
    radiusKm: float
    intensity: float = 0.5
    expansionRateKmH: float = 0.5
    directionDeg: Optional[float] = 0.0
    windAngleDeg: Optional[float] = None
    windSpeedKmH: Optional[float] = None
    waterLevelMeters: Optional[float] = None
    epicenterDepthKm: Optional[float] = None
