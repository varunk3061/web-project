from fastapi import APIRouter, Depends

from schemas.wishlist_schema import WishlistItem

from services.wishlist_services import (add_to_wishlist,get_wishlist,remove_from_wishlist)

from dependencies.auth import get_current_user



router = APIRouter()


@router.post("/wishlist")
def add_wishlist_item(wishlist_item: WishlistItem,current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    return add_to_wishlist(
        user_uuid,
        wishlist_item.productUuid,
        wishlist_item.variantUuid
    )


@router.get("/wishlist")
def read_wishlist(current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    return get_wishlist(user_uuid)


@router.delete("/wishlist/{productUuid}")
def delete_wishlist_item(productUuid: str,variantUuid: str = None,current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    return remove_from_wishlist(
        user_uuid,
        productUuid,
        variantUuid   
    )