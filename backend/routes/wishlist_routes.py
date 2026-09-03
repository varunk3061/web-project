from fastapi import APIRouter, Depends, HTTPException

from schemas.wishlist_schema import WishlistItem

from services.wishlist_services import (
    add_to_wishlist,
    get_wishlist,
    remove_from_wishlist
)

from dependencies.auth import get_current_user

from logging_config import log


router = APIRouter()


@router.post("/wishlist")
def add_wishlist_item(
    wishlist_item: WishlistItem,
    current_user=Depends(get_current_user)
):
    user_uuid = current_user["userUuid"]

    log.info(
        "wishlist_item_add_attempt",
        user_uuid=user_uuid,
        product_uuid=wishlist_item.productUuid,
        variant_uuid=wishlist_item.variantUuid
    )

    try:
        result = add_to_wishlist(
            user_uuid,
            wishlist_item.productUuid,
            wishlist_item.variantUuid
        )

        log.info(
            "wishlist_item_added",
            user_uuid=user_uuid,
            product_uuid=wishlist_item.productUuid,
            variant_uuid=wishlist_item.variantUuid
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "wishlist_item_add_error",
            user_uuid=user_uuid,
            product_uuid=wishlist_item.productUuid,
            variant_uuid=wishlist_item.variantUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to add item to wishlist"
        )


@router.get("/wishlist")
def read_wishlist(
    current_user=Depends(get_current_user)
):
    user_uuid = current_user["userUuid"]

    log.info(
        "wishlist_retrieval_attempt",
        user_uuid=user_uuid
    )

    try:
        result = get_wishlist(user_uuid)

        log.info(
            "wishlist_retrieved",
            user_uuid=user_uuid
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "wishlist_retrieval_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve wishlist"
        )


@router.delete("/wishlist/{productUuid}")
def delete_wishlist_item(
    productUuid: str,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):
    user_uuid = current_user["userUuid"]

    log.info(
        "wishlist_item_remove_attempt",
        user_uuid=user_uuid,
        product_uuid=productUuid,
        variant_uuid=variantUuid
    )

    try:
        result = remove_from_wishlist(
            user_uuid,
            productUuid,
            variantUuid
        )

        log.info(
            "wishlist_item_removed",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "wishlist_item_remove_error",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to remove item from wishlist"
        )