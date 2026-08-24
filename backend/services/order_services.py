from database import db
from uuid import uuid4
from datetime import datetime
from bson import ObjectId

def generate_order_number():
    return f"ORD-{str(uuid4())[:8].upper()}"


def create_order(user_id, shipping_address, productUuid=None, quantity=None):

    cart_collection = db["carts"]
    order_collection = db["orders"]
    product_collection = db["products"]

    order_items = []
    total_amount = 0

    # ==============================
    # BUY NOW - SINGLE PRODUCT
    # ==============================

    if productUuid:

        product = product_collection.find_one({
            "productUuid": productUuid
        })

        if product is None:
            return {
                "message": "Product not found"
            }

        if quantity is None or quantity < 1:
            return {
                "message": "Invalid quantity"
            }

        if product["stock"] < quantity:
            return {
                "message": "Not enough stock"
        }

        order_items.append({
            "productId": product["_id"],
            "productUuid": product["productUuid"],
            "title": product["title"],
            "price": product["price"],
            "quantity": quantity
        })

        total_amount = product["price"] * quantity

    # ==============================
    # CART CHECKOUT - ALL PRODUCTS
    # ==============================

    else:

        cart = cart_collection.find_one({
            "userId": user_id
        })

        if cart is None or not cart.get("items"):
            return {
                "message": "Cart is empty"
            }

        for item in cart["items"]:

            product = product_collection.find_one({
                "_id": item["productId"]
            })

            if product is None:
                continue

            item_quantity = item["quantity"]

            if product["stock"] < item_quantity:
                return {
                    "message": f"Not enough stock for {product['title']}"
                }
            
            price = product["price"]

            

            order_items.append({
                "productId": product["_id"],
                "productUuid": product["productUuid"],       
                "title": product["title"],
                "price": price,
                "quantity": item_quantity
            })

            total_amount += price * item_quantity

    # ==============================
    # VALIDATION
    # ==============================

    if not order_items:
        return {
            "message": "No valid products"
        }

    # ==============================
    # CREATE ORDER
    # ==============================

    order = {
        "orderUuid": str(uuid4()),
        "userId": user_id,
        "orderNumber": generate_order_number(),
        "items": order_items,
        "totalAmount": total_amount,
        "shippingAddress": shipping_address,
        "status": "placed",
        "createdAt": datetime.utcnow()
    }

    order_collection.insert_one(order)

    for item in order_items:

        product_collection.update_one(
            {
                "_id": item["productId"]
            },
            {
                "$inc": {
                    "stock": -item["quantity"]
                }
            }
        )

    # ==============================
    # EMPTY CART
    # ==============================

    # Only empty the cart when
    # the user checked out the whole cart.

    if not productUuid:

        cart_collection.update_one(
            {
                "userId": user_id
            },
            {
                "$set": {
                    "items": [],
                    "updatedAt": datetime.utcnow()
                }
            }
        )

    return {
        "message": "Order placed successfully",
        "orderNumber": order["orderNumber"],
        "totalAmount": total_amount
    }

#Helper function convert the product_id to productUuid which is useful for get_orders
def get_product_uuid(product_id):

    product_collection = db["products"]

    product = product_collection.find_one({
        "_id": product_id
    })

    if product:
        return product["productUuid"]

    return None


def get_orders(user_id):

    order_collection = db["orders"]

    orders = list(
        order_collection.find({
            "userId": user_id
        }).sort("createdAt", -1)
    )

    result = []

    for order in orders:

        result.append({
            "orderUuid": order["orderUuid"],
            "orderNumber": order.get("orderNumber"),
            "items": [
                {
                    "productUuid": item["productUuid"],
                    "title": item["title"],
                    "price": item["price"],
                    "quantity": item["quantity"]
                }
                for item in order["items"]
            ],
            "totalAmount": order["totalAmount"],
            "shippingAddress": order["shippingAddress"],
            "status": order["status"],
            "createdAt": order["createdAt"]
        })

    return result

def get_all_orders():

    order_collection = db["orders"]
    user_collection = db["users"]

    orders = list(order_collection.find({})
        .sort("createdAt", -1)  #sorting descending means new order comes first
    )

    result = []

    for order in orders:
         
        user = user_collection.find_one({
        "_id": ObjectId(order["userId"])  #order madhe user_id ahe tya varun user che info kadla
        })

        result.append({
            "orderUuid": order["orderUuid"],
            "orderNumber": order.get("orderNumber"),
            "customer": {
                "name": user["name"] if user else "Unknown",
                "email": user["email"] if user else "Unknown"
            },
            "items": [
                {
                    "productUuid": item["productUuid"],
                    "title": item["title"],
                    "price": item["price"],
                    "quantity": item["quantity"]
                }
                for item in order["items"]
            ],
            "totalAmount": order["totalAmount"],
            "shippingAddress": order["shippingAddress"],
            "status": order["status"],
            "createdAt": order["createdAt"]
        })

    return result

def update_order_status(orderUuid, status):

    order_collection = db["orders"]

    allowed_statuses = [
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
    ]

    if status not in allowed_statuses:
        return {
            "message": "Invalid order status"
        }

    result = order_collection.update_one(
        {
            "orderUuid": orderUuid
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Order not found"
        }

    return {
        "message": "Order status updated successfully"
    }