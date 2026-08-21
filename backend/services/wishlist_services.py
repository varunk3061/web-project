from database import db
from uuid import uuid4
from datetime import datetime


def add_to_wishlist(
    user_id,
    productUuid,
    variantUuid=None
):

    wishlist_collection = db["wishlists"]
    product_collection = db["products"]

    # Find product
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
        "userId": user_id
    })

    # -----------------------------
    # Create wishlist
    # -----------------------------

    if wishlist is None:

        wishlist_collection.insert_one({

            "wishlistUuid": str(uuid4()),

            "userId": user_id,

            "items": [
                {
                    "productId": product["_id"],
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
            item["productId"] == product["_id"]
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
            "userId": user_id
        },

        {
            "$push": {
                "items": {
                    "productId": product["_id"],
                    "variantUuid": variantUuid,
                    "addedAt": datetime.utcnow()
                }
            }
        }
    )

    return {
        "message": "Product added to wishlist"
    }

def get_wishlist(user_id):

    wishlist_collection = db["wishlists"]
    product_collection = db["products"]

    # Find user's wishlist
    wishlist = wishlist_collection.find_one({
        "userId": user_id
    })

    # Wishlist doesn't exist
    if wishlist is None:
        return {
            "items": []
        }

    wishlist_items = []

    # Go through every wishlist item
    for item in wishlist["items"]:

        # Find current product
        product = product_collection.find_one({
            "_id": item["productId"]
        })

        if product:

            # --------------------------------
            # DETERMINE DISPLAY PRICE
            # --------------------------------

            variants = product.get("variants", [])

            if variants:

                # Get prices of all variants
                prices = [
                    variant["price"]
                    for variant in variants
                    if "price" in variant
                ]

                # Lowest variant price
                if prices:
                    display_price = min(prices)
                else:
                    display_price = product["price"]

            else:

                # Product has no variants
                display_price = product["price"]

            # --------------------------------
            # ADD PRODUCT TO WISHLIST RESPONSE
            # --------------------------------

            wishlist_items.append({

                "productUuid":
                    product["productUuid"],

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
    user_id,
    productUuid,
    variantUuid=None
):

    wishlist_collection = db["wishlists"]
    product_collection = db["products"]

    product = product_collection.find_one({
        "productUuid": productUuid
    })

    if product is None:
        return {
            "message": "Product not found"
        }

    result = wishlist_collection.update_one(

        {
            "userId": user_id
        },

        {
            "$pull": {
                "items": {
                    "productId": product["_id"],
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