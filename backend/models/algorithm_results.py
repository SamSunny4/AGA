from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel

class RouteStep(BaseModel):
    instruction: str
    distanceKm: float
    roadName: str
    hazardWarning: Optional[str] = None

class RouteResult(BaseModel):
    pathNodeIds: List[str]
    pathEdgeIds: List[str]
    totalDistanceKm: float
    estimatedTimeMin: float
    safetyScore: float
    hazardExposureRisk: float
    isPassable: bool
    bottlenecks: List[str] = []
    steps: List[RouteStep] = []

class AlgorithmStep(BaseModel):
    stepIndex: int
    description: str
    highlightedNodeIds: List[str] = []
    highlightedEdgeIds: List[str] = []
    visitedNodeIds: Optional[List[str]] = None
    currentDistanceMap: Optional[Dict[str, float]] = None
    metrics: Optional[Dict[str, Union[str, float, int]]] = None

class AlgorithmExecutionResult(BaseModel):
    algorithmName: str
    executionTimeMs: float
    summary: str
    steps: List[AlgorithmStep] = []
    nodeAttributes: Optional[Dict[str, Dict[str, Any]]] = None
    edgeAttributes: Optional[Dict[str, Dict[str, Any]]] = None
    customMetrics: Optional[Dict[str, Union[str, float, int]]] = None
    additionalPaths: Optional[List[Dict[str, Any]]] = None

class AlgorithmResponse(BaseModel):
    execution: AlgorithmExecutionResult
    route: Optional[RouteResult] = None
    matches: Optional[List[Dict[str, Any]]] = None
    allocations: Optional[List[Dict[str, Any]]] = None
