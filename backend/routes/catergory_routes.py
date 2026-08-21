from fastapi import APIRouter, Depends

from schemas.catergory_schema import Category
from services.catergory_services import (
    create_category,
    get_categories,
    update_category,
    delete_category
)
from dependencies.auth import get_current_admin


router = APIRouter()


@router.post("/admin/categories")
def add_category(category: Category,current_admin=Depends(get_current_admin)):
    categoryUuid = create_category(category.model_dump())

    return {
        "message": "Category created successfully",
        "categoryUuid": categoryUuid
    }


@router.get("/admin/categories")
def read_categories(current_admin=Depends(get_current_admin)):
    return get_categories()


@router.put("/admin/categories/{categoryUuid}")
def edit_category(
    categoryUuid: str,
    category: Category,
    current_admin=Depends(get_current_admin)
):
    result = update_category(
        categoryUuid,
        category.model_dump()
    )

    if result is None:
        return {
            "message": "Category not found"
        }

    return {
        "message": "Category updated successfully"
    }


@router.delete("/admin/categories/{categoryUuid}")
def remove_category(
    categoryUuid: str,
    current_admin=Depends(get_current_admin)
):
    result = delete_category(categoryUuid)

    if result is None:
        return {
            "message": "Category not found"
        }

    return {
        "message": "Category deleted successfully"
    }