from enum import Enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class PaymentStatus(str, Enum):
    created = "created"
    paid = "paid"
    failed = "failed"

class PaymentOrder(Base, TimestampMixin):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    razorpay_order_id = Column(String(255), unique=True, nullable=False, index=True)
    plan_id = Column(String(50), nullable=False)
    amount = Column(Integer, nullable=False)  # in paise
    status = Column(SqlEnum(PaymentStatus), default=PaymentStatus.created, nullable=False, index=True)
    
    user = relationship("User", back_populates="payment_orders")
