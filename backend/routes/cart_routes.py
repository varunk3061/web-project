from fastapi import APIRouter, Depends

from schemas.cart_schema import CartItem

from services.cart_services import (
    add_to_cart,
    get_cart,
    update_cart_quantity,
    remove_from_cart
)

from dependencies.auth import get_current_user
from utils.user_utils import get_user_by_uuid


router = APIRouter()


@router.post("/cart")
def add_cart_item(
    cart_item: CartItem,
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return add_to_cart(
        user_id,
        cart_item.productUuid,
        cart_item.variantUuid,
        cart_item.quantity
    )


@router.get("/cart")
def read_cart(
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return get_cart(user_id)


@router.put("/cart/{productUuid}")
def update_cart_item(
    productUuid: str,
    quantity: int,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return update_cart_quantity(
        user_id,
        productUuid,
        variantUuid,
        quantity
    )


@router.delete("/cart/{productUuid}")
def delete_cart_item(
    productUuid: str,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return remove_from_cart(
        user_id,
        productUuid,
        variantUuid
    )