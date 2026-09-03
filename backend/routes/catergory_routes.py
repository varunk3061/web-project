from fastapi import APIRouter, Depends, HTTPException

from schemas.catergory_schema import Category
from services.catergory_services import (
    create_category,
    get_categories,
    update_category,
    delete_category
)
from dependencies.auth import get_current_admin
from logging_config import log


router = APIRouter()


@router.post("/admin/categories")
def add_category(
    category: Category,
    current_admin=Depends(get_current_admin)
):
    log.info(
        "category_creation_attempt",
        category_name=category.name
    )

    try:
        categoryUuid = create_category(category.model_dump())

        log.info(
            "category_created",
            category_uuid=categoryUuid,
            category_name=category.name
        )

        return {
            "message": "Category created successfully",
            "categoryUuid": categoryUuid
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "category_creation_error",
            category_name=category.name
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create category"
        )


@router.get("/admin/categories")
def read_categories(
    current_admin=Depends(get_current_admin)
):
    log.debug("category_retrieval_attempt")

    try:
        categories = get_categories()

        log.info(
            "categories_retrieved",
            count=len(categories)
        )

        return categories

    except HTTPException:
        raise

    except Exception:
        log.exception("category_retrieval_error")

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve categories"
        )


@router.put("/admin/categories/{categoryUuid}")
def edit_category(
    categoryUuid: str,
    category: Category,
    current_admin=Depends(get_current_admin)
):
    log.info(
        "category_update_attempt",
        category_uuid=categoryUuid,
        category_name=category.name
    )

    try:
        result = update_category(
            categoryUuid,
            category.model_dump()
        )

        if result is None:
            log.warning(
                "category_update_failed",
                category_uuid=categoryUuid,
                reason="category_not_found"
            )

            return {
                "message": "Category not found"
            }

        log.info(
            "category_updated",
            category_uuid=categoryUuid,
            category_name=category.name
        )

        return {
            "message": "Category updated successfully"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "category_update_error",
            category_uuid=categoryUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update category"
        )


@router.delete("/admin/categories/{categoryUuid}")
def remove_category(
    categoryUuid: str,
    current_admin=Depends(get_current_admin)
):
    log.info(
        "category_deletion_attempt",
        category_uuid=categoryUuid
    )

    try:
        result = delete_category(categoryUuid)

        if result is None:
            log.warning(
                "category_deletion_failed",
                category_uuid=categoryUuid,
                reason="category_not_found"
            )

            return {
                "message": "Category not found"
            }

        log.info(
            "category_deleted",
            category_uuid=categoryUuid
        )

        return {
            "message": "Category deleted successfully"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "category_deletion_error",
            category_uuid=categoryUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete category"
        )