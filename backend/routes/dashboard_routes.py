from fastapi import APIRouter, Depends

from dependencies.auth import get_current_admin
from services.dashboard_services import get_dashboard_stats


router = APIRouter()


@router.get("/admin/dashboard")
def dashboard(current_admin=Depends(get_current_admin)):

    stats = get_dashboard_stats()

    return stats