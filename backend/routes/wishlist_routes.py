from fastapi import APIRouter, Depends

from schemas.wishlist_schema import WishlistItem

from services.wishlist_services import (
    add_to_wishlist,
    get_wishlist,
    remove_from_wishlist
)

from dependencies.auth import get_current_user
from utils.user_utils import get_user_by_uuid


router = APIRouter()


@router.post("/wishlist")
def add_wishlist_item(
    wishlist_item: WishlistItem,
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return add_to_wishlist(
        user_id,
        wishlist_item.productUuid,
        wishlist_item.variantUuid
    )


@router.get("/wishlist")
def read_wishlist(
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return get_wishlist(user_id)


@router.delete("/wishlist/{productUuid}")
def delete_wishlist_item(
    productUuid: str,
    variantUuid: str = None,
    current_user=Depends(get_current_user)
):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return remove_from_wishlist(
        user_id,
        productUuid,
        variantUuid
    )