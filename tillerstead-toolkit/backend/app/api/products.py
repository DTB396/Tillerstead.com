"""
Products API router - Product catalog CRUD and search
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Product, ProductCategory
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse])
async def list_products(
    category: Optional[ProductCategory] = None,
    vendor: Optional[str] = None,
    active_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List products with optional filters"""
    query = select(Product).offset(skip).limit(limit)
    
    if active_only:
        query = query.where(Product.is_active == True)
    if category:
        query = query.where(Product.category == category)
    if vendor:
        query = query.where(Product.vendor.ilike(f"%{vendor}%"))
    
    query = query.order_by(Product.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=2, description="Search query"),
    category: Optional[ProductCategory] = None,
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Search products by name, SKU, or description"""
    search_term = f"%{q}%"
    query = select(Product).where(
        Product.is_active == True,
        or_(
            Product.name.ilike(search_term),
            Product.sku.ilike(search_term),
            Product.upc.ilike(search_term),
            Product.brand.ilike(search_term),
            Product.description.ilike(search_term),
        )
    )
    
    if category:
        query = query.where(Product.category == category)
    
    query = query.limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new product"""
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing product"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Soft delete a product (set inactive)"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = False
    await db.commit()
