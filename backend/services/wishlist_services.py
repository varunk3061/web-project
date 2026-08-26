from database import db
from uuid import uuid4
from datetime import datetime


def add_to_wishlist(
    user_uuid,
    productUuid,
    variantUuid=None
):

    wishlist_collection = db["wishlists"]
    product_collection = db["products"]

    # Find product using public UUID
    product = product_collection.find_one({
        "productUuid": productUuid
    })

    if product is None:
        return {
            "message": "Product not found"
        }

    # -----------------------------
    # Check variant
    # -----------------------------

    selected_variant = None

    if variantUuid:

        for variant in product.get("variants", []):

            if variant.get("variantUuid") == variantUuid:

                selected_variant = variant
                break

        if selected_variant is None:
            return {
                "message": "Variant not found"
            }

    # -----------------------------
    # Find wishlist
    # -----------------------------

    wishlist = wishlist_collection.find_one({
        "userUuid": user_uuid
    })

    # -----------------------------
    # Create wishlist
    # -----------------------------

    if wishlist is None:

        wishlist_collection.insert_one({

            "wishlistUuid": str(uuid4()),

            "userUuid": user_uuid,

            "items": [
                {
                    "productUuid": productUuid,
                    "variantUuid": variantUuid,
                    "addedAt": datetime.utcnow()
                }
            ]
        })

        return {
            "message": "Product added to wishlist"
        }

    # -----------------------------
    # Check existing product+variant
    # -----------------------------

    for item in wishlist["items"]:

        if (
            item["productUuid"] == productUuid
            and
            item.get("variantUuid") == variantUuid
        ):

            return {
                "message": "Product already in wishlist"
            }

    # -----------------------------
    # Add new item
    # -----------------------------

    wishlist_collection.update_one(

        {
            "userUuid": user_uuid
        },

        {
            "$push": {
                "items": {
                    "productUuid": productUuid,
                    "variantUuid": variantUuid,
                    "addedAt": datetime.utcnow()
                }
            }
        }
    )

    return {
        "message": "Product added to wishlist"
    }


def get_wishlist(user_uuid):

    wishlist_collection = db["wishlists"]
    product_collection = db["products"]

    wishlist = wishlist_collection.find_one({
        "userUuid": user_uuid
    })

    if wishlist is None:
        return {
            "items": []
        }

    wishlist_items = []

    for item in wishlist["items"]:

        product = product_collection.find_one({
            "productUuid": item["productUuid"]
        })

        if product:

            # -----------------------------
            # FIND SELECTED VARIANT
            # -----------------------------

            selected_variant = None

            variant_uuid = item.get("variantUuid")

            if variant_uuid:

                for variant in product.get("variants", []):

                    if variant.get("variantUuid") == variant_uuid:

                        selected_variant = variant
                        break

            # -----------------------------
            # DETERMINE PRICE
            # -----------------------------

            if selected_variant:

                display_price = selected_variant["price"]

            else:

                display_price = product["price"]

            # -----------------------------
            # ADD ITEM
            # -----------------------------

            wishlist_items.append({

                "productUuid":
                    product["productUuid"],

                "variantUuid":
                    item.get("variantUuid"),

                "title":
                    product["title"],

                "price":
                    display_price,

                "imageUrls":
                    product.get("imageUrls"),

                "rating":
                    product.get("rating", 0)
            })

    return {

        "wishlistUuid":
            wishlist["wishlistUuid"],

        "items":
            wishlist_items
    }

def remove_from_wishlist(
    user_uuid,
    productUuid,
    variantUuid=None
):

    wishlist_collection = db["wishlists"]

    if variantUuid is None:

        result = wishlist_collection.update_one(
            {
                "userUuid": user_uuid
            },
            {
                "$pull": {
                    "items": {
                        "productUuid": productUuid,
                        "variantUuid": None
                    }
                }
            }
        )

    else:

        result = wishlist_collection.update_one(
            {
                "userUuid": user_uuid
            },
            {
                "$pull": {
                    "items": {
                        "productUuid": productUuid,
                        "variantUuid": variantUuid
                    }
                }
            }
        )

    if result.modified_count == 1:

        return {
            "message": "Product removed from wishlist"
        }

    return {
        "message": "Product not found in wishlist"
    }

   