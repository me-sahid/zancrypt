import razorpay
from fastapi import HTTPException
from app.core.config import settings

class RazorpayService:
    def __init__(self):
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        else:
            self.client = None

    def create_order(self, amount_inr: int, receipt: str) -> dict:
        if not self.client:
            # Fallback for local development when keys are not set
            return {
                "id": f"order_dev_{receipt}",
                "amount": amount_inr * 100,
                "currency": "INR"
            }
            
        try:
            data = {
                "amount": amount_inr * 100, # Razorpay expects paise
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1
            }
            order = self.client.order.create(data=data)
            return order
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")

    def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        if not self.client:
            # Fallback for local development
            return True
            
        try:
            self.client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Signature verification failed: {str(e)}")
