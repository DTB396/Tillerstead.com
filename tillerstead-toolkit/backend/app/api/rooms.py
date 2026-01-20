"""
Rooms API router - CRUD operations for rooms within jobs
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Room, Job
from app.schemas.schemas import RoomCreate, RoomUpdate, RoomResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("", response_model=List[RoomResponse])
async def list_rooms(
    job_id: int = Query(..., description="Filter rooms by job ID"),
    db: AsyncSession = Depends(get_db)
):
    """List all rooms for a specific job"""
    query = select(Room).where(Room.job_id == job_id).order_by(Room.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific room by ID"""
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(room_data: RoomCreate, db: AsyncSession = Depends(get_db)):
    """Create a new room in a job"""
    # Verify job exists
    job_result = await db.execute(select(Job).where(Job.id == room_data.job_id))
    if not job_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Job not found")
    
    room_dict = room_data.model_dump()
    if room_dict.get("dimensions"):
        room_dict["dimensions"] = room_dict["dimensions"].model_dump() if hasattr(room_dict["dimensions"], "model_dump") else room_dict["dimensions"]
    
    room = Room(**room_dict)
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


@router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing room"""
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    update_data = room_data.model_dump(exclude_unset=True)
    if "dimensions" in update_data and update_data["dimensions"]:
        update_data["dimensions"] = update_data["dimensions"].model_dump() if hasattr(update_data["dimensions"], "model_dump") else update_data["dimensions"]
    
    for field, value in update_data.items():
        setattr(room, field, value)
    
    await db.commit()
    await db.refresh(room)
    return room


@router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a room and all related line items"""
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    await db.delete(room)
    await db.commit()
