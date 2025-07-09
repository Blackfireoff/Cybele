from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
import os

from database import Base, CustomPoint as CustomPointModel, Friend as FriendModel, create_tables
from schemas import CustomPoint, CustomPointCreate, CustomPointUpdate, Friend, FriendCreate
from blob_storage import save_uploaded_file, delete_file

# Create FastAPI app
app = FastAPI(title="Cybele Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = "sqlite+aiosqlite:///./app.db"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Create upload directories
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup_event():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Add sample friends data
    async with AsyncSessionLocal() as session:
        # Check if friends already exist
        result = await session.execute(select(FriendModel))
        if not result.first():
            sample_friends = [
                FriendModel(
                    name="Emma Johnson",
                    status="Loving the café culture in Paris! ☕",
                    avatar_url="https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=150&h=150&fit=crop&crop=face",
                    country="France",
                    city="Paris",
                    lat=48.8566,
                    lng=2.3522
                ),
                FriendModel(
                    name="Marco Silva",
                    status="Study sessions at the library 📚",
                    avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    country="Japan",
                    city="Tokyo",
                    lat=35.6762,
                    lng=139.6503
                ),
                FriendModel(
                    name="Sarah Chen",
                    status="Exploring ancient history 🏛️",
                    avatar_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                    country="Italy",
                    city="Rome",
                    lat=41.9028,
                    lng=12.4964
                )
            ]
            
            for friend in sample_friends:
                session.add(friend)
            await session.commit()

# Custom Points endpoints
@app.get("/api/custom-points", response_model=List[CustomPoint])
async def get_custom_points(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomPointModel))
    points = result.scalars().all()
    return points

@app.post("/api/custom-points", response_model=CustomPoint)
async def create_custom_point(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    lat: float = Form(...),
    lng: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Save image if provided
    image_url = None
    if image:
        image_url = await save_uploaded_file(image, "images")
    
    # Create point
    db_point = CustomPointModel(
        name=name,
        description=description,
        lat=lat,
        lng=lng,
        image_url=image_url
    )
    
    db.add(db_point)
    await db.commit()
    await db.refresh(db_point)
    
    return db_point

@app.put("/api/custom-points/{point_id}", response_model=CustomPoint)
async def update_custom_point(
    point_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Get existing point
    result = await db.execute(select(CustomPointModel).where(CustomPointModel.id == point_id))
    db_point = result.scalar_one_or_none()
    
    if not db_point:
        raise HTTPException(status_code=404, detail="Custom point not found")
    
    # Update fields
    if name is not None:
        db_point.name = name
    if description is not None:
        db_point.description = description
    if lat is not None:
        db_point.lat = lat
    if lng is not None:
        db_point.lng = lng
    
    # Handle image update
    if image:
        # Delete old image if exists
        if db_point.image_url:
            delete_file(db_point.image_url)
        
        # Save new image
        db_point.image_url = await save_uploaded_file(image, "images")
    
    await db.commit()
    await db.refresh(db_point)
    
    return db_point

@app.delete("/api/custom-points/{point_id}")
async def delete_custom_point(point_id: int, db: AsyncSession = Depends(get_db)):
    # Get existing point
    result = await db.execute(select(CustomPointModel).where(CustomPointModel.id == point_id))
    db_point = result.scalar_one_or_none()
    
    if not db_point:
        raise HTTPException(status_code=404, detail="Custom point not found")
    
    # Delete associated image
    if db_point.image_url:
        delete_file(db_point.image_url)
    
    # Delete point
    await db.delete(db_point)
    await db.commit()
    
    return {"message": "Custom point deleted successfully"}

# Friends endpoints
@app.get("/api/friends", response_model=List[Friend])
async def get_friends(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FriendModel))
    friends = result.scalars().all()
    return friends

@app.post("/api/friends", response_model=Friend)
async def create_friend(
    name: str = Form(...),
    status: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    lat: float = Form(...),
    lng: float = Form(...),
    avatar: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Save avatar if provided
    avatar_url = None
    if avatar:
        avatar_url = await save_uploaded_file(avatar, "avatars")
    
    # Create friend
    db_friend = FriendModel(
        name=name,
        status=status,
        country=country,
        city=city,
        lat=lat,
        lng=lng,
        avatar_url=avatar_url
    )
    
    db.add(db_friend)
    await db.commit()
    await db.refresh(db_friend)
    
    return db_friend

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
