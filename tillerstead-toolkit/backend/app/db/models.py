"""
SQLAlchemy database models
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, 
    Text, Boolean, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    QUOTED = "quoted"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProductCategory(str, enum.Enum):
    TILE = "tile"
    MORTAR = "mortar"
    GROUT = "grout"
    WATERPROOFING = "waterproofing"
    BACKER_BOARD = "backer_board"
    SELF_LEVELER = "self_leveler"
    DRYWALL = "drywall"
    JOINT_COMPOUND = "joint_compound"
    TRIM = "trim"
    PAINT = "paint"
    FASTENERS = "fasteners"
    TOOLS = "tools"
    OTHER = "other"


class PriceSource(str, enum.Enum):
    MANUAL = "manual"
    CSV_IMPORT = "csv_import"
    HOMEDEPOT_FEED = "homedepot_feed"
    THIRDPARTY_API = "thirdparty_api"
    RECEIPT_SCAN = "receipt_scan"


# ============================================================
# PRODUCTS & PRICING
# ============================================================

class Product(Base):
    """Product catalog / Price Book"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100))
    category = Column(SQLEnum(ProductCategory), default=ProductCategory.OTHER)
    description = Column(Text)
    
    # Identifiers
    sku = Column(String(100), index=True)
    upc = Column(String(50), index=True)
    manufacturer_sku = Column(String(100))
    
    # Units & packaging
    unit = Column(String(50), default="each")  # each, sqft, lf, bag, bucket, etc.
    pack_size = Column(Float, default=1.0)  # e.g., 50 for 50lb bag
    pack_unit = Column(String(50))  # lb, oz, sqft, etc.
    coverage_per_unit = Column(Float)  # e.g., 100 sqft per bucket
    coverage_unit = Column(String(50))  # sqft, lf, etc.
    
    # Pricing
    cost = Column(Float)  # What we pay
    retail = Column(Float)  # MSRP / list price
    our_price = Column(Float)  # What we charge
    
    # Vendor info
    vendor = Column(String(100))
    vendor_url = Column(String(500))
    
    # Metadata
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    specifications = Column(JSON)  # Flexible spec storage
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    price_history = relationship("PriceHistory", back_populates="product")
    line_items = relationship("JobLineItem", back_populates="product")


class PriceHistory(Base):
    """Track price changes over time"""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    cost = Column(Float)
    retail = Column(Float)
    source = Column(SQLEnum(PriceSource), default=PriceSource.MANUAL)
    source_details = Column(String(255))  # e.g., filename, receipt #
    
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="price_history")


# ============================================================
# JOBS & ROOMS
# ============================================================

class Job(Base):
    """Project / Job"""
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    
    # Client info
    client_name = Column(String(255))
    client_email = Column(String(255))
    client_phone = Column(String(50))
    
    # Address
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(50), default="NJ")
    zip_code = Column(String(20))
    
    # Status & dates
    status = Column(SQLEnum(JobStatus), default=JobStatus.DRAFT)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    # Financial
    labor_rate = Column(Float, default=75.0)  # $/hour
    overhead_percent = Column(Float, default=15.0)
    profit_percent = Column(Float, default=20.0)
    tax_percent = Column(Float, default=6.625)  # NJ sales tax
    contingency_percent = Column(Float, default=10.0)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rooms = relationship("Room", back_populates="job", cascade="all, delete-orphan")
    line_items = relationship("JobLineItem", back_populates="job", cascade="all, delete-orphan")


class Room(Base):
    """Room within a job"""
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    room_type = Column(String(100))  # bathroom, kitchen, floor, etc.
    
    # Dimensions (stored as JSON for flexibility)
    dimensions = Column(JSON)  # {length, width, height, shapes: [...]}
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="rooms")
    line_items = relationship("JobLineItem", back_populates="room", cascade="all, delete-orphan")


class JobLineItem(Base):
    """Line item in a job's Bill of Materials"""
    __tablename__ = "job_line_items"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    product_id = Column(Integer, ForeignKey("products.id"))  # Nullable for unmapped items
    
    # Item details (may differ from product if custom)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(SQLEnum(ProductCategory))
    
    # Quantities
    qty = Column(Float, nullable=False)
    unit = Column(String(50), default="each")
    
    # Pricing
    unit_price = Column(Float, default=0.0)
    extended_price = Column(Float, default=0.0)
    
    # Calculator source
    calculator_type = Column(String(100))  # Which calculator generated this
    calculator_inputs = Column(JSON)  # Inputs used for recalculation
    
    # Mapping status
    is_mapped = Column(Boolean, default=False)  # True if linked to a product
    mapping_confidence = Column(Float)  # 0-1 confidence of auto-mapping
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="line_items")
    room = relationship("Room", back_populates="line_items")
    product = relationship("Product", back_populates="line_items")


# ============================================================
# CALCULATOR PRESETS
# ============================================================

class CalculatorPreset(Base):
    """User-saved calculator presets"""
    __tablename__ = "calculator_presets"
    
    id = Column(Integer, primary_key=True, index=True)
    
    calculator_type = Column(String(100), nullable=False)  # tile_floor, thinset, etc.
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    settings = Column(JSON, nullable=False)  # Calculator-specific settings
    
    is_default = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================
# IMPORT LOGS
# ============================================================

class ImportLog(Base):
    """Track data imports"""
    __tablename__ = "import_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    source = Column(SQLEnum(PriceSource), nullable=False)
    filename = Column(String(255))
    
    records_total = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    
    errors = Column(JSON)  # List of error messages
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    status = Column(String(50), default="pending")  # pending, running, completed, failed
