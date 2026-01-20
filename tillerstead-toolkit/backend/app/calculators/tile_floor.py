"""
Tile Floor Calculator
Calculates tile quantity, waste, and optional mortar/grout
"""
import math
from typing import Dict, Any, List
from app.calculators.base import (
    BaseCalculator, CalculatorRegistry, 
    TROWEL_COVERAGE, GROUT_COVERAGE_TABLE
)
from app.schemas.schemas import CalculatorResult, CalculatorLineItem, ProductCategory


@CalculatorRegistry.register("tile_floor")
class TileFloorCalculator(BaseCalculator):
    """
    Tile Floor Calculator
    
    Calculates:
    - Tile quantity with waste factor
    - Rounds up to full boxes
    - Optional: thinset mortar
    - Optional: grout
    """
    
    name = "Tile Floor Calculator"
    description = "Calculate tile, mortar, and grout for floor installations"
    category = "tile"
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "length_ft": {"type": "number", "description": "Room length in feet"},
                "width_ft": {"type": "number", "description": "Room width in feet"},
                "area_sqft": {"type": "number", "description": "Direct area input (sqft)"},
                "tile_length_in": {"type": "number", "default": 12, "description": "Tile length in inches"},
                "tile_width_in": {"type": "number", "default": 12, "description": "Tile width in inches"},
                "waste_percent": {"type": "number", "default": 10, "description": "Waste percentage"},
                "round_up_to_box": {"type": "boolean", "default": True},
                "tiles_per_box": {"type": "integer", "default": 10},
                "include_mortar": {"type": "boolean", "default": True},
                "include_grout": {"type": "boolean", "default": True},
                "grout_joint_width_in": {"type": "number", "default": 0.125},
            },
            "required": []
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "length_ft": 10,
            "width_ft": 10,
            "tile_length_in": 12,
            "tile_width_in": 12,
            "waste_percent": 10,
            "round_up_to_box": True,
            "tiles_per_box": 10,
            "include_mortar": True,
            "include_grout": True,
            "grout_joint_width_in": 0.125,
        }
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[str]:
        errors = []
        
        # Need either dimensions or direct area
        has_dimensions = inputs.get("length_ft") and inputs.get("width_ft")
        has_area = inputs.get("area_sqft")
        
        if not has_dimensions and not has_area:
            errors.append("Provide either length/width or direct area_sqft")
        
        if inputs.get("tile_length_in", 0) <= 0:
            errors.append("Tile length must be positive")
        
        if inputs.get("tile_width_in", 0) <= 0:
            errors.append("Tile width must be positive")
        
        if inputs.get("waste_percent", 0) < 0 or inputs.get("waste_percent", 0) > 50:
            errors.append("Waste percent must be between 0 and 50")
        
        return errors
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate tile floor materials"""
        
        # Merge with defaults
        params = {**self.get_default_inputs(), **inputs}
        
        # Calculate area
        if params.get("area_sqft"):
            area_sqft = params["area_sqft"]
        else:
            area_sqft = params["length_ft"] * params["width_ft"]
        
        # Tile dimensions
        tile_length_in = params["tile_length_in"]
        tile_width_in = params["tile_width_in"]
        tile_sqft = (tile_length_in * tile_width_in) / 144  # Convert to sqft
        
        # Waste factor
        waste_percent = params["waste_percent"]
        waste_factor = 1 + (waste_percent / 100)
        
        # Calculate tiles needed
        tiles_needed_exact = (area_sqft / tile_sqft) * waste_factor
        tiles_needed = math.ceil(tiles_needed_exact)
        
        # Round to boxes if requested
        tiles_per_box = params["tiles_per_box"]
        if params["round_up_to_box"] and tiles_per_box > 0:
            boxes_needed = math.ceil(tiles_needed / tiles_per_box)
            tiles_ordered = boxes_needed * tiles_per_box
        else:
            boxes_needed = tiles_needed / tiles_per_box if tiles_per_box > 0 else 0
            tiles_ordered = tiles_needed
        
        # Build line items
        line_items = []
        formulas = []
        
        # Tile line item
        tile_size_str = f"{int(tile_length_in)}x{int(tile_width_in)}"
        tile_formula = f"({area_sqft:.1f} sqft ÷ {tile_sqft:.3f} sqft/tile) × {waste_factor:.2f} waste = {tiles_needed_exact:.1f} tiles"
        formulas.append(tile_formula)
        
        if params["round_up_to_box"]:
            formulas.append(f"Rounded to {boxes_needed} boxes × {tiles_per_box} tiles/box = {tiles_ordered} tiles")
        
        line_items.append(CalculatorLineItem(
            name=f"Floor Tile ({tile_size_str})",
            qty=boxes_needed if params["round_up_to_box"] else tiles_needed,
            unit="box" if params["round_up_to_box"] else "tile",
            category=ProductCategory.TILE,
            notes=f"{tiles_ordered} tiles total, covers {area_sqft:.1f} sqft + {waste_percent}% waste",
            formula=tile_formula
        ))
        
        # Mortar (if requested)
        if params["include_mortar"]:
            # Determine trowel size based on tile size
            max_tile_dim = max(tile_length_in, tile_width_in)
            if max_tile_dim <= 6:
                trowel = "1/4x1/4"
            elif max_tile_dim <= 15:
                trowel = "1/4x3/8"
            else:
                trowel = "1/2x1/2"
            
            coverage = TROWEL_COVERAGE.get(trowel, 50)
            bags_needed = math.ceil(area_sqft / coverage)
            
            mortar_formula = f"{area_sqft:.1f} sqft ÷ {coverage} sqft/bag ({trowel} trowel) = {bags_needed} bags"
            formulas.append(mortar_formula)
            
            line_items.append(CalculatorLineItem(
                name="Thinset Mortar (50lb bag)",
                qty=bags_needed,
                unit="bag",
                category=ProductCategory.MORTAR,
                notes=f"Using {trowel} trowel notch",
                formula=mortar_formula
            ))
        
        # Grout (if requested)
        if params["include_grout"]:
            joint_width = params["grout_joint_width_in"]
            
            # Find closest grout coverage from table
            grout_key = (int(tile_length_in), int(tile_width_in), joint_width)
            lbs_per_sqft = GROUT_COVERAGE_TABLE.get(grout_key)
            
            if not lbs_per_sqft:
                # Estimate based on formula: joint_width × tile_perimeter / tile_area × constant
                tile_perimeter = 2 * (tile_length_in + tile_width_in)
                tile_area = tile_length_in * tile_width_in
                lbs_per_sqft = (joint_width * tile_perimeter / tile_area) * 3.5
            
            grout_lbs = area_sqft * lbs_per_sqft * 1.1  # 10% waste
            grout_bags = math.ceil(grout_lbs / 25)  # Standard 25lb bags
            
            grout_formula = f"{area_sqft:.1f} sqft × {lbs_per_sqft:.2f} lbs/sqft × 1.1 waste = {grout_lbs:.1f} lbs = {grout_bags} bags"
            formulas.append(grout_formula)
            
            line_items.append(CalculatorLineItem(
                name="Sanded Grout (25lb bag)",
                qty=grout_bags,
                unit="bag",
                category=ProductCategory.GROUT,
                notes=f'{joint_width}" joint width',
                formula=grout_formula
            ))
        
        # Summary
        summary = {
            "area_sqft": round(area_sqft, 1),
            "tile_size": f"{int(tile_length_in)}×{int(tile_width_in)}",
            "tiles_needed": tiles_ordered,
            "boxes_needed": boxes_needed if params["round_up_to_box"] else None,
            "waste_percent": waste_percent,
            "coverage_sqft": round(tiles_ordered * tile_sqft, 1),
            "extra_coverage_sqft": round(tiles_ordered * tile_sqft - area_sqft, 1),
        }
        
        return CalculatorResult(
            calculator_type="tile_floor",
            inputs=params,
            line_items=line_items,
            summary=summary,
            formulas_used=formulas
        )
