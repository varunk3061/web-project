from pydantic import BaseModel, EmailStr  #Emailstr is used to validate the emails automatically

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str