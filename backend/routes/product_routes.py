from fastapi import APIRouter,Depends
from schemas.product_schema import Product,ProductUpdate
from services.product_service import create_product,get_products,get_product, update_product, delete_product
from dependencies.auth import get_current_admin


router = APIRouter()


# @router.post("/products")
# def add_product(product: Product):
#     productUuid = create_product(product.model_dump())

#     return {
#         "message": "Product created successfully",
#         "productUuid": productUuid
#     }


@router.post("/admin/products")
def add_product(
    product: Product,
    current_admin=Depends(get_current_admin)
):
    productUuid = create_product(product.model_dump())

    if productUuid is None:
        return {
            "message": "Category not found"
        }

    return {
        "message": "Product created successfully",
        "productUuid": productUuid
    }

# @router.get("/products")
# def read_products():
#     products = get_products()
#     return products

@router.get("/products")
def read_products(category: str = None): #categories wise sort karnaya sathi we uses category name from frontend
    products = get_products(category)
    return products
    
@router.get("/products/{productUuid}")
def read_product(productUuid: str):  #finding the one product by it uuid
    product = get_product(productUuid)

    if product:
        return product

    return {
        "message": "Product not found"
    }

@router.put("/admin/products/{productUuid}")
def update_product_route(
    productUuid: str,
    product: ProductUpdate,
    current_admin=Depends(get_current_admin)
):

    result = update_product(
        productUuid,
        product.model_dump(exclude_none=True) #why exclude_none means when the user only wants to update price then other fileds becomes none in pydantic model we use opitional for updatation
    )

    if result is None:
        return {
            "message": "Category not found"
        }

    if result.matched_count == 0:
        return {
            "message": "Product not found"
        }

    if result.modified_count == 0:
        return {
            "message": "No changes made"
        }

    return {
        "message": "Product updated successfully"
    }


@router.delete("/admin/products/{productUuid}")
def delete_product_route(
    productUuid: str,
    current_admin=Depends(get_current_admin)
):

    result = delete_product(productUuid)

    if result.deleted_count == 1:
        return {
            "message": "Product deleted successfully"
        }

    return {
        "message": "Product not found"
    }


