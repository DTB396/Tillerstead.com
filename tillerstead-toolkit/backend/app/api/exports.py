"""
Exports API router - Export BOM and estimates
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import json
import csv
import io

from app.db.database import get_db
from app.db.models import Job, Room, JobLineItem
from app.schemas.schemas import (
    JobResponse, RoomResponse, LineItemResponse,
    BOMSummary, EstimateExport
)

router = APIRouter(prefix="/exports", tags=["exports"])


async def calculate_bom(job: Job, line_items: list) -> BOMSummary:
    """Calculate BOM summary from job and line items"""
    subtotal_materials = sum(item.extended_price for item in line_items)
    subtotal_labor = 0  # TODO: Calculate from room dimensions and labor rates
    
    overhead = (subtotal_materials + subtotal_labor) * (job.overhead_percent / 100)
    profit = (subtotal_materials + subtotal_labor + overhead) * (job.profit_percent / 100)
    tax = subtotal_materials * (job.tax_percent / 100)
    contingency = (subtotal_materials + subtotal_labor) * (job.contingency_percent / 100)
    
    grand_total = subtotal_materials + subtotal_labor + overhead + profit + tax + contingency
    
    return BOMSummary(
        job_id=job.id,
        job_name=job.name,
        total_items=len(line_items),
        mapped_items=sum(1 for item in line_items if item.is_mapped),
        unmapped_items=sum(1 for item in line_items if not item.is_mapped),
        subtotal_materials=round(subtotal_materials, 2),
        subtotal_labor=round(subtotal_labor, 2),
        overhead=round(overhead, 2),
        profit=round(profit, 2),
        tax=round(tax, 2),
        contingency=round(contingency, 2),
        grand_total=round(grand_total, 2),
        line_items=[LineItemResponse.model_validate(item) for item in line_items]
    )


@router.get("/bom/{job_id}", response_model=BOMSummary)
async def get_bom(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get Bill of Materials for a job"""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    items_result = await db.execute(
        select(JobLineItem).where(JobLineItem.job_id == job_id)
    )
    line_items = items_result.scalars().all()
    
    return await calculate_bom(job, line_items)


@router.get("/bom/{job_id}/csv")
async def export_bom_csv(job_id: int, db: AsyncSession = Depends(get_db)):
    """Export BOM as CSV file"""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    items_result = await db.execute(
        select(JobLineItem).where(JobLineItem.job_id == job_id)
    )
    line_items = items_result.scalars().all()
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Category", "Qty", "Unit", "Unit Price", "Extended Price", "Notes"])
    
    for item in line_items:
        writer.writerow([
            item.name,
            item.category.value if item.category else "",
            item.qty,
            item.unit,
            f"{item.unit_price:.2f}",
            f"{item.extended_price:.2f}",
            item.notes or ""
        ])
    
    bom = await calculate_bom(job, line_items)
    writer.writerow([])
    writer.writerow(["Materials Subtotal", "", "", "", "", f"{bom.subtotal_materials:.2f}"])
    writer.writerow(["Tax", "", "", "", "", f"{bom.tax:.2f}"])
    writer.writerow(["Overhead", "", "", "", "", f"{bom.overhead:.2f}"])
    writer.writerow(["Profit", "", "", "", "", f"{bom.profit:.2f}"])
    writer.writerow(["Contingency", "", "", "", "", f"{bom.contingency:.2f}"])
    writer.writerow(["Grand Total", "", "", "", "", f"{bom.grand_total:.2f}"])
    
    output.seek(0)
    filename = f"bom_{job.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/estimate/{job_id}", response_model=EstimateExport)
async def get_estimate(job_id: int, db: AsyncSession = Depends(get_db)):
    """Get full estimate export for a job"""
    result = await db.execute(
        select(Job).options(selectinload(Job.rooms)).where(Job.id == job_id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    items_result = await db.execute(
        select(JobLineItem).where(JobLineItem.job_id == job_id)
    )
    line_items = items_result.scalars().all()
    
    bom = await calculate_bom(job, line_items)
    
    return EstimateExport(
        job=JobResponse.model_validate(job),
        rooms=[RoomResponse.model_validate(room) for room in job.rooms],
        bom=bom,
        generated_at=datetime.utcnow()
    )


@router.get("/estimate/{job_id}/json")
async def export_estimate_json(job_id: int, db: AsyncSession = Depends(get_db)):
    """Export full estimate as JSON file"""
    estimate = await get_estimate(job_id, db)
    
    filename = f"estimate_{estimate.job.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"
    content = estimate.model_dump_json(indent=2)
    
    return StreamingResponse(
        iter([content]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
