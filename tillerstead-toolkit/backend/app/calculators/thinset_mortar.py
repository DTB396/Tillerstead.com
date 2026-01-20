"""
Thinset/Mortar Calculator
Calculates mortar requirements based on trowel size, tile size, and substrate
"""
import math
from typing import Dict, Any, List
from app.calculators.base import (
    BaseCalculator, CalculatorRegistry,
    TROWEL_COVERAGE, SUBSTRATE_FACTORS, SUBSTRATE_CONDITION_FACTORS
)
from app.schemas.schemas import CalculatorResult, CalculatorLineItem, ProductCategory


@CalculatorRegistry.register("thinset_mortar")
class ThinsetMortarCalculator(BaseCalculator):
    """
    Thinset/Mortar Calculator
    
    Calculates mortar requirements based on:
    - Coverage area
    - Trowel notch size
    - Tile size category
    - Substrate type and condition
    - Back-buttering requirements
    """
    
    name = "Thinset/Mortar Calculator"
    description = "Calculate thinset mortar for tile installations per TCNA standards"
    category = "tile"
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "area_sqft": {
                    "type": "number",
                    "description": "Total area to cover in square feet",
                    "minimum": 0.1
                },
                "trowel_notch_size": {
                    "type": "string",
                    "enum": ["1/4x1/4", "1/4x3/8", "1/2x1/2", "3/4x3/4"],
                    "default": "1/2x1/2",
                    "description": "Trowel notch size"
                },
                "tile_size": {
                    "type": "string",
                    "enum": ["small", "medium", "large", "xlarge"],
                    "default": "large",
                    "description": "Tile size category"
                },
                "substrate_type": {
                    "type": "string",
                    "enum": ["cement_board", "plywood", "concrete", "existing_tile", "ditra"],
                    "default": "cement_board",
                    "description": "Substrate material"
                },
                "substrate_condition": {
                    "type": "string",
                    "enum": ["good", "fair", "poor"],
                    "default": "good",
                    "description": "Substrate condition"
                },
                "back_butter": {
                    "type": "boolean",
                    "default": False,
                    "description": "Apply mortar to tile backs"
                },
                "back_butter_coverage": {
                    "type": "number",
                    "default": 50,
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Percentage of tile back to cover"
                },
                "bag_weight_lbs": {
                    "type": "number",
                    "default": 50,
                    "description": "Bag weight in pounds"
                },
                "coverage_per_bag_sqft": {
                    "type": "number",
                    "description": "Override: coverage per bag in sqft"
                }
            },
            "required": ["area_sqft"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "area_sqft": 100,
            "trowel_notch_size": "1/2x1/2",
            "tile_size": "large",
            "substrate_type": "cement_board",
            "substrate_condition": "good",
            "back_butter": False,
            "back_butter_coverage": 50,
            "bag_weight_lbs": 50,
            "coverage_per_bag_sqft": None
        }
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[str]:
        errors = []
        
        if inputs.get("area_sqft", 0) <= 0:
            errors.append("Area must be positive")
        
        valid_trowels = ["1/4x1/4", "1/4x3/8", "1/2x1/2", "3/4x3/4"]
        if inputs.get("trowel_notch_size") and inputs["trowel_notch_size"] not in valid_trowels:
            errors.append(f"Invalid trowel size. Use: {', '.join(valid_trowels)}")
        
        return errors
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate thinset mortar requirements"""
        
        # Merge with defaults
        params = {**self.get_default_inputs(), **inputs}
        
        area_sqft = params["area_sqft"]
        trowel = params["trowel_notch_size"]
        substrate = params["substrate_type"]
        condition = params["substrate_condition"]
        back_butter = params["back_butter"]
        bag_weight = params["bag_weight_lbs"]
        
        # Get base coverage from trowel
        base_coverage = TROWEL_COVERAGE.get(trowel, 50)
        
        # Apply substrate factor
        substrate_factor = SUBSTRATE_FACTORS.get(substrate, 1.0)
        condition_factor = SUBSTRATE_CONDITION_FACTORS.get(condition, 1.0)
        
        # Adjusted coverage
        adjusted_coverage = base_coverage / (substrate_factor * condition_factor)
        
        # User override
        if params["coverage_per_bag_sqft"]:
            adjusted_coverage = params["coverage_per_bag_sqft"]
        
        # Calculate bags for substrate
        bags_substrate = area_sqft / adjusted_coverage
        
        formulas = []
        formulas.append(
            f"Substrate mortar: {area_sqft:.1f} sqft ÷ {adjusted_coverage:.1f} sqft/bag = {bags_substrate:.2f} bags"
        )
        formulas.append(
            f"  (Base {base_coverage} sqft/bag × substrate factor {substrate_factor} × condition factor {condition_factor})"
        )
        
        # Back-butter calculation
        bags_backbutter = 0
        if back_butter:
            bb_coverage_pct = params["back_butter_coverage"]
            # Back-buttering uses roughly 1/4 of the trowel coverage per 100% coverage
            bb_ratio = bb_coverage_pct / 100 * 0.25
            bags_backbutter = area_sqft / base_coverage * bb_ratio
            formulas.append(
                f"Back-butter ({bb_coverage_pct}%): {bags_backbutter:.2f} bags additional"
            )
        
        # Total bags
        total_bags_exact = bags_substrate + bags_backbutter
        total_bags = math.ceil(total_bags_exact)
        
        formulas.append(f"Total: {total_bags_exact:.2f} → {total_bags} bags (rounded up)")
        
        # Determine mortar type recommendation
        if substrate == "ditra" or substrate == "existing_tile":
            mortar_type = "Modified thinset (ANSI A118.4/A118.15)"
        elif back_butter or params["tile_size"] in ["large", "xlarge"]:
            mortar_type = "Modified thinset (ANSI A118.4)"
        else:
            mortar_type = "Unmodified thinset (ANSI A118.1)"
        
        # Build line items
        line_items = []
        
        line_items.append(CalculatorLineItem(
            name=f"Thinset Mortar ({bag_weight}lb bag)",
            qty=total_bags,
            unit="bag",
            category=ProductCategory.MORTAR,
            notes=f"{mortar_type} recommended. Using {trowel} trowel on {substrate}.",
            formula=formulas[0]
        ))
        
        # Summary
        summary = {
            "area_sqft": area_sqft,
            "trowel_notch_size": trowel,
            "substrate_type": substrate,
            "substrate_condition": condition,
            "base_coverage_sqft_per_bag": base_coverage,
            "adjusted_coverage_sqft_per_bag": round(adjusted_coverage, 1),
            "back_butter_included": back_butter,
            "total_bags": total_bags,
            "total_lbs": total_bags * bag_weight,
            "recommended_mortar_type": mortar_type,
        }
        
        return CalculatorResult(
            calculator_type="thinset_mortar",
            inputs=params,
            line_items=line_items,
            summary=summary,
            formulas_used=formulas
        )


# TCNA Trowel Selection Guide
TROWEL_GUIDE = """
TCNA Trowel Selection Guide:

Tile Size              | Recommended Trowel
-----------------------|-------------------
Mosaic (<2")           | 1/4" × 1/4" square
4"×4" to 6"×6"         | 1/4" × 1/4" square
8"×8" to 12"×12"       | 1/4" × 3/8" square or U-notch
13"×13" to 16"×16"     | 1/2" × 1/2" square
>16" (large format)    | 1/2" × 1/2" or larger + back-butter

Notes:
- Larger tiles require larger trowel notches
- Always back-butter tiles >15" on any side
- Substrate flatness affects coverage significantly
- 95% coverage required for wet areas (ANSI A108/A118)
- 80% coverage required for dry areas
"""
