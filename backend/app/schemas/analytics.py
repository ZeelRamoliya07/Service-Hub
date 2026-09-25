from pydantic import BaseModel
from typing import List, Dict

class StatusDistribution(BaseModel):
    name: str
    count: int

class PriorityDistribution(BaseModel):
    name: str
    count: int

class TimeSeriesPoint(BaseModel):
    date: str
    requests: int

class AnalyticsOverview(BaseModel):
    total_customers: int
    total_employees: int
    total_services: int
    total_requests: int
    pending_requests: int
    assigned_requests: int
    in_progress_requests: int
    completed_requests: int
    cancelled_requests: int
    total_appointments: int
    status_distribution: List[StatusDistribution]
    priority_distribution: List[PriorityDistribution]
    requests_over_time: List[TimeSeriesPoint]
