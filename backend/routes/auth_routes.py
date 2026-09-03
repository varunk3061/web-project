from fastapi import APIRouter, HTTPException, Depends
from schemas.user_schema import User, UserLogin, UserProfileUpdate, UserAddress
from services.auth_services import register_user, login_user
from dependencies.auth import get_current_user, get_current_admin
from logging_config import log
from database import db


router = APIRouter()


@router.post("/auth/register")
def register(user: User):

    log.info(
        "registration_attempt",
        email=user.email
    )

    try:
        user_data = user.model_dump()

        user_id = register_user(user_data)

        if user_id is None:
            log.warning(
                "registration_failed",
                email=user.email,
                reason="email_already_registered_or_invalid_password"
            )

            raise HTTPException(
                status_code=400,
                detail="Email already registered or password too long"
            )

        log.info(
            "registration_success",
            email=user.email,
            user_id=str(user_id)
        )

        return {
            "message": "User Registered Successfully",
            "user_id": str(user_id)
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "registration_unexpected_error",
            email=user.email
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/auth/login")
def login(user: UserLogin):

    log.info(
        "login_attempt",
        email=user.email
    )

    try:
        user_data = user.model_dump()

        result = login_user(user_data)

        if result is None:
            log.warning(
                "login_failed",
                email=user.email,
                reason="invalid_email_or_password"
            )

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        log.info(
            "login_success",
            email=user.email
        )

        return {
            "message": "Login successful",
            "access_token": result
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "login_unexpected_error",
            email=user.email
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.get("/profile")
def profile(current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    log.debug(
        "profile_request",
        user_uuid=user_uuid
    )

    try:
        user_collection = db["users"]

        user = user_collection.find_one({
            "userUuid": user_uuid
        })

        if user is None:
            log.warning(
                "profile_user_not_found",
                user_uuid=user_uuid
            )

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        log.info(
            "profile_retrieved",
            user_uuid=user_uuid
        )

        return {
            "name": user["name"],
            "email": user["email"]
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "profile_database_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):

    user_uuid = current_user["userUuid"]

    log.debug(
        "get_me_request",
        user_uuid=user_uuid
    )

    try:
        user_collection = db["users"]

        user = user_collection.find_one({
            "userUuid": user_uuid
        })

        if user is None:
            log.warning(
                "get_me_user_not_found",
                user_uuid=user_uuid
            )

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        log.info(
            "get_me_success",
            user_uuid=user_uuid
        )

        return {
            "userUuid": user["userUuid"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "address": user.get("address"),
            "role": user["role"]
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "get_me_database_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.put("/me")
def update_profile(
    profile: UserProfileUpdate,
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "profile_update_attempt",
        user_uuid=user_uuid
    )

    try:
        user_collection = db["users"]

        result = user_collection.update_one(
            {
                "userUuid": user_uuid
            },
            {
                "$set": {
                    "name": profile.name,
                    "phone": profile.phone
                }
            }
        )

        if result.matched_count == 0:
            log.warning(
                "profile_update_failed",
                user_uuid=user_uuid,
                reason="user_not_found"
            )

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        log.info(
            "profile_update_success",
            user_uuid=user_uuid
        )

        return {
            "message": "Profile updated successfully"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "profile_update_database_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.put("/me/address")
def update_address(
    address: UserAddress,
    current_user=Depends(get_current_user)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "address_update_attempt",
        user_uuid=user_uuid
    )

    try:
        user_collection = db["users"]

        result = user_collection.update_one(
            {
                "userUuid": user_uuid
            },
            {
                "$set": {
                    "address": address.model_dump()
                }
            }
        )

        if result.matched_count == 0:
            log.warning(
                "address_update_failed",
                user_uuid=user_uuid,
                reason="user_not_found"
            )

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        log.info(
            "address_update_success",
            user_uuid=user_uuid
        )

        return {
            "message": "Address saved successfully"
        }

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "address_update_database_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.get("/admin-test")
def admin_test(
    current_user=Depends(get_current_admin)
):

    user_uuid = current_user["userUuid"]

    log.info(
        "admin_test_access",
        user_uuid=user_uuid,
        role=current_user.get("role")
    )

    return {
        "message": "Welcome Admin",
        "user": current_user
    }


@router.get("/admin/users")
def get_all_users(
    current_user=Depends(get_current_admin)
):

    admin_uuid = current_user["userUuid"]

    log.info(
        "admin_users_request",
        admin_uuid=admin_uuid
    )

    try:
        user_collection = db["users"]

        users = user_collection.find(
            {},
            {
                "_id": 0,
                "passwordHash": 0
            }
        )

        users_list = list(users)

        log.info(
            "admin_users_retrieved",
            admin_uuid=admin_uuid,
            user_count=len(users_list)
        )

        return users_list

    except Exception:
        log.exception(
            "admin_users_database_error",
            admin_uuid=admin_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )