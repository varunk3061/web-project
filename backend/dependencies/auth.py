from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

from jose import jwt, JWTError

import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")

#This is the part where the JWT sent by the frontend is received and verified by the backend.
#frontend send request like this = Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
#So credentials contains something like:
#credentials
    #├── scheme = "Bearer"
    #└── credentials = "eyJhbGciOiJIUzI1NiIs..."

oauth2_scheme =  HTTPBearer()

def get_current_user(credentials= Depends(oauth2_scheme)): #Depends(oauth2_scheme) seeing this "Before running this function, get the token from the request."

    token = credentials.credentials #get token = "eyJhbGciOiJIUzI1NiIs..."
    try:

        payload = jwt.decode(
            token,  #First: verifies the token's signature. backend used secret_key
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload #after decoding the token, it returns the payload data which contains userUuid and email. This payload data is used in the profile route to get the current user's information. The frontend sends the JWT token in the request header, and this function decodes it to get the user's information


    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    
def get_current_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user