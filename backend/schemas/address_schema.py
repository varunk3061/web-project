from pydantic import BaseModel


class Address(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str