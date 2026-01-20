"""
Imports API router - Import data from CSV/JSON files
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import json
import csv
import io

from app.db.database import get_db
from app.db.models import Product, ImportLog, PriceSource, ProductCategory
from app.schemas.schemas import ImportStatus

router = APIRouter(prefix="/imports", tags=["imports"])


@router.get("", response_model=List[ImportStatus])
async def list_imports(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """List recent import logs"""
    query = select(ImportLog).order_by(ImportLog.started_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{import_id}", response_model=ImportStatus)
async def get_import_status(import_id: int, db: AsyncSession = Depends(get_db)):
    """Get status of a specific import"""
    result = await db.execute(select(ImportLog).where(ImportLog.id == import_id))
    import_log = result.scalar_one_or_none()
    if not import_log:
        raise HTTPException(status_code=404, detail="Import not found")
    return import_log


@router.post("/products", response_model=ImportStatus)
async def import_products(
    file: UploadFile = File(...),
    source: PriceSource = Form(PriceSource.CSV_IMPORT),
    update_existing: bool = Form(True),
    db: AsyncSession = Depends(get_db)
):
    """Import products from CSV or JSON file"""
    # Create import log
    import_log = ImportLog(
        source=source,
        filename=file.filename,
        status="running"
    )
    db.add(import_log)
    await db.commit()
    
    try:
        content = await file.read()
        content_str = content.decode("utf-8")
        
        # Parse file based on extension
        if file.filename.endswith(".json"):
            records = json.loads(content_str)
            if not isinstance(records, list):
                records = [records]
        elif file.filename.endswith(".csv"):
            reader = csv.DictReader(io.StringIO(content_str))
            records = list(reader)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or JSON.")
        
        import_log.records_total = len(records)
        errors = []
        
        for i, record in enumerate(records):
            try:
                # Check for existing product by SKU or UPC
                existing = None
                if record.get("sku"):
                    result = await db.execute(
                        select(Product).where(Product.sku == record["sku"])
                    )
                    existing = result.scalar_one_or_none()
                
                if not existing and record.get("upc"):
                    result = await db.execute(
                        select(Product).where(Product.upc == record["upc"])
                    )
                    existing = result.scalar_one_or_none()
                
                # Map category string to enum
                if "category" in record and record["category"]:
                    try:
                        record["category"] = ProductCategory(record["category"])
                    except ValueError:
                        record["category"] = ProductCategory.OTHER
                
                # Convert numeric fields
                for field in ["cost", "retail", "our_price", "pack_size", "coverage_per_unit"]:
                    if field in record and record[field]:
                        try:
                            record[field] = float(record[field])
                        except (ValueError, TypeError):
                            record[field] = None
                
                if existing and update_existing:
                    for key, value in record.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)
                    import_log.records_updated += 1
                elif not existing:
                    # Ensure required field
                    if not record.get("name"):
                        errors.append(f"Row {i+1}: Missing required field 'name'")
                        import_log.records_failed += 1
                        continue
                    
                    product = Product(**{k: v for k, v in record.items() if hasattr(Product, k)})
                    db.add(product)
                    import_log.records_created += 1
                    
            except Exception as e:
                errors.append(f"Row {i+1}: {str(e)}")
                import_log.records_failed += 1
        
        import_log.errors = errors if errors else None
        import_log.status = "completed"
        import_log.completed_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(import_log)
        
    except Exception as e:
        import_log.status = "failed"
        import_log.errors = [str(e)]
        import_log.completed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=400, detail=str(e))
    
    return import_log
