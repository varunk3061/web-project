from pydantic import BaseModel, Field #field =lets you configure fields, especially things like default values.
from typing import Optional, List, Dict
from datetime import datetime

class ProductVariant(BaseModel):
    variantUuid: Optional[str] = None
    attributes: Dict[str, str]
    price: float
    stock: int

class Product(BaseModel):
    title: str
    description: str
    price: float
    categoryUuid: Optional[str] = None
    brand: str
    imageUrls: str
    stock: int
    rating: float = 0
    numReviews: int = 0
    variants: List[ProductVariant] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    categoryUuid: Optional[str] = None
    brand: Optional[str] = None
    imageUrls: Optional[str] = None
    stock: Optional[int] = None
    rating: Optional[float] = None
    numReviews: Optional[int] = None
    variants: Optional[List[ProductVariant]] = None