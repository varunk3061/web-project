from database import db
from passlib.context import CryptContext
from utils.jwt import create_access_token
from utils.uuid_utils import generate_uuid
from datetime import datetime

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def register_user(user_data):

    user_collection = db["users"]

    # Check duplicate email
    existing_user = user_collection.find_one(
        {
            "email": user_data["email"]
        }
    )

    if existing_user:
        return None

    # Handle long password
    password = user_data["password"]

    if len(password.encode("utf-8")) > 72:
        return None

    # Hash password
    user_data["passwordHash"] = pwd_context.hash(password)

    # Remove plain password
    user_data.pop("password")

    # Add default role
    user_data["role"] = "customer"

    # Generate public UUID
    user_data["userUuid"] = generate_uuid()

    user_data["createdAt"] = datetime.utcnow()

    result = user_collection.insert_one(user_data)

    return result.inserted_id


def login_user(user_data):

    user_collection = db["users"]

    # Find user by email
    user = user_collection.find_one(
        {
            "email": user_data["email"]
        }
    )

    if user is None:
        return None

    # Compare password
    password_match = pwd_context.verify(
        user_data["password"],
        user["passwordHash"]
    )

    if not password_match:
        return None

    # Create JWT token
    token_data = {
        "userUuid": user["userUuid"],
        "email": user["email"],
        "role": user["role"]
    }

    token = create_access_token(token_data)

    return token