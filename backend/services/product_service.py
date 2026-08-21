from database import db
from bson import ObjectId
from uuid import uuid4


# def create_product(product):
#     product_collection = db["products"]
#     product["productUuid"] = str(uuid4())
#     result = product_collection.insert_one(product)
#     return product["productUuid"]

def create_product(product):

    product_collection = db["products"]
    category_collection = db["categories"]

    categoryUuid = product.get("categoryUuid")

    if categoryUuid:

        category = category_collection.find_one(
            {
                "categoryUuid": categoryUuid
            }
        )

        if not category:
            return None

    # Generate product UUID
    product["productUuid"] = str(uuid4())

    # Generate UUID for every variant
    for variant in product.get("variants", []):

        variant["variantUuid"] = str(uuid4())

    product_collection.insert_one(product)

    return product["productUuid"]

def get_products(category=None):

    print("CATEGORY RECEIVED:", category)

    product_collection = db["products"]

    query = {}

    if category:

        category_collection = db["categories"]

        category_data = category_collection.find_one({
            "name": category
        })

        print("CATEGORY FOUND:", category_data)

        if not category_data:
            print("CATEGORY NOT FOUND")
            return []

        categoryUuid = category_data["categoryUuid"]

        print("CATEGORY UUID:", categoryUuid)

        query["categoryUuid"] = categoryUuid

   

    products = list(
        product_collection.find(
            query,
            {
                    "_id": 0,
                    "productUuid": 1,
                    "title": 1,
                    "description": 1,
                    "price": 1,
                    "categoryUuid": 1,
                    "brand": 1,
                    "imageUrls": 1,
                    "stock": 1,
                    "rating": 1,
                    "numReviews": 1,
                    "variants": 1,
                    "createdAt": 1
            }
        )
    )



    return products

def get_product(productUuid):
    product_collection = db["products"]

    product = product_collection.find_one(
        {
            "productUuid": productUuid
        },
        {
            "_id": 0
        }
    )

    return product


# def update_product(productUuid, product_data):

#     product_collection = db["products"]

#     result = product_collection.update_one(
#         {
#             "productUuid": productUuid
#         },
#         {
#             "$set": product_data
#         }
#     )

#     return result


def update_product(productUuid, product_data):

    product_collection = db["products"]
    category_collection = db["categories"]

    categoryUuid = product_data.get("categoryUuid")

    # Check category
    if categoryUuid:

        category = category_collection.find_one(
            {
                "categoryUuid": categoryUuid
            }
        )

        if not category:
            return None

    # Generate UUID for variants
    if "variants" in product_data:

        for variant in product_data["variants"]:

            # Generate only if variant doesn't already have UUID
            if not variant.get("variantUuid"):
                variant["variantUuid"] = str(uuid4())

    result = product_collection.update_one(
        {
            "productUuid": productUuid
        },
        {
            "$set": product_data
        }
    )

    return result

def delete_product(productUuid):

    product_collection = db["products"]

    result = product_collection.delete_one(
        {
            "productUuid": productUuid
        }
    )

    return result


