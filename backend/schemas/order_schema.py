from pydantic import BaseModel


class ShippingAddress(BaseModel):
    fullName: str
    line1: str
    line2: str = ""
    city: str
    state: str
    pincode: str


class OrderCreate(BaseModel):
    shippingAddress: ShippingAddress
    productUuid: str | None = None
    quantity: int | None = None

class OrderStatusUpdate(BaseModel):
    status: str