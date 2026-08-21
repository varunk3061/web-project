from fastapi import APIRouter, Depends

from schemas.address_schema import Address
from services.address_services import create_address,get_address,update_address
from dependencies.auth import get_current_user


router = APIRouter()


@router.post("/address")
def add_address(address: Address,current_user=Depends(get_current_user)):

    user_id = current_user["user_id"]

    result = create_address(
        user_id,
        address.model_dump()
    )

    return {
        "message": "Address saved successfully"
    }


@router.get("/address")
def read_address(
    current_user=Depends(get_current_user)
):

    user_id = current_user["user_id"]

    address = get_address(user_id)

    if address is None:
        return {
            "message": "Address not found"
        }

    address["_id"] = str(address["_id"])

    return address

@router.put("/address")
def update_user_address(
    address: Address,
    current_user=Depends(get_current_user)
):

    user_id = current_user["user_id"]

    result = update_address(
        user_id,
        address.model_dump()
    )

    return {
        "message": "Address updated successfully"
    }