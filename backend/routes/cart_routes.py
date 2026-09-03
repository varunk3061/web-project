from fastapi import APIRouter, Depends, HTTPException

from schemas.cart_schema import CartItem

from services.cart_services import (
    add_to_cart,
    get_cart,
    update_cart_quantity,
    remove_from_cart
)

from dependencies.auth import get_current_user
from logging_config import log


router = APIRouter()


@router.post("/cart")
def add_cart_item(
    cart_item: CartItem,
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "add_to_cart_attempt",
        user_uuid=user_uuid,
        product_uuid=cart_item.productUuid,
        variant_uuid=cart_item.variantUuid,
        quantity=cart_item.quantity
    )

    try:
        result = add_to_cart(
            user_uuid,
            cart_item.productUuid,
            cart_item.variantUuid,
            cart_item.quantity
        )

        log.info(
            "cart_item_added",
            user_uuid=user_uuid,
            product_uuid=cart_item.productUuid,
            variant_uuid=cart_item.variantUuid,
            quantity=cart_item.quantity
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "add_to_cart_error",
            user_uuid=user_uuid,
            product_uuid=cart_item.productUuid,
            variant_uuid=cart_item.variantUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to add item to cart"
        )


@router.get("/cart")
def read_cart(
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.debug(
        "cart_retrieval_attempt",
        user_uuid=user_uuid
    )

    try:
        result = get_cart(user_uuid)

        log.info(
            "cart_retrieved",
            user_uuid=user_uuid
        )

        return result

    except Exception:
        log.exception(
            "cart_retrieval_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve cart"
        )


@router.put("/cart/{productUuid}")
def update_cart_item(
    productUuid: str,
    quantity: int,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "cart_quantity_update_attempt",
        user_uuid=user_uuid,
        product_uuid=productUuid,
        variant_uuid=variantUuid,
        quantity=quantity
    )

    try:
        result = update_cart_quantity(
            user_uuid,
            productUuid,
            variantUuid,
            quantity
        )

        log.info(
            "cart_quantity_updated",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid,
            quantity=quantity
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "cart_quantity_update_error",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update cart quantity"
        )


@router.delete("/cart/{productUuid}")
def delete_cart_item(
    productUuid: str,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "remove_from_cart_attempt",
        user_uuid=user_uuid,
        product_uuid=productUuid,
        variant_uuid=variantUuid
    )

    try:
        result = remove_from_cart(
            user_uuid,
            productUuid,
            variantUuid
        )

        log.info(
            "cart_item_removed",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "remove_from_cart_error",
            user_uuid=user_uuid,
            product_uuid=productUuid,
            variant_uuid=variantUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to remove item from cart"
        )