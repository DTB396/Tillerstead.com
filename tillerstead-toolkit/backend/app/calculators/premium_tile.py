"""
Premium Tile Calculators for Large Format and Specialty Installations
"""
from typing import Dict, Any
from decimal import Decimal
from app.calculators.base import BaseCalculator, CalculatorRegistry
from app.schemas.schemas import CalculatorResult, CalculatorLineItem
import math


@CalculatorRegistry.register("large_format_tile")
class LargeFormatTileCalculator(BaseCalculator):
    """
    Large Format Tile Calculator (>15" on any side)
    Includes specialized requirements per TCNA guidelines
    """
    
    name = "Large Format Tile Calculator"
    description = "TCNA-compliant calculator for large format tiles (>15\" any dimension)"
    category = "tile_installation"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate large format tile requirements"""
        
        area_sqft = Decimal(str(inputs.get("area_sqft", 0)))
        tile_length = Decimal(str(inputs.get("tile_length_in", 24)))
        tile_width = Decimal(str(inputs.get("tile_width_in", 48)))
        waste_percent = Decimal(str(inputs.get("waste_percent", 15))) / 100
        lippage_control = inputs.get("lippage_control_system", False)
        
        items = []
        warnings = []
        
        # Determine if truly large format
        is_large_format = tile_length >= 15 or tile_width >= 15
        if not is_large_format:
            warnings.append("⚠️ Tile size <15\" may not require large format methods")
        
        # Calculate tile quantity
        tile_area_sqft = (tile_length * tile_width) / 144  # Convert sq in to sq ft
        tiles_needed_base = float(area_sqft / tile_area_sqft)
        tiles_with_waste = math.ceil(tiles_needed_base * (1 + waste_percent))
        
        items.append(CalculatorLineItem(
            name=f"Tiles ({tile_length}\" x {tile_width}\")",
            quantity=tiles_with_waste,
            unit="tiles",
            unit_price=0,
            total_price=0,
            notes=f"Includes {float(waste_percent * 100)}% waste for cuts and breakage"
        ))
        
        # TCNA requirement: Large format requires medium bed mortar
        # Coverage for large format: 40-50 sqft per 50lb bag with 1/2" x 1/2" trowel
        medium_bed_coverage = Decimal("45")  # sqft per 50lb bag
        mortar_bags = math.ceil(area_sqft / medium_bed_coverage)
        
        items.append(CalculatorLineItem(
            name="Medium Bed Mortar (50lb bags)",
            quantity=mortar_bags,
            unit="bags",
            unit_price=0,
            total_price=0,
            notes="TCNA requires medium bed mortar for large format tile. Coverage: ~45 sqft/bag"
        ))
        
        # Back-buttering requirement
        warnings.append("✓ TCNA requires back-buttering for large format tiles")
        warnings.append("✓ Use 1/2\" x 1/2\" square notch or larger")
        
        # Lippage control system
        if lippage_control:
            # Estimate 4 clips + 1 wedge per tile corner, but corners shared = ~2 per tile
            clips_needed = math.ceil(tiles_with_waste * 2.5)
            wedges_needed = math.ceil(tiles_with_waste * 2.5)
            
            items.append(CalculatorLineItem(
                name="Lippage Control Clips",
                quantity=clips_needed,
                unit="clips",
                unit_price=0,
                total_price=0,
                notes="Reusable bases for lippage control system"
            ))
            
            items.append(CalculatorLineItem(
                name="Lippage Control Wedges",
                quantity=wedges_needed,
                unit="wedges",
                unit_price=0,
                total_price=0,
                notes="Single-use wedges for leveling system"
            ))
            
            warnings.append("✓ Lippage control system included for professional results")
        else:
            warnings.append("⚠️ Consider lippage control system for large format tile")
        
        # Substrate requirements
        warnings.append("✓ Substrate must be flat within 1/8\" in 10' for large format")
        warnings.append("✓ L/360 deflection maximum (may require reinforcement)")
        
        # Joint requirements
        if tile_length >= 24 or tile_width >= 24:
            warnings.append("✓ Soft joints required every 20-25' per TCNA")
        
        # Grout calculation
        joint_width = Decimal(str(inputs.get("joint_width_in", 0.25)))
        tile_thickness = Decimal(str(inputs.get("tile_thickness_in", 0.375)))
        
        # Grout formula: (L + W) / (L × W) × joint_width × tile_thickness × 1.8 = lbs per sqft
        grout_lbs_per_sqft = (
            ((tile_length + tile_width) / (tile_length * tile_width)) * 
            joint_width * tile_thickness * Decimal("1.8")
        )
        total_grout_lbs = area_sqft * grout_lbs_per_sqft * (1 + Decimal("0.1"))  # 10% extra
        grout_bags_25lb = math.ceil(total_grout_lbs / 25)
        
        items.append(CalculatorLineItem(
            name="Grout (25lb bags)",
            quantity=grout_bags_25lb,
            unit="bags",
            unit_price=0,
            total_price=0,
            notes=f"{float(joint_width)}\" joint width, epoxy recommended for large format"
        ))
        
        # Recommend epoxy for large format
        warnings.append("💡 Consider epoxy grout for superior bond strength with large format")
        
        summary = f"""
Large Format Tile Installation:
- Tile Size: {tile_length}\" × {tile_width}\" ({float(tile_area_sqft):.2f} sqft per tile)
- Area: {area_sqft} sqft
- Tiles Needed: {tiles_with_waste} (includes {float(waste_percent * 100)}% waste)
- Mortar: {mortar_bags} bags (50lb medium bed)
- Grout: {grout_bags_25lb} bags (25lb)
- Lippage Control: {'Yes' if lippage_control else 'Recommended'}

TCNA Requirements:
✓ Medium bed mortar required
✓ Back-butter all tiles
✓ Substrate flat to 1/8\" in 10'
✓ Maximum L/360 deflection
        """.strip()
        
        return CalculatorResult(
            total_quantity=tiles_with_waste,
            total_cost=float(area_sqft),
            unit="tiles",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "tile_size": f"{tile_length}\" × {tile_width}\"",
                "is_large_format": is_large_format,
                "requires_lippage_control": True,
                "tcna_compliant": True,
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "area_sqft": {
                    "type": "number",
                    "title": "Floor Area (sqft)",
                    "minimum": 0,
                },
                "tile_length_in": {
                    "type": "number",
                    "title": "Tile Length (inches)",
                    "minimum": 1,
                    "default": 24,
                },
                "tile_width_in": {
                    "type": "number",
                    "title": "Tile Width (inches)",
                    "minimum": 1,
                    "default": 48,
                },
                "tile_thickness_in": {
                    "type": "number",
                    "title": "Tile Thickness (inches)",
                    "minimum": 0.1,
                    "default": 0.375,
                },
                "joint_width_in": {
                    "type": "number",
                    "title": "Grout Joint Width (inches)",
                    "enum": [0.125, 0.1875, 0.25, 0.375, 0.5],
                    "default": 0.25,
                },
                "waste_percent": {
                    "type": "number",
                    "title": "Waste Percentage",
                    "minimum": 0,
                    "maximum": 100,
                    "default": 15,
                },
                "lippage_control_system": {
                    "type": "boolean",
                    "title": "Use Lippage Control System",
                    "description": "Highly recommended for large format tile",
                    "default": True,
                },
            },
            "required": ["area_sqft", "tile_length_in", "tile_width_in"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "area_sqft": 100,
            "tile_length_in": 24,
            "tile_width_in": 48,
            "tile_thickness_in": 0.375,
            "joint_width_in": 0.25,
            "waste_percent": 15,
            "lippage_control_system": True,
        }


@CalculatorRegistry.register("shower_pan_liner")
class ShowerPanLinerCalculator(BaseCalculator):
    """
    Shower Pan Liner Calculator
    Calculate liner membrane for traditional mortar bed showers
    """
    
    name = "Shower Pan Liner Calculator"
    description = "CPE/PVC liner for mortar bed shower pans per TCNA"
    category = "waterproofing"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate shower pan liner requirements"""
        
        shower_length = Decimal(str(inputs.get("shower_length_in", 60)))
        shower_width = Decimal(str(inputs.get("shower_width_in", 32)))
        curb_height = Decimal(str(inputs.get("curb_height_in", 6)))
        wall_height = Decimal(str(inputs.get("wall_height_in", 12)))
        
        items = []
        warnings = []
        
        # Convert to feet for calculation
        length_ft = shower_length / 12
        width_ft = shower_width / 12
        curb_ft = curb_height / 12
        wall_ft = wall_height / 12
        
        # Liner needs to go up walls minimum 6-9" above curb
        # Total liner dimensions: floor + walls + overlap
        liner_length = length_ft + (wall_ft * 2) + Decimal("1")  # 1' extra
        liner_width = width_ft + (wall_ft * 2) + Decimal("1")
        
        liner_area = liner_length * liner_width
        
        items.append(CalculatorLineItem(
            name=f"CPE/PVC Shower Pan Liner",
            quantity=float(liner_area),
            unit="sqft",
            unit_price=0,
            total_price=0,
            notes=f"{float(liner_length):.1f}' × {float(liner_width):.1f}' (includes wall upturn)"
        ))
        
        # Pre-slope mortar (deck mud)
        floor_area = length_ft * width_ft
        # Pre-slope uses about 0.5 bag per sqft at 1/4" per foot slope
        preslope_bags = math.ceil(floor_area * Decimal("0.5"))
        
        items.append(CalculatorLineItem(
            name="Deck Mud for Pre-Slope (60lb bags)",
            quantity=preslope_bags,
            unit="bags",
            unit_price=0,
            total_price=0,
            notes="Pre-slope to drain before liner installation (1/4\" per foot)"
        ))
        
        # Top mortar bed
        # Thickness: typically 1.5-2" at perimeter, sloped to drain
        top_bed_bags = math.ceil(floor_area * Decimal("1.2"))
        
        items.append(CalculatorLineItem(
            name="Deck Mud for Top Bed (60lb bags)",
            quantity=top_bed_bags,
            unit="bags",
            unit_price=0,
            total_price=0,
            notes="Top mortar bed over liner (min 1.25\" at drain)"
        ))
        
        # Drain assembly
        items.append(CalculatorLineItem(
            name="2-Piece Shower Drain Assembly",
            quantity=1,
            unit="drain",
            unit_price=0,
            total_price=0,
            notes="Clamping drain with weep holes (Oatey, Schluter-Kerdi-Drain, etc.)"
        ))
        
        # Curb materials (if needed)
        curb_length_ft = width_ft  # Assumes curb across width
        curb_bags = math.ceil(curb_length_ft * Decimal("0.3"))
        
        items.append(CalculatorLineItem(
            name="Deck Mud for Curb (60lb bags)",
            quantity=curb_bags,
            unit="bags",
            unit_price=0,
            total_price=0,
            notes=f"Mortar for {float(curb_height)}\" tall curb"
        ))
        
        # Liner accessories
        items.append(CalculatorLineItem(
            name="Liner Adhesive/Primer",
            quantity=1,
            unit="quart",
            unit_price=0,
            total_price=0,
            notes="For sealing seams and corners"
        ))
        
        items.append(CalculatorLineItem(
            name="Reinforcing Fabric",
            quantity=math.ceil(float(liner_area) / 10),
            unit="sqft",
            unit_price=0,
            total_price=0,
            notes="For reinforcing corners and seams"
        ))
        
        # TCNA warnings and requirements
        warnings.append("✓ Pre-slope drain area 1/4\" per foot BEFORE liner")
        warnings.append("✓ Liner must extend minimum 3\" up all walls")
        warnings.append("✓ Use 2-piece clamping drain with weep holes")
        warnings.append("✓ Test pan with 2\" water for 24 hours before top bed")
        warnings.append("✓ Top bed minimum 1.25\" thick at drain, 1/4\" per foot slope")
        warnings.append("⚠️ Never use screws/nails below liner height")
        
        summary = f"""
Shower Pan Liner Installation:
- Shower Size: {float(shower_length)}\" × {float(shower_width)}\" ({float(floor_area):.1f} sqft)
- Liner Size: {float(liner_length):.1f}' × {float(liner_width):.1f}' ({float(liner_area):.1f} sqft)
- Pre-Slope Mortar: {preslope_bags} bags
- Top Bed Mortar: {top_bed_bags} bags
- Curb Mortar: {curb_bags} bags

Installation Steps:
1. Frame and block curb
2. Install pre-slope (1/4\" per foot to drain)
3. Install liner with corners folded (no cuts at corners)
4. Install clamping drain
5. Flood test for 24 hours
6. Install top mortar bed
7. Waterproof walls before tile
        """.strip()
        
        return CalculatorResult(
            total_quantity=float(liner_area),
            total_cost=float(floor_area),
            unit="sqft liner",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "shower_dimensions": f"{shower_length}\" × {shower_width}\"",
                "liner_dimensions": f"{float(liner_length):.1f}' × {float(liner_width):.1f}'",
                "tcna_method": "Traditional mortar bed",
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "shower_length_in": {
                    "type": "number",
                    "title": "Shower Length (inches)",
                    "minimum": 24,
                    "default": 60,
                },
                "shower_width_in": {
                    "type": "number",
                    "title": "Shower Width (inches)",
                    "minimum": 24,
                    "default": 32,
                },
                "curb_height_in": {
                    "type": "number",
                    "title": "Curb Height (inches)",
                    "minimum": 2,
                    "maximum": 12,
                    "default": 6,
                },
                "wall_height_in": {
                    "type": "number",
                    "title": "Wall Upturn Height (inches)",
                    "description": "How far up walls does liner extend (min 3\", typically 9-12\")",
                    "minimum": 3,
                    "default": 12,
                },
            },
            "required": ["shower_length_in", "shower_width_in"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "shower_length_in": 60,
            "shower_width_in": 32,
            "curb_height_in": 6,
            "wall_height_in": 12,
        }
