from database import db
from utils.uuid_utils import generate_uuid
from datetime import datetime


def create_category(category_data):

    category_collection = db["categories"]

    category_data["categoryUuid"] = generate_uuid()
    category_data["createdAt"] = datetime.utcnow()

    category_collection.insert_one(category_data)

    return category_data["categoryUuid"]


def get_categories():

    category_collection = db["categories"]

    categories = list(
        category_collection.find(
            {},
            {
                "_id": 0,
                "categoryUuid": 1,
                "name": 1,
                "createdAt": 1
            }
        )
    )

    return categories


def update_category(categoryUuid, category_data):

    category_collection = db["categories"]

    result = category_collection.update_one(
        {
            "categoryUuid": categoryUuid
        },
        {
            "$set": category_data
        }
    )

    if result.matched_count == 0:
        return None

    return True


def delete_category(categoryUuid):

    category_collection = db["categories"]

    result = category_collection.delete_one(
        {
            "categoryUuid": categoryUuid
        }
    )

    if result.deleted_count == 0:
        return None

    return True