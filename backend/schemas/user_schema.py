from pydantic import BaseModel, EmailStr,Field  #Emailstr is used to validate the emails automatically

class User(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str