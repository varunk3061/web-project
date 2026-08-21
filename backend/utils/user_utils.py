from database import db
from fastapi import HTTPException


def get_user_by_uuid(userUuid):

    user_collection = db["users"]

    user = user_collection.find_one(
        {
            "userUuid": userUuid
        }
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user