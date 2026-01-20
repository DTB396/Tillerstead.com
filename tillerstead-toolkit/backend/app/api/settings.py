"""
Settings API router - User settings and calculator presets
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import CalculatorPreset
from app.schemas.schemas import PresetCreate, PresetResponse

router = APIRouter(prefix="/settings", tags=["settings"])


# ============================================================
# CALCULATOR PRESETS
# ============================================================

@router.get("/presets", response_model=List[PresetResponse])
async def list_presets(
    calculator_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all calculator presets, optionally filtered by type"""
    query = select(CalculatorPreset).order_by(CalculatorPreset.name)
    if calculator_type:
        query = query.where(CalculatorPreset.calculator_type == calculator_type)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/presets/{preset_id}", response_model=PresetResponse)
async def get_preset(preset_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific preset by ID"""
    result = await db.execute(
        select(CalculatorPreset).where(CalculatorPreset.id == preset_id)
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    return preset


@router.get("/presets/default/{calculator_type}", response_model=PresetResponse)
async def get_default_preset(
    calculator_type: str,
    db: AsyncSession = Depends(get_db)
):
    """Get the default preset for a calculator type"""
    result = await db.execute(
        select(CalculatorPreset).where(
            CalculatorPreset.calculator_type == calculator_type,
            CalculatorPreset.is_default == True
        )
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(
            status_code=404,
            detail=f"No default preset found for calculator '{calculator_type}'"
        )
    return preset


@router.post("/presets", response_model=PresetResponse, status_code=201)
async def create_preset(
    preset_data: PresetCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new calculator preset"""
    # If this preset is default, unset other defaults for same calculator type
    if preset_data.is_default:
        result = await db.execute(
            select(CalculatorPreset).where(
                CalculatorPreset.calculator_type == preset_data.calculator_type,
                CalculatorPreset.is_default == True
            )
        )
        existing_defaults = result.scalars().all()
        for existing in existing_defaults:
            existing.is_default = False
    
    preset = CalculatorPreset(**preset_data.model_dump())
    db.add(preset)
    await db.commit()
    await db.refresh(preset)
    return preset


@router.patch("/presets/{preset_id}", response_model=PresetResponse)
async def update_preset(
    preset_id: int,
    preset_data: PresetCreate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing preset"""
    result = await db.execute(
        select(CalculatorPreset).where(CalculatorPreset.id == preset_id)
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    # Handle default flag
    if preset_data.is_default and not preset.is_default:
        result = await db.execute(
            select(CalculatorPreset).where(
                CalculatorPreset.calculator_type == preset_data.calculator_type,
                CalculatorPreset.is_default == True
            )
        )
        existing_defaults = result.scalars().all()
        for existing in existing_defaults:
            existing.is_default = False
    
    update_data = preset_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preset, field, value)
    
    await db.commit()
    await db.refresh(preset)
    return preset


@router.delete("/presets/{preset_id}", status_code=204)
async def delete_preset(preset_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a preset"""
    result = await db.execute(
        select(CalculatorPreset).where(CalculatorPreset.id == preset_id)
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    await db.delete(preset)
    await db.commit()


@router.post("/presets/{preset_id}/set-default", response_model=PresetResponse)
async def set_default_preset(preset_id: int, db: AsyncSession = Depends(get_db)):
    """Set a preset as the default for its calculator type"""
    result = await db.execute(
        select(CalculatorPreset).where(CalculatorPreset.id == preset_id)
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    # Unset other defaults
    result = await db.execute(
        select(CalculatorPreset).where(
            CalculatorPreset.calculator_type == preset.calculator_type,
            CalculatorPreset.is_default == True
        )
    )
    existing_defaults = result.scalars().all()
    for existing in existing_defaults:
        existing.is_default = False
    
    preset.is_default = True
    await db.commit()
    await db.refresh(preset)
    return preset
