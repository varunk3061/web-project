from fastapi import FastAPI
from routes.product_routes import router as product_router
from routes.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.wishlist_routes import router as wishlist_router
from routes.catergory_routes import router as catergory_router
from routes.dashboard_routes import router as dashboard_router

app = FastAPI()

app.include_router(product_router)
app.include_router(cart_router)
app.include_router(auth_router)
app.include_router(order_router)
app.include_router(wishlist_router)
app.include_router(catergory_router)
app.include_router(dashboard_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Flipkart Backend"
    }

    