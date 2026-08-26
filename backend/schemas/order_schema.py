from pydantic import BaseModel,Field


class ShippingAddress(BaseModel):
    fullName: str
    line1: str
    line2: str = ""
    city: str
    state: str
    pincode: str = Field(pattern=r"^[1-9][0-9]{5}$")


class OrderCreate(BaseModel):
    shippingAddress: ShippingAddress
    productUuid: str | None = None
    quantity: int | None = None

class OrderStatusUpdate(BaseModel):
    status: str