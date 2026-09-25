from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.database.database import get_db
from app.models.customer import Customer
from app.models.employee import Employee
from app.models.service import Service
from app.models.service_request import ServiceRequest
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.analytics import AnalyticsOverview, StatusDistribution, PriorityDistribution, TimeSeriesPoint
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    total_services = db.query(func.count(Service.id)).scalar() or 0
    total_requests = db.query(func.count(ServiceRequest.id)).scalar() or 0
    
    pending_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "PENDING").scalar() or 0
    assigned_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "ASSIGNED").scalar() or 0
    in_progress_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "IN_PROGRESS").scalar() or 0
    completed_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "COMPLETED").scalar() or 0
    cancelled_requests = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "CANCELLED").scalar() or 0
    
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0

    status_dist = [
        StatusDistribution(name="Pending", count=pending_requests),
        StatusDistribution(name="Assigned", count=assigned_requests),
        StatusDistribution(name="In Progress", count=in_progress_requests),
        StatusDistribution(name="Completed", count=completed_requests),
        StatusDistribution(name="Cancelled", count=cancelled_requests),
    ]

    prio_counts = db.query(ServiceRequest.priority, func.count(ServiceRequest.id)).group_by(ServiceRequest.priority).all()
    prio_dict = {p[0]: p[1] for p in prio_counts}
    priority_dist = [
        PriorityDistribution(name="Low", count=prio_dict.get("LOW", 0)),
        PriorityDistribution(name="Medium", count=prio_dict.get("MEDIUM", 0)),
        PriorityDistribution(name="High", count=prio_dict.get("HIGH", 0)),
        PriorityDistribution(name="Urgent", count=prio_dict.get("URGENT", 0)),
    ]

    # Requests over time (last 7 days)
    now = datetime.now(timezone.utc)
    time_series = []
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        date_str = day_date.strftime("%Y-%m-%d")
        
        # Count created on or before this day
        start_of_day = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = day_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = db.query(func.count(ServiceRequest.id)).filter(
            ServiceRequest.created_at >= start_of_day,
            ServiceRequest.created_at <= end_of_day
        ).scalar() or 0
        
        time_series.append(TimeSeriesPoint(date=day_date.strftime("%b %d"), requests=count))

    return AnalyticsOverview(
        total_customers=total_customers,
        total_employees=total_employees,
        total_services=total_services,
        total_requests=total_requests,
        pending_requests=pending_requests,
        assigned_requests=assigned_requests,
        in_progress_requests=in_progress_requests,
        completed_requests=completed_requests,
        cancelled_requests=cancelled_requests,
        total_appointments=total_appointments,
        status_distribution=status_dist,
        priority_distribution=priority_dist,
        requests_over_time=time_series
    )
