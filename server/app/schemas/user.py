from pydantic import BaseModel, EmailStr

class UserProfile(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: str
    mfa_enabled: bool

    class Config:
        orm_mode = True
