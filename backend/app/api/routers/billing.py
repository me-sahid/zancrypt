import logging
import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request, Security, status
from pydantic import BaseModel

from app.main import limiter
from app.api.deps import get_current_user, get_async_session
from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.payment_order import PaymentOrder, PaymentStatus

logger = logging.getLogger(__name__)

router = APIRouter()

def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment gateway not configured"
        )
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class OrderRequest(BaseModel):
    plan: str  # 'Free', 'Pro', 'Enterprise'

# Define strict pricing in paise (INR)
PLAN_PRICES = {
    "Free": 0,
    "Pro": 19900,         # 199 INR
    "Enterprise": 59900   # 599 INR
}

@router.post("/create-order")
@limiter.limit("5/minute")
async def create_order(
    request: Request,
    order_req: OrderRequest,
    current_user = Security(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    plan_name = order_req.plan
    if plan_name not in PLAN_PRICES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan selected"
        )
    
    amount = PLAN_PRICES[plan_name]
    
    # Free tier doesn't require Razorpay integration
    if amount == 0:
        return {"order_id": None, "amount": 0, "currency": "INR", "status": "free_tier"}
    
    client = get_razorpay_client()
    
    order_data = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"receipt_usr_{current_user.id}_{plan_name}",
        "notes": {
            "user_id": str(current_user.id),
            "plan": plan_name
        }
    }
    
    try:
        order = client.order.create(data=order_data)
        logger.info(f"Created Razorpay order {order['id']} for user {current_user.id} ({plan_name})")
        
        # Persist to database
        db_order = PaymentOrder(
            user_id=current_user.id,
            razorpay_order_id=order["id"],
            plan_id=plan_name,
            amount=amount,
            status=PaymentStatus.created
        )
        session.add(db_order)
        await session.commit()
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "status": "created"
        }
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order"
        )

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured")
        
    signature = request.headers.get("x-razorpay-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    body = await request.body()
    client = get_razorpay_client()
    
    try:
        client.utility.verify_webhook_signature(
            body.decode("utf-8"), 
            signature, 
            settings.RAZORPAY_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.error(f"Invalid Razorpay webhook signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # In a full implementation, you would parse `body` as JSON and update the DB
    # e.g., payload = json.loads(body)
    # if payload['event'] == 'payment.captured': ...
    
    return {"status": "ok"}

@router.get("/orders")
async def get_my_orders(
    current_user = Security(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Fetch the user's payment orders.
    Enforces Row-Level Security (RLS) / Multi-tenancy isolation by strictly
    filtering the query to only include records where user_id matches the authenticated user.
    """
    stmt = select(PaymentOrder).where(PaymentOrder.user_id == current_user.id).order_by(PaymentOrder.created_at.desc())
    result = await session.execute(stmt)
    orders = result.scalars().all()
    
    return [
        {
            "id": order.id,
            "razorpay_order_id": order.razorpay_order_id,
            "plan_id": order.plan_id,
            "amount": order.amount,
            "status": order.status,
            "created_at": order.created_at
        }
        for order in orders
    ]
