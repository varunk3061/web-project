from fastapi import APIRouter, Depends, HTTPException

from schemas.order_schema import (
    OrderCreate,
    OrderStatusUpdate
)

from services.order_services import (
    create_order,
    get_orders,
    get_all_orders,
    update_order_status
)

from dependencies.auth import (
    get_current_user,
    get_current_admin
)

from logging_config import log


router = APIRouter()


@router.post("/orders")
def place_order(
    order: OrderCreate,
    current_user=Depends(get_current_user)
):
    user_uuid = current_user["userUuid"]

    log.info(
        "order_creation_attempt",
        user_uuid=user_uuid,
        product_uuid=order.productUuid,
        quantity=order.quantity
    )

    try:
        result = create_order(
            user_uuid,
            order.shippingAddress.model_dump(),
            order.productUuid,
            order.quantity
        )

        log.info(
            "order_created",
            user_uuid=user_uuid,
            product_uuid=order.productUuid,
            quantity=order.quantity
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "order_creation_error",
            user_uuid=user_uuid,
            product_uuid=order.productUuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )


@router.get("/orders")
def read_orders(
    current_user=Depends(get_current_user)
):
    user_uuid = current_user["userUuid"]

    log.info(
        "orders_retrieval_attempt",
        user_uuid=user_uuid
    )

    try:
        result = get_orders(user_uuid)

        log.info(
            "orders_retrieved",
            user_uuid=user_uuid
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "orders_retrieval_error",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve orders"
        )


@router.get("/admin/orders")
def read_all_orders(
    current_admin=Depends(get_current_admin)
):
    log.info("all_orders_retrieval_attempt")

    try:
        result = get_all_orders()

        log.info(
            "all_orders_retrieved"
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "all_orders_retrieval_error"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve all orders"
        )


@router.put("/admin/orders/{orderUuid}/status")
def change_order_status(
    orderUuid: str,
    order_status: OrderStatusUpdate,
    current_admin=Depends(get_current_admin)
):
    log.info(
        "order_status_update_attempt",
        order_uuid=orderUuid,
        status=order_status.status
    )

    try:
        result = update_order_status(
            orderUuid,
            order_status.status
        )

        log.info(
            "order_status_updated",
            order_uuid=orderUuid,
            status=order_status.status
        )

        return result

    except HTTPException:
        raise

    except Exception:
        log.exception(
            "order_status_update_error",
            order_uuid=orderUuid,
            status=order_status.status
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update order status"
        )