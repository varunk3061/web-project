
from pydantic import BaseModel, EmailStr, Field


# =========================
# REGISTER
# =========================

class User(BaseModel):

    name: str

    email: EmailStr

    password: str = Field(min_length=6)


# =========================
# LOGIN
# =========================

class UserLogin(BaseModel):

    email: EmailStr

    password: str


# =========================
# UPDATE PROFILE
# =========================

class UserProfileUpdate(BaseModel):

    name: str

    phone: str = Field(min_length=10, max_length=10)


# =========================
# ADDRESS
# =========================

class UserAddress(BaseModel):

    fullName: str

    phone: str = Field(min_length=10, max_length=10)

    addressLine: str

    city: str

    state: str

    pincode: str = Field(min_length=6, max_length=6)

    country: str = "India"
