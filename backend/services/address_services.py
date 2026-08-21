from database import db


def create_address(user_id, address_data):

    address_collection = db["addresses"]

    address = {
        "user_id": user_id,
        "name": address_data["name"],
        "phone": address_data["phone"],
        "address": address_data["address"],
        "city": address_data["city"],
        "state": address_data["state"],
        "pincode": address_data["pincode"]
    }

    result = address_collection.insert_one(address)

    return result

def get_address(user_id):

    address_collection = db["addresses"]

    address = address_collection.find_one({
        "user_id": user_id
    })

    return address

def update_address(user_id, address_data):

    address_collection = db["addresses"]

    result = address_collection.update_one(
        {
            "user_id": user_id
        },
        {
            "$set": {
                "name": address_data["name"],
                "phone": address_data["phone"],
                "address": address_data["address"],
                "city": address_data["city"],
                "state": address_data["state"],
                "pincode": address_data["pincode"]
            }
        }
    )

    return result