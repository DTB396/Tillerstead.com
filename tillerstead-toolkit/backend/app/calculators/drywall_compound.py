"""
Drywall Joint Compound Calculator
Supports both dry mix bags AND premix buckets
"""
import math
from typing import Dict, Any, List
from app.calculators.base import (
    BaseCalculator, CalculatorRegistry,
    COMPOUND_COVERAGE, TAPE_LF_PER_SQFT, 
    CORNER_BEAD_LF_PER_OUTSIDE_CORNER, SANDPAPER_SHEETS_PER_SQFT
)
from app.schemas.schemas import CalculatorResult, CalculatorLineItem, ProductCategory


@CalculatorRegistry.register("drywall_compound")
class DrywallCompoundCalculator(BaseCalculator):
    """
    Drywall Joint Compound Calculator
    
    Supports:
    - Premix buckets (ready-mixed joint compound)
    - Dry mix bags (setting-type or regular)
    
    Calculates based on:
    - Total drywall area
    - Linear feet of seams, corners
    - Number of coats
    - Skill level adjustment
    """
    
    name = "Drywall Joint Compound Calculator"
    description = "Calculate joint compound (mud), tape, and accessories for drywall finishing"
    category = "drywall"
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "drywall_sqft": {
                    "type": "number",
                    "description": "Total drywall area in square feet",
                    "minimum": 1
                },
                "linear_feet_seams": {
                    "type": "number",
                    "default": 0,
                    "description": "Linear feet of flat seams (butt joints, factory edges)"
                },
                "linear_feet_corners": {
                    "type": "number", 
                    "default": 0,
                    "description": "Linear feet of inside corners"
                },
                "linear_feet_outside_corners": {
                    "type": "number",
                    "default": 0,
                    "description": "Linear feet of outside corners"
                },
                "num_screw_spots": {
                    "type": "integer",
                    "default": 0,
                    "description": "Number of screw/nail spots to cover"
                },
                "compound_type": {
                    "type": "string",
                    "enum": ["premix", "dry_mix"],
                    "default": "premix",
                    "description": "Compound type: premix buckets or dry mix bags"
                },
                "num_coats": {
                    "type": "integer",
                    "default": 3,
                    "minimum": 1,
                    "maximum": 5,
                    "description": "Number of coats"
                },
                "skill_level": {
                    "type": "string",
                    "enum": ["professional", "intermediate", "diy"],
                    "default": "professional",
                    "description": "Applicator skill level"
                },
                "bucket_weight_lbs": {
                    "type": "number",
                    "default": 61.7,
                    "description": "Premix bucket weight (default: 5-gal = 61.7 lbs)"
                },
                "bag_weight_lbs": {
                    "type": "number",
                    "default": 25,
                    "description": "Dry mix bag weight in pounds"
                },
                "include_tape": {
                    "type": "boolean",
                    "default": True,
                    "description": "Include joint tape in estimate"
                },
                "include_corner_bead": {
                    "type": "boolean",
                    "default": True,
                    "description": "Include corner bead in estimate"
                },
                "include_sandpaper": {
                    "type": "boolean",
                    "default": True,
                    "description": "Include sanding supplies"
                }
            },
            "required": ["drywall_sqft"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "drywall_sqft": 500,
            "linear_feet_seams": 0,
            "linear_feet_corners": 0,
            "linear_feet_outside_corners": 0,
            "num_screw_spots": 0,
            "compound_type": "premix",
            "num_coats": 3,
            "skill_level": "professional",
            "bucket_weight_lbs": 61.7,
            "bag_weight_lbs": 25,
            "include_tape": True,
            "include_corner_bead": True,
            "include_sandpaper": True
        }
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[str]:
        errors = []
        
        if inputs.get("drywall_sqft", 0) <= 0:
            errors.append("Drywall area must be positive")
        
        if inputs.get("num_coats", 0) < 1:
            errors.append("Must apply at least 1 coat")
        
        return errors
    
    def _estimate_joints_from_area(self, sqft: float) -> Dict[str, float]:
        """
        Estimate joint linear footage from total area if not provided.
        Based on standard 4x8 sheets with typical room layouts.
        """
        # Approximately 1 sheet per 32 sqft
        sheets = sqft / 32
        
        # Each sheet has about 12 LF of seams on average (4' top, 4' bottom, 4' one side)
        # But sheets share seams, so roughly 8 LF per sheet in practice
        seams_lf = sheets * 8
        
        # Estimate corners based on typical room (4 inside corners per 200 sqft room @ 8' height)
        corners_lf = (sqft / 200) * 4 * 8
        
        # Estimate screws: ~1 per sqft for walls, 1.5 per sqft for ceilings (use 1.2 average)
        screw_spots = int(sqft * 1.2)
        
        return {
            "seams": seams_lf,
            "corners": corners_lf,
            "screws": screw_spots
        }
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate drywall joint compound and accessories"""
        
        # Merge with defaults
        params = {**self.get_default_inputs(), **inputs}
        
        sqft = params["drywall_sqft"]
        compound_type = params["compound_type"]
        num_coats = params["num_coats"]
        skill_level = params["skill_level"]
        
        # Get explicit joint measurements or estimate
        seams_lf = params["linear_feet_seams"]
        corners_lf = params["linear_feet_corners"]
        outside_corners_lf = params["linear_feet_outside_corners"]
        screw_spots = params["num_screw_spots"]
        
        # If no explicit joints provided, estimate from area
        if seams_lf == 0 and corners_lf == 0 and screw_spots == 0:
            estimates = self._estimate_joints_from_area(sqft)
            seams_lf = estimates["seams"]
            corners_lf = estimates["corners"]
            screw_spots = estimates["screws"]
        
        # Skill level adjustment (DIY uses more due to sanding/mistakes)
        skill_factors = {
            "professional": 1.0,
            "intermediate": 1.15,
            "diy": 1.35
        }
        skill_factor = skill_factors.get(skill_level, 1.0)
        
        # Calculate compound needed
        # Base: ~0.05 lbs per sqft for general coverage per coat
        # Plus joints: ~0.1 lbs per LF of seam, 0.15 per LF of corner
        # Plus screws: ~0.005 lbs per screw spot per coat
        
        base_lbs_per_sqft_per_coat = 0.05
        lbs_per_lf_seam_per_coat = 0.10
        lbs_per_lf_corner_per_coat = 0.15
        lbs_per_screw_per_coat = 0.005
        
        compound_lbs = (
            (sqft * base_lbs_per_sqft_per_coat * num_coats) +
            (seams_lf * lbs_per_lf_seam_per_coat * num_coats) +
            (corners_lf * lbs_per_lf_corner_per_coat * num_coats) +
            (screw_spots * lbs_per_screw_per_coat * num_coats)
        ) * skill_factor
        
        formulas = []
        formulas.append(
            f"Base: {sqft:.0f} sqft × {base_lbs_per_sqft_per_coat} lbs/sqft × {num_coats} coats = {sqft * base_lbs_per_sqft_per_coat * num_coats:.1f} lbs"
        )
        formulas.append(
            f"Seams: {seams_lf:.0f} LF × {lbs_per_lf_seam_per_coat} lbs/LF × {num_coats} coats = {seams_lf * lbs_per_lf_seam_per_coat * num_coats:.1f} lbs"
        )
        formulas.append(
            f"Corners: {corners_lf:.0f} LF × {lbs_per_lf_corner_per_coat} lbs/LF × {num_coats} coats = {corners_lf * lbs_per_lf_corner_per_coat * num_coats:.1f} lbs"
        )
        formulas.append(
            f"Skill factor ({skill_level}): × {skill_factor}"
        )
        formulas.append(f"Total compound: {compound_lbs:.1f} lbs")
        
        line_items = []
        
        # Calculate units based on compound type
        if compound_type == "premix":
            bucket_weight = params["bucket_weight_lbs"]
            buckets_needed = math.ceil(compound_lbs / bucket_weight)
            
            formulas.append(f"Buckets: {compound_lbs:.1f} lbs ÷ {bucket_weight} lbs/bucket = {buckets_needed} buckets")
            
            line_items.append(CalculatorLineItem(
                name=f"Premix Joint Compound (5-gal bucket)",
                qty=buckets_needed,
                unit="bucket",
                category=ProductCategory.JOINT_COMPOUND,
                notes=f"All-purpose or lightweight premix. {num_coats} coats.",
                formula=f"{compound_lbs:.1f} lbs ÷ {bucket_weight} lbs = {buckets_needed} buckets"
            ))
            
        else:  # dry_mix
            bag_weight = params["bag_weight_lbs"]
            bags_needed = math.ceil(compound_lbs / bag_weight)
            
            formulas.append(f"Bags: {compound_lbs:.1f} lbs ÷ {bag_weight} lbs/bag = {bags_needed} bags")
            
            line_items.append(CalculatorLineItem(
                name=f"Setting-Type Joint Compound ({bag_weight}lb bag)",
                qty=bags_needed,
                unit="bag",
                category=ProductCategory.JOINT_COMPOUND,
                notes=f"20-min, 45-min, or 90-min setting compound. {num_coats} coats.",
                formula=f"{compound_lbs:.1f} lbs ÷ {bag_weight} lbs = {bags_needed} bags"
            ))
        
        # Tape
        if params["include_tape"]:
            # Total seam + corner tape (inside corners use tape)
            tape_lf = seams_lf + corners_lf
            # Standard rolls are 250 ft or 500 ft
            tape_rolls_250 = math.ceil(tape_lf / 250)
            
            line_items.append(CalculatorLineItem(
                name="Paper Joint Tape (250 ft roll)",
                qty=tape_rolls_250,
                unit="roll",
                category=ProductCategory.DRYWALL,
                notes=f"Covers {tape_lf:.0f} LF of seams and inside corners",
                formula=f"{tape_lf:.0f} LF ÷ 250 ft/roll = {tape_rolls_250} rolls"
            ))
            formulas.append(f"Tape: {tape_lf:.0f} LF ÷ 250 ft/roll = {tape_rolls_250} rolls")
        
        # Corner bead
        if params["include_corner_bead"] and outside_corners_lf > 0:
            # Standard corner bead is 8 ft or 10 ft
            bead_pieces = math.ceil(outside_corners_lf / 8)
            
            line_items.append(CalculatorLineItem(
                name="Corner Bead (8 ft piece)",
                qty=bead_pieces,
                unit="piece",
                category=ProductCategory.DRYWALL,
                notes=f"Paper-faced or metal. Covers {outside_corners_lf:.0f} LF outside corners",
                formula=f"{outside_corners_lf:.0f} LF ÷ 8 ft/piece = {bead_pieces} pieces"
            ))
            formulas.append(f"Corner bead: {outside_corners_lf:.0f} LF ÷ 8 ft/piece = {bead_pieces} pieces")
        
        # Sandpaper
        if params["include_sandpaper"]:
            # Sanding screens or paper, roughly 1 sheet per 100 sqft
            sandpaper_sheets = max(3, math.ceil(sqft / 100))
            
            line_items.append(CalculatorLineItem(
                name="Sanding Screen (150-grit)",
                qty=sandpaper_sheets,
                unit="sheet",
                category=ProductCategory.DRYWALL,
                notes="150-grit for between coats, 220-grit for final",
                formula=f"{sqft:.0f} sqft ÷ 100 sqft/sheet = {sandpaper_sheets} sheets"
            ))
        
        # Summary
        summary = {
            "drywall_sqft": sqft,
            "compound_type": compound_type,
            "num_coats": num_coats,
            "skill_level": skill_level,
            "estimated_seams_lf": round(seams_lf, 0),
            "estimated_corners_lf": round(corners_lf, 0),
            "estimated_screw_spots": screw_spots,
            "total_compound_lbs": round(compound_lbs, 1),
            "units_needed": buckets_needed if compound_type == "premix" else bags_needed,
            "unit_type": "bucket" if compound_type == "premix" else "bag",
        }
        
        return CalculatorResult(
            calculator_type="drywall_compound",
            inputs=params,
            line_items=line_items,
            summary=summary,
            formulas_used=formulas
        )


# Usage guidance
DRYWALL_COMPOUND_GUIDE = """
Drywall Joint Compound Guide:

PREMIX (Ready-Mixed) Compound:
- All-Purpose: Good for all coats, most common
- Lightweight: Easier to sand, less shrinkage
- Topping: For final coat only, sandability
- Coverage: ~230 sqft per 5-gallon bucket (3 coats)

DRY MIX (Setting-Type) Compound:
- 20-minute: Fast, strong, minimal shrinkage
- 45-minute: Standard working time
- 90-minute: Extended working time
- Easy Sand versions: Easier to sand than regular
- Coverage: ~100 sqft per 25lb bag (varies by mix ratio)

Coat Sequence (Professional):
1. First coat: Embed tape, fill joints
2. Second coat: Build up, feather edges
3. Third coat: Skim coat, final feather

Tips:
- Don't apply too thick (causes cracking)
- Let each coat dry completely before sanding
- Use setting compound for first coat if concerned about cracking
- Light coats = less sanding
"""
