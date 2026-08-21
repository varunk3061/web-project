from database import db


def get_dashboard_stats():

    product_collection = db["products"]
    category_collection = db["categories"]
    order_collection = db["orders"]
    user_collection = db["users"]

    total_products = product_collection.count_documents({})

    total_categories = category_collection.count_documents({})

    total_orders = order_collection.count_documents({})

    total_users =  order_collection.count_documents({})

    orders = order_collection.find({})

    total_revenue = 0

    for order in orders:
        total_revenue += order["totalAmount"]

    return {
        "totalProducts": total_products,
        "totalCategories": total_categories,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
        "totalUsers": total_users
    }