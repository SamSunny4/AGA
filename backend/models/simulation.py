from typing import Optional, Literal
from pydantic import BaseModel

class WeatherCondition(BaseModel):
    temperatureC: float = 28.0
    rainfallMmH: float = 40.0
    windSpeedKmH: float = 30.0
    windDirectionDeg: float = 90.0
    visibilityKm: float = 8.0
    humidityPct: float = 85.0

class DistressCall(BaseModel):
    id: str
    nodeId: str
    reportedTimeHours: float = 0.0
    peopleCount: int = 50
    priority: Literal['P1', 'P2', 'P3'] = 'P1'
    description: str = 'Emergency distress call'
    assignedTeamId: Optional[str] = None
    status: Literal['pending', 'dispatched', 'rescued'] = 'pending'

class RescueTeam(BaseModel):
    id: str
    name: str
    type: Literal['medical_ambulance', 'fire_rescue', 'boat_amphibious', 'air_helicopter']
    capacity: int = 20
    currentNodeId: str
    speedKmH: float = 50.0
    status: Literal['idle', 'en_route', 'rescuing'] = 'idle'
    assignedDistressId: Optional[str] = None
