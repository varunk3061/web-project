from pydantic import BaseModel


class WishlistItem(BaseModel):
    productUuid: str
    variantUuid: str | None = None