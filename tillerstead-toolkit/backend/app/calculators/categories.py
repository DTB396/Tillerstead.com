"""
Premium Calculator Organization System
Categorized calculators for optimal user experience
"""
from typing import Dict, List, Any
from enum import Enum


class CalculatorCategory(str, Enum):
    """Premium calculator categories for intuitive navigation"""
    
    # Core Installation (Most Used) - THE ESSENTIALS
    COMPLETE_PROJECTS = "complete_projects"
    TILE_INSTALLATION = "tile_installation"
    WATERPROOFING = "waterproofing"
    SUBSTRATE_PREP = "substrate_prep"
    
    # Finishing
    GROUTING = "grouting"
    TRIM_FINISHING = "trim_finishing"
    
    # General Construction
    DRYWALL = "drywall"
    PAINTING = "painting"
    FLOORING = "flooring"
    
    # NJ Compliance & Professional Tools
    NJ_COMPLIANCE = "nj_compliance"
    ESTIMATING_BIDDING = "estimating_bidding"
    PROJECT_PLANNING = "project_planning"


class CalculatorGroup:
    """Premium calculator grouping with icons and descriptions"""
    
    GROUPS = {
        # ========== PREMIUM TIER - ALL-IN-ONE CALCULATORS ==========
        "complete_projects": {
            "name": "⭐ Complete Project Calculators",
            "icon": "🎯",
            "description": "All-in-one calculators - tile, mortar, grout, waterproofing, labor, and NJ compliance",
            "color": "#10b981",  # Emerald - primary brand color
            "priority": 1,
            "premium": True,
            "badge": "RECOMMENDED",
            "calculators": [
                "integrated_tile_project",  # THE BIG ONE - does it all
            ],
            "features": [
                "✓ Calculate entire bathroom/kitchen remodel in one go",
                "✓ Intelligent integration - works with floor, wall, shower, or all",
                "✓ Automatic TCNA compliance",
                "✓ NJ HIC contract requirements included",
                "✓ Labor estimates included",
                "✓ Professional PDF export"
            ]
        },
        
        # ========== PROFESSIONAL TOOLS - NJ CONTRACTORS ==========
        "nj_compliance": {
            "name": "🏛️ NJ Compliance & Legal",
            "icon": "⚖️",
            "description": "Stay compliant with NJ Home Improvement Contractor regulations",
            "color": "#3b82f6",  # Blue
            "priority": 2,
            "premium": True,
            "calculators": [
                "nj_hic_contract",
                "nj_permit_estimator",
            ],
            "features": [
                "✓ NJ HIC #13VH10808800 compliant contracts",
                "✓ Deposit limits per NJ law",
                "✓ Required disclosures",
                "✓ Permit cost estimates by municipality",
                "✓ Inspection scheduling guide"
            ]
        },
        
        "estimating_bidding": {
            "name": "💰 Smart Bidding & Pricing",
            "icon": "📊",
            "description": "Win more contracts with data-driven pricing strategies",
            "color": "#c9a227",  # Gold
            "priority": 3,
            "premium": True,
            "badge": "WIN MORE BIDS",
            "calculators": [
                "competitive_bid_analyzer",
                "seasonal_pricing_optimizer",
            ],
            "features": [
                "✓ Analyze competitor pricing",
                "✓ Optimize profit margins",
                "✓ Seasonal demand pricing",
                "✓ Win probability calculator",
                "✓ NJ market insights"
            ]
        },
        
        # ========== CORE INSTALLATION - FOCUSED TOOLS ==========
        "tile_installation": {
            "name": "Tile Installation",
            "icon": "🔲",
            "description": "Individual tile, mortar, and installation calculators",
            "color": "#10b981",  # Emerald
            "priority": 4,
            "calculators": [
                "tile_floor",
                "tile_wall",
                "tile_shower",
                "mosaic_tile",
                "large_format_tile",
                "backsplash",
                "thinset_mortar",
            ],
            "features": [
                "✓ TCNA-compliant calculations",
                "✓ Waste factor optimization",
                "✓ Trowel size selection",
                "✓ Large format tile support"
            ]
        },
        "waterproofing": {
            "name": "Waterproofing & Membranes",
            "icon": "💧",
            "description": "Keep water where it belongs",
            "color": "#3b82f6",  # Blue
            "priority": 5,
            "calculators": [
                "liquid_waterproofing",
                "sheet_membrane",
                "shower_pan_liner",
                "uncoupling_membrane",
                "crack_isolation",
            ],
            "features": [
                "✓ Liquid vs sheet membrane",
                "✓ Shower system calculations",
                "✓ TCNA compliant methods"
            ]
        },
        "substrate_prep": {
            "name": "Substrate Preparation",
            "icon": "🏗️",
            "description": "Foundation work for perfect installs",
            "color": "#f59e0b",  # Amber
            "priority": 6,
            "calculators": [
                "self_leveler",
                "backer_board",
                "mud_bed",
                "floor_patching",
                "primer_sealer",
            ],
            "features": [
                "✓ Self-leveling compound",
                "✓ Cement board sizing",
                "✓ Mud bed thickness"
            ]
        },
        "grouting": {
            "name": "Grout & Sealing",
            "icon": "✨",
            "description": "Grout, caulk, and sealer calculations",
            "color": "#c9a227",  # Gold
            "priority": 7,
            "calculators": [
                "grout",
                "epoxy_grout",
                "grout_sealer",
                "caulk_sealant",
            ],
            "features": [
                "✓ Joint width optimization",
                "✓ Sanded vs unsanded",
                "✓ Epoxy grout calculations"
            ]
        },
        "trim_finishing": {
            "name": "Trim & Finishing",
            "icon": "📐",
            "description": "Baseboard, crown, and finishing touches",
            "color": "#8b5cf6",  # Purple
            "priority": 8,
            "calculators": [
                "baseboard_trim",
                "crown_molding",
                "chair_rail",
                "quarter_round",
                "bullnose_tile_trim",
                "schluter_profiles",
            ]
        },
        "drywall": {
            "name": "Drywall & Plaster",
            "icon": "🧱",
            "description": "Drywall, mud, and plaster work",
            "color": "#6b7280",  # Gray
            "priority": 6,
            "calculators": [
                "drywall_compound",
                "drywall_sheets",
                "plaster_veneer",
                "skim_coat",
            ]
        },
        "painting": {
            "name": "Painting",
            "icon": "🎨",
            "description": "Paint, primer, and coating calculations",
            "color": "#ef4444",  # Red
            "priority": 7,
            "calculators": [
                "paint_interior",
                "paint_exterior",
                "primer",
                "epoxy_coating",
            ]
        },
        "flooring": {
            "name": "Other Flooring",
            "icon": "📏",
            "description": "Non-tile flooring options",
            "color": "#14b8a6",  # Teal
            "priority": 8,
            "calculators": [
                "hardwood_flooring",
                "lvp_vinyl",
                "carpet",
                "underlayment",
            ]
        },
        "nj_compliance": {
            "name": "NJ Compliance Tools",
            "icon": "⚖️",
            "description": "New Jersey HIC compliance and regulations",
            "color": "#dc2626",  # NJ Red
            "priority": 9,
            "featured": True,
            "calculators": [
                "nj_hic_contract",
                "nj_sales_tax",
                "nj_permit_estimator",
                "tcna_compliance_check",
                "ada_compliance",
            ]
        },
        "estimating": {
            "name": "Estimating & Bidding",
            "icon": "💰",
            "description": "Professional estimates and proposals",
            "color": "#10b981",  # Emerald
            "priority": 10,
            "calculators": [
                "labor_estimator",
                "material_markup",
                "bid_builder",
                "project_timeline",
                "waste_calculator",
            ]
        },
        "project_planning": {
            "name": "Project Planning",
            "icon": "📋",
            "description": "Schedule, materials, and coordination",
            "color": "#8b5cf6",  # Purple
            "priority": 11,
            "calculators": [
                "material_ordering",
                "delivery_scheduler",
                "crew_scheduler",
                "waste_management",
                "cleanup_supplies",
            ]
        },
    }
    
    @classmethod
    def get_category_info(cls, category: str) -> Dict[str, Any]:
        """Get category metadata"""
        return cls.GROUPS.get(category, {})
    
    @classmethod
    def get_all_categories(cls) -> List[Dict[str, Any]]:
        """Get all categories sorted by priority"""
        categories = []
        for cat_id, cat_info in cls.GROUPS.items():
            categories.append({
                "id": cat_id,
                **cat_info
            })
        return sorted(categories, key=lambda x: x.get("priority", 999))
    
    @classmethod
    def get_featured_categories(cls) -> List[Dict[str, Any]]:
        """Get featured categories (NJ-specific tools)"""
        return [
            {"id": cat_id, **cat_info}
            for cat_id, cat_info in cls.GROUPS.items()
            if cat_info.get("featured", False)
        ]
    
    @classmethod
    def get_calculator_category(cls, calculator_id: str) -> str:
        """Find which category a calculator belongs to"""
        for cat_id, cat_info in cls.GROUPS.items():
            if calculator_id in cat_info.get("calculators", []):
                return cat_id
        return "other"


# Calculator metadata for enhanced UX
CALCULATOR_METADATA = {
    # Tile Installation
    "tile_floor": {
        "difficulty": "easy",
        "time": "2 min",
        "tcna_compliant": True,
        "tags": ["tile", "floor", "popular"],
    },
    "tile_wall": {
        "difficulty": "easy",
        "time": "2 min",
        "tcna_compliant": True,
        "tags": ["tile", "wall", "popular"],
    },
    "tile_shower": {
        "difficulty": "medium",
        "time": "5 min",
        "tcna_compliant": True,
        "tags": ["tile", "shower", "waterproofing", "popular"],
    },
    "large_format_tile": {
        "difficulty": "medium",
        "time": "3 min",
        "tcna_compliant": True,
        "tags": ["tile", "large-format", "premium"],
        "new": True,
    },
    
    # Waterproofing
    "liquid_waterproofing": {
        "difficulty": "easy",
        "time": "2 min",
        "tcna_compliant": True,
        "tags": ["waterproofing", "shower", "popular"],
    },
    "sheet_membrane": {
        "difficulty": "medium",
        "time": "3 min",
        "tcna_compliant": True,
        "tags": ["waterproofing", "membrane"],
    },
    "uncoupling_membrane": {
        "difficulty": "medium",
        "time": "2 min",
        "tcna_compliant": True,
        "tags": ["membrane", "ditra", "schluter"],
        "new": True,
    },
    
    # Substrate Prep
    "self_leveler": {
        "difficulty": "medium",
        "time": "3 min",
        "tcna_compliant": True,
        "tags": ["substrate", "leveling", "popular"],
    },
    "backer_board": {
        "difficulty": "easy",
        "time": "2 min",
        "tcna_compliant": True,
        "tags": ["substrate", "backer-board"],
    },
    
    # NJ Compliance (NEW!)
    "nj_hic_contract": {
        "difficulty": "easy",
        "time": "5 min",
        "tcna_compliant": False,
        "tags": ["nj", "legal", "contract", "compliance"],
        "new": True,
        "featured": True,
    },
    "nj_sales_tax": {
        "difficulty": "easy",
        "time": "1 min",
        "tcna_compliant": False,
        "tags": ["nj", "tax", "compliance"],
        "new": True,
        "featured": True,
    },
    "nj_permit_estimator": {
        "difficulty": "medium",
        "time": "5 min",
        "tcna_compliant": False,
        "tags": ["nj", "permit", "compliance"],
        "new": True,
        "featured": True,
    },
    "tcna_compliance_check": {
        "difficulty": "advanced",
        "time": "10 min",
        "tcna_compliant": True,
        "tags": ["tcna", "compliance", "professional"],
        "new": True,
        "featured": True,
    },
}


def get_calculator_badge(calculator_id: str) -> str:
    """Get badge for calculator (NEW, POPULAR, PRO, etc.)"""
    meta = CALCULATOR_METADATA.get(calculator_id, {})
    
    if meta.get("new"):
        return "NEW"
    if meta.get("featured"):
        return "⭐ FEATURED"
    if "popular" in meta.get("tags", []):
        return "🔥 POPULAR"
    if meta.get("difficulty") == "advanced":
        return "PRO"
    
    return ""


def get_calculator_search_terms(calculator_id: str) -> List[str]:
    """Get searchable terms for a calculator"""
    meta = CALCULATOR_METADATA.get(calculator_id, {})
    category = CalculatorGroup.get_calculator_category(calculator_id)
    category_info = CalculatorGroup.get_category_info(category)
    
    terms = [
        calculator_id.replace("_", " "),
        category,
        category_info.get("name", ""),
    ]
    
    terms.extend(meta.get("tags", []))
    
    return [t.lower() for t in terms if t]
