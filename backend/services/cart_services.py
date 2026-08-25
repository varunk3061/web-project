from database import db
from uuid import uuid4
from datetime import datetime


def add_to_cart(user_uuid, productUuid, variantUuid, quantity):

    cart_collection = db["carts"]
    product_collection = db["products"]

    # Find product using public UUID
    product = product_collection.find_one({
        "productUuid": productUuid
    })

    if product is None:
        return {
            "message": "Product not found"
        }

    # --------------------------------
    # Find selected variant
    # --------------------------------

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

    # --------------------------------
    # Determine price
    # --------------------------------

    if selected_variant:

        price = selected_variant["price"]

    else:

        price = product["price"]

    # --------------------------------
    # Determine stock
    # --------------------------------

    if selected_variant:

        stock = selected_variant["stock"]

    else:

        stock = product["stock"]

    # --------------------------------
    # Check stock
    # --------------------------------

    if stock < quantity:

        return {
            "message": "Not enough stock available"
        }

    # --------------------------------
    # Find user's cart
    # --------------------------------

    cart = cart_collection.find_one({
        "userUuid": user_uuid
    })

    # --------------------------------
    # Cart doesn't exist
    # --------------------------------

    if cart is None:

        cart_collection.insert_one({

            "cartUuid": str(uuid4()),

            "userUuid": user_uuid,

            "items": [
                {
                    "productUuid": productUuid,

                    "variantUuid": variantUuid,

                    "title": product["title"],

                    "price": price,

                    "quantity": quantity
                }
            ],

            "updatedAt": datetime.utcnow()
        })

        return {
            "message": "Product added to cart"
        }

    # --------------------------------
    # Check if same product + variant
    # already exists
    # --------------------------------

    for item in cart["items"]:

        if (
            item["productUuid"] == productUuid
            and
            item.get("variantUuid") == variantUuid
        ):

            new_quantity = (
                item["quantity"] + quantity
            )

            if new_quantity > stock:

                return {
                    "message": "Not enough stock available"
                }

            cart_collection.update_one(

                {
                    "userUuid": user_uuid,
                    "items": {
                        "$elemMatch": {
                            "productUuid": productUuid,
                            "variantUuid": variantUuid
                        }
                    }
                },

                {
                    "$set": {
                        "updatedAt": datetime.utcnow()
                    },

                    "$inc": {
                        "items.$.quantity": quantity
                    }
                }
            )

            return {
                "message": "Product quantity increased"
            }

    # --------------------------------
    # Product/variant doesn't exist
    # in cart
    # --------------------------------

    cart_collection.update_one(

        {
            "userUuid": user_uuid
        },

        {
            "$push": {
                "items": {

                    "productUuid": productUuid,

                    "variantUuid": variantUuid,

                    "title": product["title"],

                    "price": price,

                    "quantity": quantity
                }
            },

            "$set": {
                "updatedAt": datetime.utcnow()
            }
        }
    )

    return {
        "message": "Product added to cart"
    }


def update_cart_quantity(
    user_uuid,
    productUuid,
    variantUuid,
    quantity
):

    if quantity < 1:

        return {
            "message": "Quantity must be at least 1"
        }

    cart_collection = db["carts"]
    product_collection = db["products"]

    product = product_collection.find_one({
        "productUuid": productUuid
    })

    if product is None:

        return {
            "message": "Product not found"
        }

    # --------------------------------
    # Find stock
    # --------------------------------

    stock = product["stock"]

    if variantUuid:

        variant = None

        for product_variant in product.get(
            "variants",
            []
        ):

            if (
                product_variant.get("variantUuid")== variantUuid):

                variant = product_variant

                break

        if variant is None:

            return {
                "message": "Variant not found"
            }

        stock = variant["stock"]

    # --------------------------------
    # Check stock
    # --------------------------------

    if quantity > stock:

        return {
            "message": "Not enough stock available"
        }

    # --------------------------------
    # Update correct cart item
    # --------------------------------

    result = cart_collection.update_one(

        {
            "userUuid": user_uuid,
            "items": {
                "$elemMatch": {
                    "productUuid": productUuid,
                    "variantUuid": variantUuid
                }
            }
        },

        {
            "$set": {
                "items.$.quantity": quantity,
                "updatedAt": datetime.utcnow()
            }
        }
    )

    if result.modified_count == 1:

        return {
            "message": "Cart quantity updated successfully"
        }

    return {
        "message": "Cart item not found"
    }


def get_cart(user_uuid):

    cart_collection = db["carts"]
    product_collection = db["products"]

    cart = cart_collection.find_one({
        "userUuid": user_uuid
    })

    if cart is None:

        return {
            "items": []
        }

    cart_items = []

    for item in cart["items"]:

        product = product_collection.find_one({
            "productUuid": item["productUuid"]
        })

        if product:

            variant = None

            variantUuid = item.get("variantUuid")

            if variantUuid:

                for product_variant in product.get("variants",[]):

                    if (
                        product_variant.get("variantUuid")== variantUuid
                    ):

                        variant = product_variant

                        break

            cart_items.append({

                "productUuid":product["productUuid"],

                "variantUuid":variantUuid,

                "title":item["title"],

                "price":item["price"],

                "imageUrls":product.get("imageUrls"),

                "quantity":item["quantity"],

                "attributes":
                    variant.get("attributes", {})
                    if variant
                    else {}
            })

    return {
        "cartUuid": cart["cartUuid"],
        "items": cart_items
    }


def remove_from_cart(
    user_uuid,
    productUuid,
    variantUuid=None
):

    cart_collection = db["carts"]

    # --------------------------------
    # Remove specific variant
    # --------------------------------

    if variantUuid:

        result = cart_collection.update_one(

            {
                "userUuid": user_uuid
            },

            {
                "$pull": {
                    "items": {
                        "productUuid": productUuid,
                        "variantUuid": variantUuid
                    }
                },

                "$set": {
                    "updatedAt": datetime.utcnow()
                }
            }
        )

    # --------------------------------
    # Remove normal product
    # --------------------------------

    else:

        result = cart_collection.update_one(

            {
                "userUuid": user_uuid
            },

            {
                "$pull": {
                    "items": {
                        "productUuid": productUuid,
                        "variantUuid": None
                    }
                },

                "$set": {
                    "updatedAt": datetime.utcnow()
                }
            }
        )

    if result.modified_count == 1:

        return {
            "message": "Product removed from cart"
        }

    return {
        "message": "Cart item not found"
    }