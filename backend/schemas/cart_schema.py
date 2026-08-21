from pydantic import BaseModel, Field
from typing import Optional


class CartItem(BaseModel):
    productUuid: str
    quantity: int = Field(gt=0)
    variantUuid: Optional[str] = None