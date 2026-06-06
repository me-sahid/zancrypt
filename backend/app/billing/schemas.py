from typing import Optional
from pydantic import BaseModel

class OrderCreateRequest(BaseModel):
    plan_name: str
    custom_storage_gb: Optional[int] = None

class OrderCreateResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_name: str
    custom_storage_gb: Optional[int] = None

class PaymentVerifyResponse(BaseModel):
    status: str
    plan_type: str
    storage_limit: int
