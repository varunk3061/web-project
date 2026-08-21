from fastapi import APIRouter, Depends

from schemas.order_schema import OrderCreate,OrderStatusUpdate

from services.order_services import (create_order,get_orders,get_all_orders,update_order_status)

from dependencies.auth import get_current_user,get_current_admin
from utils.user_utils import get_user_by_uuid


router = APIRouter()


@router.post("/orders")
def place_order(order: OrderCreate,current_user=Depends(get_current_user)):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return create_order(
        user_id,
        order.shippingAddress.model_dump(),
        order.productUuid,
        order.quantity
    )

@router.get("/orders")
def read_orders(current_user=Depends(get_current_user)):

    user = get_user_by_uuid(
        current_user["userUuid"]
    )

    user_id = user["_id"]

    return get_orders(user_id)

@router.get("/admin/orders")
def read_all_orders(current_admin=Depends(get_current_admin)):

    return get_all_orders()

@router.put("/admin/orders/{orderUuid}/status")
def change_order_status(orderUuid: str,order_status: OrderStatusUpdate,current_admin=Depends(get_current_admin)):

    return update_order_status(
        orderUuid,
        order_status.status
    )