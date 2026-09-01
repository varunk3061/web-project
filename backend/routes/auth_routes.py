from fastapi import APIRouter,HTTPException,Depends
from schemas.user_schema import User, UserLogin, UserProfileUpdate, UserAddress
from services.auth_services import register_user,login_user
from dependencies.auth import get_current_user,get_current_admin

from bson import ObjectId

from database import db





router = APIRouter()


@router.post("/auth/register")
def register(user: User):

    user_data = user.model_dump()

    user_id = register_user(user_data)



    if user_id is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered or password too long"
        )


    return {
        "message": "User Registered Successfully",
        "user_id": str(user_id)
    }

@router.post("/auth/login")
def login(user: UserLogin): #userlogin is pydantic model for login data validation and create a user pydantic model

    user_data = user.model_dump() #it converts the pydantic model into dictionary fromat

    result = login_user(user_data)


    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    return {
    "message": "Login successful",
    "access_token": result
    }


# @router.get("/profile")
# def profile(
#     current_user = Depends(get_current_user)
# ):

#     return { #return the payload data form auth.py file which is decoded from the JWT token sent by the frontend in the request header.
#         "message": "Profile data",
#         "user": current_user
#     }


@router.get("/profile")
def profile(current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    user_collection = db["users"]

    user = user_collection.find_one({
        "userUuid": user_uuid
    })

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "name": user["name"],
        "email": user["email"]
    }


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):

    user_collection = db["users"]

    user = user_collection.find_one({
        "userUuid": current_user["userUuid"]
    })

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "userUuid": user["userUuid"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone"),
        "address": user.get("address"),
        "role": user["role"]
    }

@router.put("/me")
def update_profile(
    profile: UserProfileUpdate,
    current_user=Depends(get_current_user)
):

    user_collection = db["users"]

    result = user_collection.update_one(
        {
            "userUuid": current_user["userUuid"]
        },
        {
            "$set": {
                "name": profile.name,
                "phone": profile.phone
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Profile updated successfully"
    }


@router.put("/me/address")
def update_address(
    address: UserAddress,
    current_user=Depends(get_current_user)
):

    user_collection = db["users"]

    result = user_collection.update_one(
        {
            "userUuid": current_user["userUuid"]
        },
        {
            "$set": {
                "address": address.model_dump()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Address saved successfully"
    }




@router.get("/admin-test")
def admin_test(current_user=Depends(get_current_admin)): #Protected + role restricted — the user must be authenticated and have the required admin role.
    return {
        "message": "Welcome Admin",
        "user": current_user
    }

@router.get("/admin/users")
def get_all_users(current_user=Depends(get_current_admin)):

    user_collection = db["users"]

    users = user_collection.find(
        {},
        {
            "_id": 0,
            "passwordHash": 0
        }
    )

    return list(users)