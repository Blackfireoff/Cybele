from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomPointBase(BaseModel):
    name: str
    description: Optional[str] = None
    lat: float
    lng: float

class CustomPointCreate(CustomPointBase):
    pass

class CustomPointUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class CustomPoint(CustomPointBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FriendBase(BaseModel):
    name: str
    status: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    lat: float
    lng: float

class FriendCreate(FriendBase):
    pass

class Friend(FriendBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
