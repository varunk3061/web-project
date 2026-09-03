from fastapi import APIRouter, Depends, HTTPException

from schemas.product_schema import Product, ProductUpdate

from services.product_service import (
    create_product,
    get_products,
    get_product,
    update_product,
    delete_product
)

from dependencies.auth import get_current_admin

from logging_config import log


router = APIRouter()


@router.post("/admin/products")
def add_product(
    product: Product,
    current_admin=Depends(get_current_admin)
):
    log.info(
        "product_creation_attempt",
        title=product.title,
        category_uuid=product.categoryUuid
    )

    try:
        productUuid = create_product(
            product.model_dump()
        )

        if productUuid is None:
            log.warning(
                "product_creation_failed",
                title=product.title,
                category_uuid=product.categoryUuid,
                reason="category_not_found"
            )

            return {
                "message": "Category not found"
            }

        log.info(
            "product_created",
            product_uuid=productUuid,
            title=product.title,
            category_uuid=product.categoryUuid
        )

        return {
            "message": "Product created successfully",
            "productUuid": productUuid
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "product_creation_error",
            title=product.title,
            category_uuid=product.categoryUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create product"
        )


@router.get("/products")
def read_products(category: str = None):

    log.info(
        "products_retrieval_attempt",
        category=category
    )

    try:
        products = get_products(category)

        log.info(
            "products_retrieved",
            category=category
        )

        return products

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "products_retrieval_error",
            category=category
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve products"
        )


@router.get("/products/{productUuid}")
def read_product(productUuid: str):

    log.info(
        "product_retrieval_attempt",
        product_uuid=productUuid
    )

    try:
        product = get_product(productUuid)

        if product:
            log.info(
                "product_retrieved",
                product_uuid=productUuid
            )

            return product

        log.warning(
            "product_not_found",
            product_uuid=productUuid
        )

        return {
            "message": "Product not found"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "product_retrieval_error",
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve product"
        )


@router.put("/admin/products/{productUuid}")
def update_product_route(
    productUuid: str,
    product: ProductUpdate,
    current_admin=Depends(get_current_admin)
):

    update_data = product.model_dump(
        exclude_none=True
    )

    log.info(
        "product_update_attempt",
        product_uuid=productUuid,
        fields=list(update_data.keys())
    )

    try:
        result = update_product(
            productUuid,
            update_data
        )

        if result is None:
            log.warning(
                "product_update_failed",
                product_uuid=productUuid,
                reason="category_not_found"
            )

            return {
                "message": "Category not found"
            }

        if result.matched_count == 0:
            log.warning(
                "product_update_failed",
                product_uuid=productUuid,
                reason="product_not_found"
            )

            return {
                "message": "Product not found"
            }

        if result.modified_count == 0:
            log.info(
                "product_update_no_changes",
                product_uuid=productUuid
            )

            return {
                "message": "No changes made"
            }

        log.info(
            "product_updated",
            product_uuid=productUuid,
            fields=list(update_data.keys())
        )

        return {
            "message": "Product updated successfully"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "product_update_error",
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update product"
        )


@router.delete("/admin/products/{productUuid}")
def delete_product_route(
    productUuid: str,
    current_admin=Depends(get_current_admin)
):

    log.info(
        "product_deletion_attempt",
        product_uuid=productUuid
    )

    try:
        result = delete_product(productUuid)

        if result.deleted_count == 1:

            log.info(
                "product_deleted",
                product_uuid=productUuid
            )

            return {
                "message": "Product deleted successfully"
            }

        log.warning(
            "product_deletion_failed",
            product_uuid=productUuid,
            reason="product_not_found"
        )

        return {
            "message": "Product not found"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "product_deletion_error",
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete product"
        )