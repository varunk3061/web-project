from fastapi import APIRouter, Depends, HTTPException

from dependencies.auth import get_current_admin
from services.dashboard_services import get_dashboard_stats
from logging_config import log


router = APIRouter()


@router.get("/admin/dashboard")
def dashboard(current_admin=Depends(get_current_admin)):

    log.info("dashboard_retrieval_attempt")

    try:
        stats = get_dashboard_stats()

        log.info(
            "dashboard_retrieved",
            stats=stats
        )

        return stats

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "dashboard_retrieval_error"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard statistics"
        )