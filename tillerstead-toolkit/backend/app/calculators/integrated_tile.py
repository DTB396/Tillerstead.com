"""
Integrated Premium Tile Calculator Suite
Combines tile, mortar, grout, waterproofing, and NJ compliance in one intelligent interface
"""
from typing import Dict, Any, List, Optional
from decimal import Decimal
import math
from app.calculators.base import BaseCalculator, CalculatorRegistry, TROWEL_COVERAGE, GROUT_COVERAGE_TABLE
from app.schemas.schemas import CalculatorResult, CalculatorLineItem


@CalculatorRegistry.register("integrated_tile_project")
class IntegratedTileProjectCalculator(BaseCalculator):
    """
    All-in-One Premium Tile Project Calculator
    
    Intelligently calculates everything for a complete tile project:
    - Tile quantities (floor, wall, shower, backsplash)
    - Thinset mortar with TCNA compliance
    - Grout with joint width optimization
    - Waterproofing membranes
    - Substrate preparation
    - NJ HIC contract requirements
    - Labor estimates
    - Total project cost
    
    Can be used for:
    - Full bathroom remodel
    - Kitchen backsplash only
    - Shower stall only
    - Multiple rooms
    - Any combination
    """
    
    name = "Complete Tile Project Calculator"
    description = "All-in-one calculator for tile, mortar, grout, waterproofing, and compliance"
    category = "tile_installation"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate complete tile project with intelligent integration"""
        
        items = []
        warnings = []
        metadata = {}
        total_cost = Decimal("0")
        
        # Project areas (all optional - calculate only what's provided)
        floor_area = Decimal(str(inputs.get("floor_area_sqft", 0)))
        wall_area = Decimal(str(inputs.get("wall_area_sqft", 0)))
        shower_area = Decimal(str(inputs.get("shower_area_sqft", 0)))
        backsplash_area = Decimal(str(inputs.get("backsplash_area_sqft", 0)))
        
        total_tile_area = floor_area + wall_area + shower_area + backsplash_area
        
        if total_tile_area == 0:
            warnings.append("⚠️ No areas specified. Provide at least one area to calculate.")
            return self._empty_result(warnings)
        
        # Tile specifications
        tile_length = Decimal(str(inputs.get("tile_length_in", 12)))
        tile_width = Decimal(str(inputs.get("tile_width_in", 12)))
        tile_price_sqft = Decimal(str(inputs.get("tile_price_per_sqft", 0)))
        waste_percent = Decimal(str(inputs.get("waste_percent", 10))) / 100
        
        # Calculate if large format
        is_large_format = tile_length >= 15 or tile_width >= 15
        if is_large_format:
            warnings.append("✓ Large format tile detected - using medium bed mortar")
            # Increase waste for large format
            if waste_percent < Decimal("0.15"):
                waste_percent = Decimal("0.15")
                warnings.append("✓ Waste percentage increased to 15% for large format tile")
        
        # 1. TILE CALCULATION
        tile_items, tile_cost, tile_metadata = self._calculate_tiles(
            total_tile_area, tile_length, tile_width, tile_price_sqft, waste_percent, inputs
        )
        items.extend(tile_items)
        total_cost += tile_cost
        metadata.update(tile_metadata)
        
        # 2. MORTAR/THINSET CALCULATION
        if inputs.get("include_mortar", True):
            mortar_items, mortar_cost, mortar_warnings = self._calculate_mortar(
                total_tile_area, is_large_format, inputs
            )
            items.extend(mortar_items)
            total_cost += mortar_cost
            warnings.extend(mortar_warnings)
        
        # 3. GROUT CALCULATION
        if inputs.get("include_grout", True):
            grout_items, grout_cost, grout_warnings = self._calculate_grout(
                total_tile_area, tile_length, tile_width, inputs
            )
            items.extend(grout_items)
            total_cost += grout_cost
            warnings.extend(grout_warnings)
        
        # 4. WATERPROOFING (if shower/wet areas)
        if shower_area > 0 or inputs.get("needs_waterproofing", False):
            waterproof_items, waterproof_cost, waterproof_warnings = self._calculate_waterproofing(
                shower_area, wall_area, inputs
            )
            items.extend(waterproof_items)
            total_cost += waterproof_cost
            warnings.extend(waterproof_warnings)
        
        # 5. SUBSTRATE PREP
        if inputs.get("include_substrate_prep", True):
            substrate_items, substrate_cost, substrate_warnings = self._calculate_substrate(
                floor_area, inputs
            )
            items.extend(substrate_items)
            total_cost += substrate_cost
            warnings.extend(substrate_warnings)
        
        # 6. LABOR ESTIMATE
        if inputs.get("include_labor", True):
            labor_items, labor_cost = self._calculate_labor(
                floor_area, wall_area, shower_area, backsplash_area, inputs
            )
            items.extend(labor_items)
            total_cost += labor_cost
        
        # 7. NJ HIC COMPLIANCE
        if inputs.get("nj_contract", False):
            contract_items, contract_warnings = self._calculate_nj_contract(
                total_cost, inputs
            )
            items.extend(contract_items)
            warnings.extend(contract_warnings)
        
        # Add legal disclaimers
        warnings.insert(0, "📋 ESTIMATION TOOL ONLY - Not a binding estimate, quote, or invoice")
        warnings.insert(1, "⚖️ LEGAL DISCLAIMER: This calculator provides approximate material and cost estimates for planning purposes only. Actual project costs may vary based on site conditions, material availability, labor rates, and unforeseen circumstances. This is NOT a contract, proposal, or binding estimate. For an official quote, contact Tillerstead LLC directly.")
        warnings.insert(2, "🏛️ NJ HIC LICENSE: Tillerstead LLC #13VH10808800 - All work subject to signed contract and NJ Home Improvement Contractor Act compliance")
        
        metadata["disclaimer"] = "Estimation tool only - not a binding quote or contract"
        metadata["license"] = "NJ HIC #13VH10808800"
        metadata["requires_site_visit"] = "Yes - actual conditions may affect final pricing"
        metadata["not_binding"] = True
        
        # Generate summary
        summary = self._generate_summary(
            floor_area, wall_area, shower_area, backsplash_area,
            total_tile_area, total_cost, metadata
        )
        
        return CalculatorResult(
            total_quantity=float(total_tile_area),
            total_cost=float(total_cost),
            unit="sqft",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata=metadata
        )
    
    def _calculate_tiles(self, total_area, tile_length, tile_width, price_per_sqft, waste_percent, inputs):
        """Calculate tile quantities and costs"""
        items = []
        metadata = {}
        
        tile_sqft_each = (tile_length * tile_width) / 144
        tiles_needed = math.ceil(total_area * (1 + waste_percent) / tile_sqft_each)
        
        # Box calculation
        tiles_per_box = int(inputs.get("tiles_per_box", 10))
        boxes_needed = math.ceil(tiles_needed / tiles_per_box)
        actual_tiles = boxes_needed * tiles_per_box
        
        tile_cost = total_area * price_per_sqft if price_per_sqft > 0 else Decimal("0")
        
        items.append(CalculatorLineItem(
            name=f"Tile ({tile_length}\" x {tile_width}\")",
            quantity=actual_tiles,
            unit="tiles",
            unit_price=float(tile_cost / total_area) if total_area > 0 else 0,
            total_price=float(tile_cost),
            notes=f"{boxes_needed} boxes x {tiles_per_box} tiles/box. Covers {float(total_area)} sqft + {float(waste_percent * 100)}% waste"
        ))
        
        metadata["tiles_ordered"] = actual_tiles
        metadata["boxes_needed"] = boxes_needed
        metadata["waste_tiles"] = actual_tiles - math.ceil(total_area / tile_sqft_each)
        
        return items, tile_cost, metadata
    
    def _calculate_mortar(self, area, is_large_format, inputs):
        """Calculate thinset mortar with TCNA compliance"""
        items = []
        warnings = []
        
        # Determine trowel size and coverage
        if is_large_format:
            trowel_size = "1/2x1/2"
            coverage_per_bag = Decimal("45")  # Medium bed for large format
            mortar_type = "Medium Bed Mortar"
            warnings.append("✓ TCNA requires medium bed mortar for large format tiles")
            warnings.append("✓ Back-butter all large format tiles")
        else:
            trowel_size = inputs.get("trowel_size", "1/4x3/8")
            coverage_per_bag = Decimal(str(TROWEL_COVERAGE.get(trowel_size, 70)))
            mortar_type = "Thinset Mortar"
        
        # Substrate factor
        substrate = inputs.get("substrate_type", "cement_board")
        substrate_factor = Decimal("1.0")
        if substrate == "plywood":
            substrate_factor = Decimal("1.1")
        elif substrate == "existing_tile":
            substrate_factor = Decimal("1.2")
        
        # Calculate bags
        adjusted_coverage = coverage_per_bag / substrate_factor
        bags_needed = math.ceil(area / adjusted_coverage)
        
        bag_price = Decimal(str(inputs.get("mortar_price_per_bag", 25)))
        mortar_cost = bags_needed * bag_price
        
        items.append(CalculatorLineItem(
            name=f"{mortar_type} (50lb bags)",
            quantity=bags_needed,
            unit="bags",
            unit_price=float(bag_price),
            total_price=float(mortar_cost),
            notes=f"Trowel: {trowel_size}, Coverage: ~{float(adjusted_coverage)} sqft/bag, Substrate: {substrate}"
        ))
        
        return items, mortar_cost, warnings
    
    def _calculate_grout(self, area, tile_length, tile_width, inputs):
        """Calculate grout with joint width"""
        items = []
        warnings = []
        
        joint_width = Decimal(str(inputs.get("grout_joint_in", 0.125)))
        
        # Simplified grout calculation (lbs per sqft based on joint)
        if joint_width <= Decimal("0.125"):
            lbs_per_sqft = Decimal("0.15")
        elif joint_width <= Decimal("0.1875"):
            lbs_per_sqft = Decimal("0.22")
        else:
            lbs_per_sqft = Decimal("0.30")
        
        grout_lbs = math.ceil(area * lbs_per_sqft)
        
        # Convert to bags (25lb standard)
        bags_needed = math.ceil(grout_lbs / 25)
        bag_price = Decimal(str(inputs.get("grout_price_per_bag", 35)))
        grout_cost = bags_needed * bag_price
        
        grout_type = inputs.get("grout_type", "sanded")
        
        if joint_width < Decimal("0.125") and grout_type == "sanded":
            warnings.append("⚠️ Consider unsanded grout for joints <1/8\"")
        
        items.append(CalculatorLineItem(
            name=f"{grout_type.title()} Grout (25lb bags)",
            quantity=bags_needed,
            unit="bags",
            unit_price=float(bag_price),
            total_price=float(grout_cost),
            notes=f"Joint width: {float(joint_width)}\" | ~{grout_lbs}lbs total"
        ))
        
        return items, grout_cost, warnings
    
    def _calculate_waterproofing(self, shower_area, wall_area, inputs):
        """Calculate waterproofing membranes and systems"""
        items = []
        warnings = []
        cost = Decimal("0")
        
        waterproof_type = inputs.get("waterproof_type", "liquid")
        
        if waterproof_type == "liquid":
            # Liquid waterproofing: ~50 sqft per gallon, 2 coats
            total_area = shower_area + (wall_area * Decimal("0.3"))  # Only wet walls
            gallons_needed = math.ceil(total_area / 25)  # 2 coats = 25 sqft/gal
            
            price_per_gallon = Decimal(str(inputs.get("waterproof_price_per_gal", 45)))
            cost = gallons_needed * price_per_gallon
            
            items.append(CalculatorLineItem(
                name="Liquid Waterproofing Membrane",
                quantity=gallons_needed,
                unit="gallons",
                unit_price=float(price_per_gallon),
                total_price=float(cost),
                notes=f"2 coats, covers {float(total_area)} sqft wet area"
            ))
            
            warnings.append("✓ Apply 2 coats minimum for liquid waterproofing")
            warnings.append("✓ Use fabric reinforcement at corners and transitions")
            
        elif waterproof_type == "sheet":
            # Sheet membrane (Kerdi, etc)
            total_area = shower_area + wall_area
            # Sheets typically 54\" x 33' rolls = ~150 sqft
            rolls_needed = math.ceil(total_area / 150)
            
            price_per_roll = Decimal(str(inputs.get("waterproof_price_per_roll", 180)))
            cost = rolls_needed * price_per_roll
            
            items.append(CalculatorLineItem(
                name="Sheet Waterproofing Membrane (Kerdi-style)",
                quantity=rolls_needed,
                unit="rolls",
                unit_price=float(price_per_roll),
                total_price=float(cost),
                notes=f"~150 sqft per roll, covers {float(total_area)} sqft"
            ))
            
            warnings.append("✓ Use unmodified thinset with sheet membranes")
        
        return items, cost, warnings
    
    def _calculate_substrate(self, floor_area, inputs):
        """Calculate substrate prep materials"""
        items = []
        warnings = []
        cost = Decimal("0")
        
        if floor_area == 0:
            return items, cost, warnings
        
        substrate_type = inputs.get("needs_substrate", None)
        
        if substrate_type == "cement_board":
            # 3x5 sheets = 15 sqft each
            sheets_needed = math.ceil(floor_area / 15)
            price_per_sheet = Decimal(str(inputs.get("backer_board_price", 12)))
            cost = sheets_needed * price_per_sheet
            
            items.append(CalculatorLineItem(
                name="Cement Backer Board (3'x5' sheets)",
                quantity=sheets_needed,
                unit="sheets",
                unit_price=float(price_per_sheet),
                total_price=float(cost),
                notes=f"Covers {float(floor_area)} sqft floor"
            ))
            
            warnings.append("✓ Use screws every 8\" on edges, 12\" in field")
            
        elif substrate_type == "self_leveler":
            # Self leveling compound: ~50 lbs per 50 sqft at 1/8" thick
            lbs_needed = math.ceil(floor_area)
            bags_needed = math.ceil(lbs_needed / 50)
            price_per_bag = Decimal(str(inputs.get("leveler_price_per_bag", 40)))
            cost = bags_needed * price_per_bag
            
            items.append(CalculatorLineItem(
                name="Self-Leveling Compound (50lb bags)",
                quantity=bags_needed,
                unit="bags",
                unit_price=float(price_per_bag),
                total_price=float(cost),
                notes=f"~1/8\" thickness over {float(floor_area)} sqft"
            ))
            
            warnings.append("✓ Prime substrate before applying self-leveler")
            warnings.append("✓ Mix to proper consistency - follow manufacturer specs")
        
        return items, cost, warnings
    
    def _calculate_labor(self, floor_area, wall_area, shower_area, backsplash_area, inputs):
        """Calculate labor estimates"""
        items = []
        cost = Decimal("0")
        
        # Labor rates per sqft (NJ market rates)
        floor_rate = Decimal(str(inputs.get("labor_floor_per_sqft", 8)))
        wall_rate = Decimal(str(inputs.get("labor_wall_per_sqft", 10)))
        shower_rate = Decimal(str(inputs.get("labor_shower_per_sqft", 15)))
        backsplash_rate = Decimal(str(inputs.get("labor_backsplash_per_sqft", 12)))
        
        if floor_area > 0:
            floor_labor = floor_area * floor_rate
            cost += floor_labor
            items.append(CalculatorLineItem(
                name="Floor Tile Installation Labor",
                quantity=float(floor_area),
                unit="sqft",
                unit_price=float(floor_rate),
                total_price=float(floor_labor),
                notes=f"Professional installation"
            ))
        
        if wall_area > 0:
            wall_labor = wall_area * wall_rate
            cost += wall_labor
            items.append(CalculatorLineItem(
                name="Wall Tile Installation Labor",
                quantity=float(wall_area),
                unit="sqft",
                unit_price=float(wall_rate),
                total_price=float(wall_labor),
                notes=f"Professional installation"
            ))
        
        if shower_area > 0:
            shower_labor = shower_area * shower_rate
            cost += shower_labor
            items.append(CalculatorLineItem(
                name="Shower Tile Installation Labor",
                quantity=float(shower_area),
                unit="sqft",
                unit_price=float(shower_rate),
                total_price=float(shower_labor),
                notes=f"Includes waterproofing and shower-specific details"
            ))
        
        if backsplash_area > 0:
            backsplash_labor = backsplash_area * backsplash_rate
            cost += backsplash_labor
            items.append(CalculatorLineItem(
                name="Backsplash Installation Labor",
                quantity=float(backsplash_area),
                unit="sqft",
                unit_price=float(backsplash_rate),
                total_price=float(backsplash_labor),
                notes=f"Professional installation"
            ))
        
        return items, cost
    
    def _calculate_nj_contract(self, project_total, inputs):
        """Generate NJ HIC contract compliance"""
        items = []
        warnings = []
        
        deposit_percent = Decimal(str(inputs.get("deposit_percent", 10)))
        
        # NJ law: deposit limited to 1/3 or $1000 (whichever less) for <$5000
        if project_total < 5000:
            max_deposit = min(project_total / 3, Decimal("1000"))
        else:
            max_deposit = project_total / 3
        
        requested_deposit = project_total * (deposit_percent / 100)
        deposit = min(requested_deposit, max_deposit)
        
        if requested_deposit > max_deposit:
            warnings.append(f"⚠️ Deposit adjusted from ${float(requested_deposit):.2f} to ${float(deposit):.2f} per NJ law")
        
        items.append(CalculatorLineItem(
            name="NJ HIC Compliant Contract Deposit",
            quantity=1,
            unit="payment",
            unit_price=float(deposit),
            total_price=float(deposit),
            notes=f"NJ HIC #13VH10808800 | Maximum {float(deposit_percent)}% deposit = ${float(deposit):.2f}"
        ))
        
        warnings.append("✓ Contract must include 3-day right to cancel notice")
        warnings.append("✓ Provide signed contract copy within 48 hours")
        warnings.append("✓ All changes require written change orders")
        
        return items, warnings
    
    def _generate_summary(self, floor, wall, shower, backsplash, total_area, total_cost, metadata):
        """Generate comprehensive project summary"""
        
        areas = []
        if floor > 0:
            areas.append(f"Floor: {float(floor)} sqft")
        if wall > 0:
            areas.append(f"Wall: {float(wall)} sqft")
        if shower > 0:
            areas.append(f"Shower: {float(shower)} sqft")
        if backsplash > 0:
            areas.append(f"Backsplash: {float(backsplash)} sqft")
        
        summary = f"""
TILLERSTEAD COMPLETE PROJECT ESTIMATE
======================================
Project Areas:
{chr(10).join(f"  • {area}" for area in areas)}

Total Coverage: {float(total_area)} sqft
Tiles Needed: {metadata.get('tiles_ordered', 0)} tiles ({metadata.get('boxes_needed', 0)} boxes)
Waste Factor: {metadata.get('waste_tiles', 0)} extra tiles

TOTAL PROJECT COST: ${float(total_cost):,.2f}

This estimate includes materials and labor for a complete,
TCNA-compliant tile installation.

Licensed NJ HIC #13VH10808800
        """.strip()
        
        return summary
    
    def _empty_result(self, warnings):
        """Return empty result with warnings"""
        return CalculatorResult(
            total_quantity=0,
            total_cost=0,
            unit="sqft",
            summary="No areas specified",
            line_items=[],
            warnings=warnings,
            metadata={}
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                # AREA INPUTS (all optional - mix and match)
                "floor_area_sqft": {
                    "type": "number",
                    "title": "Floor Area",
                    "description": "Square footage of floor to tile",
                    "minimum": 0,
                    "default": 0
                },
                "wall_area_sqft": {
                    "type": "number",
                    "title": "Wall Area",
                    "description": "Square footage of walls to tile",
                    "minimum": 0,
                    "default": 0
                },
                "shower_area_sqft": {
                    "type": "number",
                    "title": "Shower Area",
                    "description": "Square footage of shower to tile (includes waterproofing)",
                    "minimum": 0,
                    "default": 0
                },
                "backsplash_area_sqft": {
                    "type": "number",
                    "title": "Backsplash Area",
                    "description": "Square footage of backsplash",
                    "minimum": 0,
                    "default": 0
                },
                
                # TILE SPECS
                "tile_length_in": {
                    "type": "number",
                    "title": "Tile Length (inches)",
                    "default": 12,
                    "minimum": 1
                },
                "tile_width_in": {
                    "type": "number",
                    "title": "Tile Width (inches)",
                    "default": 12,
                    "minimum": 1
                },
                "tile_price_per_sqft": {
                    "type": "number",
                    "title": "Tile Price per Sq Ft",
                    "default": 0,
                    "minimum": 0
                },
                "waste_percent": {
                    "type": "number",
                    "title": "Waste Percentage",
                    "default": 10,
                    "minimum": 5,
                    "maximum": 25
                },
                "tiles_per_box": {
                    "type": "integer",
                    "title": "Tiles per Box",
                    "default": 10,
                    "minimum": 1
                },
                
                # OPTIONAL COMPONENTS (toggles)
                "include_mortar": {
                    "type": "boolean",
                    "title": "Include Thinset/Mortar",
                    "default": True
                },
                "include_grout": {
                    "type": "boolean",
                    "title": "Include Grout",
                    "default": True
                },
                "include_substrate_prep": {
                    "type": "boolean",
                    "title": "Include Substrate Prep",
                    "default": False
                },
                "include_labor": {
                    "type": "boolean",
                    "title": "Include Labor Estimate",
                    "default": True
                },
                "needs_waterproofing": {
                    "type": "boolean",
                    "title": "Needs Waterproofing",
                    "default": False,
                    "description": "Auto-enabled for shower areas"
                },
                "nj_contract": {
                    "type": "boolean",
                    "title": "Generate NJ HIC Contract Info",
                    "default": False
                },
                
                # MORTAR OPTIONS
                "trowel_size": {
                    "type": "string",
                    "title": "Trowel Notch Size",
                    "enum": ["1/4x1/4", "1/4x3/8", "1/2x1/2", "3/4x3/4"],
                    "default": "1/4x3/8"
                },
                "substrate_type": {
                    "type": "string",
                    "title": "Substrate Type",
                    "enum": ["cement_board", "plywood", "concrete", "existing_tile"],
                    "default": "cement_board"
                },
                "mortar_price_per_bag": {
                    "type": "number",
                    "title": "Mortar Price per 50lb Bag",
                    "default": 25
                },
                
                # GROUT OPTIONS
                "grout_joint_in": {
                    "type": "number",
                    "title": "Grout Joint Width (inches)",
                    "default": 0.125,
                    "enum": [0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5]
                },
                "grout_type": {
                    "type": "string",
                    "title": "Grout Type",
                    "enum": ["sanded", "unsanded", "epoxy"],
                    "default": "sanded"
                },
                "grout_price_per_bag": {
                    "type": "number",
                    "title": "Grout Price per 25lb Bag",
                    "default": 35
                },
                
                # WATERPROOFING OPTIONS
                "waterproof_type": {
                    "type": "string",
                    "title": "Waterproofing Type",
                    "enum": ["liquid", "sheet"],
                    "default": "liquid"
                },
                "waterproof_price_per_gal": {
                    "type": "number",
                    "title": "Liquid Waterproofing Price per Gallon",
                    "default": 45
                },
                "waterproof_price_per_roll": {
                    "type": "number",
                    "title": "Sheet Membrane Price per Roll",
                    "default": 180
                },
                
                # SUBSTRATE PREP
                "needs_substrate": {
                    "type": "string",
                    "title": "Substrate Prep Needed",
                    "enum": ["none", "cement_board", "self_leveler"],
                    "default": "none"
                },
                "backer_board_price": {
                    "type": "number",
                    "title": "Backer Board Price per Sheet",
                    "default": 12
                },
                "leveler_price_per_bag": {
                    "type": "number",
                    "title": "Self-Leveler Price per 50lb Bag",
                    "default": 40
                },
                
                # LABOR RATES (NJ market)
                "labor_floor_per_sqft": {
                    "type": "number",
                    "title": "Floor Labor Rate per Sq Ft",
                    "default": 8
                },
                "labor_wall_per_sqft": {
                    "type": "number",
                    "title": "Wall Labor Rate per Sq Ft",
                    "default": 10
                },
                "labor_shower_per_sqft": {
                    "type": "number",
                    "title": "Shower Labor Rate per Sq Ft",
                    "default": 15
                },
                "labor_backsplash_per_sqft": {
                    "type": "number",
                    "title": "Backsplash Labor Rate per Sq Ft",
                    "default": 12
                },
                
                # NJ CONTRACT
                "deposit_percent": {
                    "type": "number",
                    "title": "Desired Deposit Percentage",
                    "default": 10,
                    "minimum": 0,
                    "maximum": 33.33,
                    "description": "Will be adjusted to comply with NJ HIC law"
                }
            }
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        """Default inputs for a typical bathroom remodel"""
        return {
            "floor_area_sqft": 50,
            "shower_area_sqft": 60,
            "tile_length_in": 12,
            "tile_width_in": 12,
            "tile_price_per_sqft": 5,
            "waste_percent": 10,
            "include_mortar": True,
            "include_grout": True,
            "include_labor": True,
            "needs_waterproofing": True,
            "waterproof_type": "liquid",
            "substrate_type": "cement_board",
            "grout_joint_in": 0.125,
            "nj_contract": False
        }
