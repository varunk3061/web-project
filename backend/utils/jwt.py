import os
from datetime import datetime, timedelta # Used for token expiration.Example:We create a token that is valid for:30 minutesAfter 30 minutes, the token expires.

from jose import jwt #This is the library that creates and verifies JWT tokens.


SECRET_KEY = os.getenv("JWT_SECRET") #user_data + secret_key = token
ALGORITHM = os.getenv("JWT_ALGORITHM") #This tells JWT which algorithm to use for creating the signature.


def create_access_token(data: dict):#in the data it stores the user data like email and name in dict format

    to_encode = data.copy() #it makes copy of your data so that we can modify it without changing the original data. 

    expire_time = datetime.utcnow() + timedelta( #means now + 30 minutes = token expiration time
        minutes=60
    )

    to_encode.update(
        {
            "exp": expire_time  #copy data madhe exp key add karun tyala expire_time value assign keli jate. 
        }
    )

    token = jwt.encode(
        to_encode,  # it converst the data into long jwt string fromat
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token