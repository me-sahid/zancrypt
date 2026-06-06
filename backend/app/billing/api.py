from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_async_session
from app.models.user import User
from app.api.deps import get_current_user
from app.billing.schemas import OrderCreateRequest, OrderCreateResponse, PaymentVerifyRequest, PaymentVerifyResponse
from app.billing.services import RazorpayService
from app.core.config import settings

router = APIRouter()
razorpay_service = RazorpayService()

PLAN_PRICING = {
    "FREE": {"amount": 0, "storage": 5 * 1024 * 1024 * 1024},          # 5 GB
    "SHIELD": {"amount": 299, "storage": 50 * 1024 * 1024 * 1024},       # 50 GB
    "VAULT": {"amount": 999, "storage": 500 * 1024 * 1024 * 1024},       # 500 GB
}

@router.post("/create-order", response_model=OrderCreateResponse)
async def create_order(
    request: OrderCreateRequest,
    current_user: User = Depends(get_current_user)
):
    plan_name = request.plan_name.upper()
    if plan_name == "CUSTOM":
        if not request.custom_storage_gb or request.custom_storage_gb < 100:
            raise HTTPException(status_code=400, detail="Custom storage must be at least 100 GB")
        amount = request.custom_storage_gb * 3
    elif plan_name in PLAN_PRICING:
        amount = PLAN_PRICING[plan_name]["amount"]
    else:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    # If the plan is free, we don't need Razorpay
    if amount == 0:
        return OrderCreateResponse(
            order_id="free_tier",
            amount=0,
            currency="INR",
            key_id=""
        )

    receipt_id = f"rcpt_{current_user.id}_{plan_name}"
    order = razorpay_service.create_order(amount, receipt_id)
    
    return OrderCreateResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=settings.RAZORPAY_KEY_ID or "dev_key"
    )

@router.post("/verify-payment", response_model=PaymentVerifyResponse)
async def verify_payment(
    request: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    plan_name = request.plan_name.upper()
    if plan_name == "CUSTOM":
        if not request.custom_storage_gb or request.custom_storage_gb < 100:
            raise HTTPException(status_code=400, detail="Custom storage must be at least 100 GB")
        amount = request.custom_storage_gb * 3
        storage_limit = request.custom_storage_gb * 1024 * 1024 * 1024
    elif plan_name in PLAN_PRICING:
        amount = PLAN_PRICING[plan_name]["amount"]
        storage_limit = PLAN_PRICING[plan_name]["storage"]
    else:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    if amount > 0:
        is_valid = razorpay_service.verify_signature(
            request.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Upgrade the user's plan and storage
    result = await session.execute(select(User).filter(User.id == current_user.id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.plan_type = plan_name
    user.storage_limit = storage_limit
    user.razorpay_subscription_id = request.razorpay_order_id
    
    await session.commit()
    await session.refresh(user)

    return PaymentVerifyResponse(
        status="success",
        plan_type=user.plan_type,
        storage_limit=user.storage_limit
    )
