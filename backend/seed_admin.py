from database import db
from passlib.context import CryptContext
from utils.uuid_utils import generate_uuid


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


user_collection = db["users"]


admin_email = "admin@example.com"
admin_password = "admin123"
admin_name = "Admin"


# Check if admin already exists
existing_admin = user_collection.find_one({
    "email": admin_email
})


if existing_admin:

    if existing_admin.get("role") == "admin":
        print("Admin already exists.")

    else:
        print("User with this email already exists but is not an admin.")

else:

    password_hash = pwd_context.hash(admin_password)

    admin_data = {
        "name": admin_name,
        "email": admin_email,
        "passwordHash": password_hash,
        "role": "admin",
        "userUuid": generate_uuid()
    }

    result = user_collection.insert_one(admin_data)

    print("Admin created successfully.")
    print("Admin ID:", result.inserted_id)