"""
Pydantic schemas for API request/response validation
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


# ============================================================
# ENUMS
# ============================================================

class JobStatus(str, Enum):
    DRAFT = "draft"
    QUOTED = "quoted"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProductCategory(str, Enum):
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


class PriceSource(str, Enum):
    MANUAL = "manual"
    CSV_IMPORT = "csv_import"
    HOMEDEPOT_FEED = "homedepot_feed"
    THIRDPARTY_API = "thirdparty_api"
    RECEIPT_SCAN = "receipt_scan"


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand: Optional[str] = None
    category: ProductCategory = ProductCategory.OTHER
    description: Optional[str] = None
    
    sku: Optional[str] = None
    upc: Optional[str] = None
    manufacturer_sku: Optional[str] = None
    
    unit: str = "each"
    pack_size: float = 1.0
    pack_unit: Optional[str] = None
    coverage_per_unit: Optional[float] = None
    coverage_unit: Optional[str] = None
    
    cost: Optional[float] = None
    retail: Optional[float] = None
    our_price: Optional[float] = None
    
    vendor: Optional[str] = None
    vendor_url: Optional[str] = None
    
    notes: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[ProductCategory] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    upc: Optional[str] = None
    unit: Optional[str] = None
    pack_size: Optional[float] = None
    pack_unit: Optional[str] = None
    coverage_per_unit: Optional[float] = None
    coverage_unit: Optional[str] = None
    cost: Optional[float] = None
    retail: Optional[float] = None
    our_price: Optional[float] = None
    vendor: Optional[str] = None
    vendor_url: Optional[str] = None
    notes: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ============================================================
# JOB SCHEMAS
# ============================================================

class JobBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: str = "NJ"
    zip_code: Optional[str] = None
    status: JobStatus = JobStatus.DRAFT
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    labor_rate: float = 75.0
    overhead_percent: float = 15.0
    profit_percent: float = 20.0
    tax_percent: float = 6.625
    contingency_percent: float = 10.0
    notes: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    status: Optional[JobStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    labor_rate: Optional[float] = None
    overhead_percent: Optional[float] = None
    profit_percent: Optional[float] = None
    tax_percent: Optional[float] = None
    contingency_percent: Optional[float] = None
    notes: Optional[str] = None


class JobResponse(JobBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime


# ============================================================
# ROOM SCHEMAS
# ============================================================

class RoomDimensions(BaseModel):
    """Room dimension data"""
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    shapes: Optional[List[Dict[str, Any]]] = None  # Complex shapes
    openings: Optional[List[Dict[str, Any]]] = None  # Windows, doors, etc.


class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    room_type: Optional[str] = None
    dimensions: Optional[RoomDimensions] = None
    notes: Optional[str] = None


class RoomCreate(RoomBase):
    job_id: int


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    room_type: Optional[str] = None
    dimensions: Optional[RoomDimensions] = None
    notes: Optional[str] = None


class RoomResponse(RoomBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    job_id: int
    created_at: datetime
    updated_at: datetime


# ============================================================
# LINE ITEM SCHEMAS
# ============================================================

class LineItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    qty: float
    unit: str = "each"
    unit_price: float = 0.0
    notes: Optional[str] = None


class LineItemCreate(LineItemBase):
    job_id: int
    room_id: Optional[int] = None
    product_id: Optional[int] = None
    calculator_type: Optional[str] = None
    calculator_inputs: Optional[Dict[str, Any]] = None


class LineItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    qty: Optional[float] = None
    unit: Optional[str] = None
    unit_price: Optional[float] = None
    product_id: Optional[int] = None
    notes: Optional[str] = None


class LineItemResponse(LineItemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    job_id: int
    room_id: Optional[int]
    product_id: Optional[int]
    extended_price: float
    calculator_type: Optional[str]
    is_mapped: bool
    mapping_confidence: Optional[float]
    created_at: datetime
    updated_at: datetime


# ============================================================
# CALCULATOR SCHEMAS
# ============================================================

class CalculatorLineItem(BaseModel):
    """Output line item from a calculator"""
    sku: Optional[str] = None
    name: str
    qty: float
    unit: str
    category: ProductCategory
    notes: Optional[str] = None
    formula: Optional[str] = None  # Show the formula used


class CalculatorResult(BaseModel):
    """Calculator output"""
    calculator_type: str
    inputs: Dict[str, Any]
    line_items: List[CalculatorLineItem]
    summary: Dict[str, Any]
    formulas_used: List[str]


# Tile Floor Calculator
class TileFloorInput(BaseModel):
    """Tile floor calculator inputs"""
    # Area inputs (multiple methods)
    length_ft: Optional[float] = None
    width_ft: Optional[float] = None
    area_sqft: Optional[float] = None  # Direct input
    shapes: Optional[List[Dict[str, Any]]] = None  # Complex shapes
    
    # Tile specs
    tile_length_in: float = 12.0
    tile_width_in: float = 12.0
    
    # Waste & rounding
    waste_percent: float = 10.0
    round_up_to_box: bool = True
    tiles_per_box: int = 10
    
    # Options
    include_mortar: bool = True
    include_grout: bool = True
    grout_joint_width_in: float = 0.125  # 1/8"


# Thinset/Mortar Calculator
class ThinsetInput(BaseModel):
    """Thinset/mortar calculator inputs"""
    area_sqft: float
    
    # Trowel selection
    trowel_notch_size: str = "1/2x1/2"  # Options: 1/4x1/4, 1/4x3/8, 1/2x1/2, 3/4x3/4
    
    # Tile size affects coverage
    tile_size: str = "large"  # small (<6"), medium (6-15"), large (>15")
    
    # Substrate factors
    substrate_type: str = "cement_board"  # plywood, cement_board, concrete, existing_tile
    substrate_condition: str = "good"  # good, fair, poor
    
    # Back-buttering
    back_butter: bool = False
    back_butter_coverage: float = 50.0  # % of tile back
    
    # Product specs (override defaults)
    bag_weight_lbs: float = 50.0
    coverage_per_bag_sqft: Optional[float] = None  # Override calculated coverage


# Drywall Joint Compound Calculator
class DrywallCompoundInput(BaseModel):
    """Drywall joint compound calculator inputs"""
    # Area
    drywall_sqft: float
    
    # Joint types
    linear_feet_seams: float = 0  # Flat seams (4' joints)
    linear_feet_corners: float = 0  # Inside corners
    linear_feet_outside_corners: float = 0  # Outside corners (with bead)
    num_screw_spots: int = 0  # Number of screws to cover
    
    # Compound type preference
    compound_type: str = "premix"  # "premix" (buckets) or "dry_mix" (bags)
    
    # Application
    num_coats: int = 3
    skill_level: str = "professional"  # professional, intermediate, diy
    
    # Product specs
    bucket_weight_lbs: float = 61.7  # Standard 5-gal premix
    bag_weight_lbs: float = 25.0  # Standard dry mix bag
    
    # Include accessories
    include_tape: bool = True
    include_corner_bead: bool = True
    include_sandpaper: bool = True


# ============================================================
# PRESET SCHEMAS
# ============================================================

class PresetBase(BaseModel):
    calculator_type: str
    name: str
    description: Optional[str] = None
    settings: Dict[str, Any]
    is_default: bool = False


class PresetCreate(PresetBase):
    pass


class PresetResponse(PresetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime


# ============================================================
# IMPORT SCHEMAS
# ============================================================

class ImportRequest(BaseModel):
    """Request to import data"""
    source: PriceSource
    file_path: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class ImportStatus(BaseModel):
    """Import job status"""
    id: int
    source: PriceSource
    filename: Optional[str]
    status: str
    records_total: int
    records_created: int
    records_updated: int
    records_failed: int
    errors: Optional[List[str]]
    started_at: datetime
    completed_at: Optional[datetime]


# ============================================================
# BOM / ESTIMATE SCHEMAS
# ============================================================

class BOMSummary(BaseModel):
    """Bill of Materials summary"""
    job_id: int
    job_name: str
    total_items: int
    mapped_items: int
    unmapped_items: int
    subtotal_materials: float
    subtotal_labor: float
    overhead: float
    profit: float
    tax: float
    contingency: float
    grand_total: float
    line_items: List[LineItemResponse]


class EstimateExport(BaseModel):
    """Export format for estimates"""
    job: JobResponse
    rooms: List[RoomResponse]
    bom: BOMSummary
    generated_at: datetime
