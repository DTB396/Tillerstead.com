"""
New Jersey Contractor Premium Calculators
Specialized tools for NJ contractors to win more bids and ensure compliance
"""
from typing import Dict, Any, List
from decimal import Decimal
import math
from app.calculators.base import BaseCalculator, CalculatorRegistry
from app.schemas.schemas import CalculatorResult, CalculatorLineItem


@CalculatorRegistry.register("nj_permit_estimator")
class NJPermitEstimator(BaseCalculator):
    """
    NJ Permit & Inspection Cost Estimator
    Calculates permit costs, inspection fees, and compliance requirements
    for various NJ municipalities
    """
    
    name = "NJ Permit & Inspection Calculator"
    description = "Estimate permit costs and inspection requirements for NJ projects"
    category = "nj_compliance"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate permit and inspection costs"""
        
        project_value = Decimal(str(inputs.get("project_value", 0)))
        project_type = inputs.get("project_type", "bathroom_remodel")
        municipality = inputs.get("municipality", "atlantic_county")
        
        items = []
        warnings = []
        total_cost = Decimal("0")
        
        # Base permit fee (varies by municipality)
        base_fees = {
            "atlantic_county": Decimal("75"),
            "cape_may_county": Decimal("85"),
            "ocean_county": Decimal("70"),
            "burlington_county": Decimal("80"),
        }
        
        base_permit = base_fees.get(municipality, Decimal("75"))
        
        # Project type multipliers and requirements
        if project_type == "bathroom_remodel":
            permit_fee = base_permit + (project_value * Decimal("0.005"))  # 0.5% of value
            inspections_needed = ["Rough plumbing", "Rough electrical", "Final"]
            electrical_permit = True
            plumbing_permit = True
            
        elif project_type == "kitchen_remodel":
            permit_fee = base_permit + (project_value * Decimal("0.006"))
            inspections_needed = ["Rough plumbing", "Rough electrical", "Gas (if applicable)", "Final"]
            electrical_permit = True
            plumbing_permit = True
            
        elif project_type == "basement_finish":
            permit_fee = base_permit + (project_value * Decimal("0.007"))
            inspections_needed = ["Framing", "Rough electrical", "Rough plumbing", "Insulation", "Final"]
            electrical_permit = True
            plumbing_permit = True
            
        elif project_type == "deck_addition":
            permit_fee = base_permit + (project_value * Decimal("0.004"))
            inspections_needed = ["Footing", "Framing", "Final"]
            electrical_permit = False
            plumbing_permit = False
            
        else:  # general remodel
            permit_fee = base_permit + (project_value * Decimal("0.005"))
            inspections_needed = ["Rough", "Final"]
            electrical_permit = inputs.get("needs_electrical", False)
            plumbing_permit = inputs.get("needs_plumbing", False)
        
        total_cost += permit_fee
        
        items.append(CalculatorLineItem(
            name=f"Building Permit - {municipality.replace('_', ' ').title()}",
            quantity=1,
            unit="permit",
            unit_price=float(permit_fee),
            total_price=float(permit_fee),
            notes=f"Base ${float(base_permit)} + {float((permit_fee - base_permit) / project_value * 100):.2f}% of project value"
        ))
        
        # Electrical permit
        if electrical_permit:
            elec_permit = Decimal("50")
            total_cost += elec_permit
            items.append(CalculatorLineItem(
                name="Electrical Permit",
                quantity=1,
                unit="permit",
                unit_price=float(elec_permit),
                total_price=float(elec_permit),
                notes="Required for electrical work"
            ))
            warnings.append("✓ Licensed electrician required (NJ)")
        
        # Plumbing permit
        if plumbing_permit:
            plumb_permit = Decimal("50")
            total_cost += plumb_permit
            items.append(CalculatorLineItem(
                name="Plumbing Permit",
                quantity=1,
                unit="permit",
                unit_price=float(plumb_permit),
                total_price=float(plumb_permit),
                notes="Required for plumbing work"
            ))
            warnings.append("✓ Licensed plumber required (NJ)")
        
        # Inspection fees
        inspection_fee = Decimal("40") * len(inspections_needed)
        total_cost += inspection_fee
        
        items.append(CalculatorLineItem(
            name=f"Inspection Fees ({len(inspections_needed)} inspections)",
            quantity=len(inspections_needed),
            unit="inspections",
            unit_price=40,
            total_price=float(inspection_fee),
            notes=" → ".join(inspections_needed)
        ))
        
        # Certificate of approval/occupancy
        if project_value > 10000:
            co_fee = Decimal("75")
            total_cost += co_fee
            items.append(CalculatorLineItem(
                name="Certificate of Approval/Occupancy",
                quantity=1,
                unit="certificate",
                unit_price=float(co_fee),
                total_price=float(co_fee),
                notes="Required for projects >$10,000"
            ))
        
        warnings.append("⏱ Allow 3-5 business days for permit approval")
        warnings.append("📋 Plans may be required for projects >$5,000")
        warnings.append("✓ Keep permits posted at job site")
        
        summary = f"""
NJ PERMIT & INSPECTION ESTIMATE
================================
Municipality: {municipality.replace('_', ' ').title()}
Project Type: {project_type.replace('_', ' ').title()}
Project Value: ${float(project_value):,.2f}

Required Inspections:
{chr(10).join(f"  {i+1}. {insp}" for i, insp in enumerate(inspections_needed))}

TOTAL PERMIT COSTS: ${float(total_cost):,.2f}

Note: Actual fees may vary. Contact local building department for exact costs.
        """.strip()
        
        # Legal disclaimers
        warnings.insert(0, "📋 ESTIMATION TOOL ONLY - Not legal or financial advice")
        warnings.insert(1, "⚖️ Municipal fees and requirements subject to change. Verify with local building department before submitting applications. This is NOT official permit documentation.")
        
        return CalculatorResult(
            total_quantity=len(inspections_needed),
            total_cost=float(total_cost),
            unit="permits",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "disclaimer": "Estimation tool only - verify all information with your municipality",
                "not_binding": True,
                "requires_verification": True,
                "inspections": inspections_needed,
                "municipality": municipality,
                "project_type": project_type
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "project_value": {
                    "type": "number",
                    "title": "Project Value",
                    "description": "Total project cost",
                    "minimum": 0
                },
                "project_type": {
                    "type": "string",
                    "title": "Project Type",
                    "enum": ["bathroom_remodel", "kitchen_remodel", "basement_finish", "deck_addition", "general_remodel"],
                    "default": "bathroom_remodel"
                },
                "municipality": {
                    "type": "string",
                    "title": "Municipality",
                    "enum": ["atlantic_county", "cape_may_county", "ocean_county", "burlington_county"],
                    "default": "atlantic_county"
                }
            },
            "required": ["project_value"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "project_value": 15000,
            "project_type": "bathroom_remodel",
            "municipality": "atlantic_county"
        }


@CalculatorRegistry.register("competitive_bid_analyzer")
class CompetitiveBidAnalyzer(BaseCalculator):
    """
    Competitive Bid Analyzer
    Helps contractors create winning bids by analyzing market rates and suggesting pricing
    """
    
    name = "Competitive Bid Analyzer"
    description = "Analyze market rates and optimize your bid to win more contracts"
    category = "estimating"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Analyze competitive positioning"""
        
        your_cost = Decimal(str(inputs.get("your_cost", 0)))
        desired_margin = Decimal(str(inputs.get("desired_margin_percent", 25))) / 100
        market_avg_price = Decimal(str(inputs.get("market_avg_price", 0)))
        competitor_count = int(inputs.get("competitor_count", 3))
        project_type = inputs.get("project_type", "bathroom_tile")
        
        items = []
        warnings = []
        
        # Calculate your ideal price
        ideal_price = your_cost / (1 - desired_margin)
        
        # NJ market typical margins by project type
        nj_margins = {
            "bathroom_tile": (0.20, 0.30),  # 20-30%
            "kitchen_backsplash": (0.25, 0.35),
            "shower_install": (0.22, 0.32),
            "floor_tile": (0.18, 0.28),
            "deck_building": (0.25, 0.35),
            "basement_finish": (0.20, 0.30),
        }
        
        min_margin, max_margin = nj_margins.get(project_type, (0.20, 0.30))
        
        # Competitive pricing strategies
        strategies = []
        
        # Strategy 1: Match market average
        if market_avg_price > 0:
            market_margin = (market_avg_price - your_cost) / market_avg_price
            
            strategies.append({
                "name": "Match Market Average",
                "price": market_avg_price,
                "margin": market_margin,
                "win_probability": Decimal("0.50"),
                "notes": "Safe middle-ground pricing"
            })
            
            # Strategy 2: Competitive (5% under market)
            competitive_price = market_avg_price * Decimal("0.95")
            competitive_margin = (competitive_price - your_cost) / competitive_price
            
            if competitive_margin >= min_margin:
                strategies.append({
                    "name": "Competitive (5% Under Market)",
                    "price": competitive_price,
                    "margin": competitive_margin,
                    "win_probability": Decimal("0.65"),
                    "notes": "Good balance of profit and competitiveness"
                })
            
            # Strategy 3: Aggressive (10% under market)
            aggressive_price = market_avg_price * Decimal("0.90")
            aggressive_margin = (aggressive_price - your_cost) / aggressive_price
            
            if aggressive_margin >= min_margin * Decimal("0.8"):
                strategies.append({
                    "name": "Aggressive (10% Under Market)",
                    "price": aggressive_price,
                    "margin": aggressive_margin,
                    "win_probability": Decimal("0.80"),
                    "notes": "Higher win rate, lower margin"
                })
            else:
                warnings.append("⚠️ Aggressive pricing below minimum safe margin")
            
            # Strategy 4: Premium (5% over market)
            premium_price = market_avg_price * Decimal("1.05")
            premium_margin = (premium_price - your_cost) / premium_price
            
            strategies.append({
                "name": "Premium (5% Above Market)",
                "price": premium_price,
                "margin": premium_margin,
                "win_probability": Decimal("0.35"),
                "notes": "Emphasize quality, warranty, NJ HIC compliance"
            })
        
        # Add strategies to line items
        for strategy in strategies:
            profit = strategy["price"] - your_cost
            
            items.append(CalculatorLineItem(
                name=f"Strategy: {strategy['name']}",
                quantity=1,
                unit="bid",
                unit_price=float(strategy["price"]),
                total_price=float(profit),
                notes=f"Margin: {float(strategy['margin'] * 100):.1f}% | Win Probability: {float(strategy['win_probability'] * 100):.0f}% | {strategy['notes']}"
            ))
        
        # Recommendations
        recommended_strategy = max(strategies, key=lambda s: s["win_probability"] * s["margin"])
        
        warnings.append(f"✓ RECOMMENDED: {recommended_strategy['name']}")
        warnings.append(f"  Price: ${float(recommended_strategy['price']):,.2f}")
        warnings.append(f"  Your Profit: ${float(recommended_strategy['price'] - your_cost):,.2f}")
        warnings.append(f"  Margin: {float(recommended_strategy['margin'] * 100):.1f}%")
        
        # NJ-specific value adds
        warnings.append("\n💡 NJ COMPETITIVE ADVANTAGES:")
        warnings.append("  • Emphasize NJ HIC License #13VH10808800")
        warnings.append("  • Highlight TCNA compliance and warranties")
        warnings.append("  • Offer free NJ building permit assistance")
        warnings.append("  • Include post-project walkthrough")
        warnings.append("  • Provide detailed NJ HIC compliant contract")
        
        summary = f"""
COMPETITIVE BID ANALYSIS
========================
Your Cost: ${float(your_cost):,.2f}
Market Average: ${float(market_avg_price):,.2f}
Desired Margin: {float(desired_margin * 100):.0f}%
Competitors: {competitor_count}

RECOMMENDED PRICING: ${float(recommended_strategy['price']):,.2f}
Expected Win Rate: {float(recommended_strategy['win_probability'] * 100):.0f}%
Your Profit: ${float(recommended_strategy['price'] - your_cost):,.2f}

Stand out with Tillerstead quality and NJ compliance!
        """.strip()
        
        # Legal disclaimers
        warnings.insert(0, "📋 ANALYSIS TOOL ONLY - Not a guarantee of contract award or pricing accuracy")
        warnings.insert(1, "⚖️ Business decisions are your responsibility. This tool provides guidance only and does not guarantee bid success. Market conditions vary. Not financial advice.")
        
        return CalculatorResult(
            total_quantity=len(strategies),
            total_cost=float(recommended_strategy["price"]),
            unit="strategies",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "disclaimer": "Analysis tool only - not a guarantee of results",
                "not_binding": True,
                "not_financial_advice": True,
                "recommended_price": float(recommended_strategy["price"]),
                "recommended_margin": float(recommended_strategy["margin"]),
                "win_probability": float(recommended_strategy["win_probability"])
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "your_cost": {
                    "type": "number",
                    "title": "Your Total Cost",
                    "description": "Materials + labor + overhead",
                    "minimum": 0
                },
                "desired_margin_percent": {
                    "type": "number",
                    "title": "Desired Margin %",
                    "default": 25,
                    "minimum": 10,
                    "maximum": 50
                },
                "market_avg_price": {
                    "type": "number",
                    "title": "Market Average Price",
                    "description": "What competitors charge for similar work",
                    "minimum": 0
                },
                "competitor_count": {
                    "type": "integer",
                    "title": "Number of Competitors",
                    "default": 3,
                    "minimum": 1,
                    "maximum": 10
                },
                "project_type": {
                    "type": "string",
                    "title": "Project Type",
                    "enum": ["bathroom_tile", "kitchen_backsplash", "shower_install", "floor_tile", "deck_building", "basement_finish"],
                    "default": "bathroom_tile"
                }
            },
            "required": ["your_cost"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "your_cost": 8000,
            "desired_margin_percent": 25,
            "market_avg_price": 12000,
            "competitor_count": 3,
            "project_type": "bathroom_tile"
        }


@CalculatorRegistry.register("seasonal_pricing_optimizer")
class SeasonalPricingOptimizer(BaseCalculator):
    """
    NJ Seasonal Pricing Optimizer
    Adjusts pricing based on seasonal demand in New Jersey
    """
    
    name = "NJ Seasonal Pricing Optimizer"
    description = "Optimize your pricing based on seasonal demand patterns in New Jersey"
    category = "estimating"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate seasonal pricing adjustments"""
        
        base_price = Decimal(str(inputs.get("base_price", 0)))
        month = inputs.get("month", "january")
        project_type = inputs.get("project_type", "indoor")
        
        items = []
        warnings = []
        
        # NJ seasonal demand factors
        seasonal_factors = {
            # Winter (low demand for outdoor, high for indoor)
            "january": {"indoor": 0.95, "outdoor": 0.70, "weather_risk": "high"},
            "february": {"indoor": 0.95, "outdoor": 0.75, "weather_risk": "high"},
            "march": {"indoor": 1.00, "outdoor": 0.90, "weather_risk": "medium"},
            
            # Spring (increasing demand)
            "april": {"indoor": 1.05, "outdoor": 1.10, "weather_risk": "medium"},
            "may": {"indoor": 1.10, "outdoor": 1.15, "weather_risk": "low"},
            "june": {"indoor": 1.10, "outdoor": 1.20, "weather_risk": "low"},
            
            # Summer (peak season)
            "july": {"indoor": 1.15, "outdoor": 1.25, "weather_risk": "low"},
            "august": {"indoor": 1.15, "outdoor": 1.25, "weather_risk": "low"},
            "september": {"indoor": 1.12, "outdoor": 1.20, "weather_risk": "low"},
            
            # Fall (good weather, moderate demand)
            "october": {"indoor": 1.08, "outdoor": 1.15, "weather_risk": "low"},
            "november": {"indoor": 1.00, "outdoor": 0.95, "weather_risk": "medium"},
            "december": {"indoor": 0.92, "outdoor": 0.75, "weather_risk": "high"},
        }
        
        factor_data = seasonal_factors.get(month, {"indoor": 1.0, "outdoor": 1.0, "weather_risk": "medium"})
        factor = Decimal(str(factor_data.get(project_type, 1.0)))
        adjusted_price = base_price * factor
        
        adjustment = adjusted_price - base_price
        
        items.append(CalculatorLineItem(
            name=f"Base Price ({month.title()})",
            quantity=1,
            unit="project",
            unit_price=float(base_price),
            total_price=float(base_price),
            notes=f"Standard pricing for {project_type} work"
        ))
        
        if adjustment != 0:
            items.append(CalculatorLineItem(
                name=f"Seasonal Adjustment ({month.title()})",
                quantity=1,
                unit="adjustment",
                unit_price=float(adjustment),
                total_price=float(adjustment),
                notes=f"{'+' if adjustment > 0 else ''}{float((factor - 1) * 100):.0f}% {project_type} demand factor"
            ))
        
        # Weather risk surcharge
        weather_risk = factor_data.get("weather_risk", "medium")
        if project_type == "outdoor" and weather_risk in ["high", "medium"]:
            risk_surcharge = base_price * Decimal("0.05") if weather_risk == "high" else base_price * Decimal("0.02")
            items.append(CalculatorLineItem(
                name=f"Weather Risk Surcharge ({weather_risk.title()})",
                quantity=1,
                unit="surcharge",
                unit_price=float(risk_surcharge),
                total_price=float(risk_surcharge),
                notes="Covers potential weather delays and protection"
            ))
            adjusted_price += risk_surcharge
        
        # Seasonal recommendations
        if factor < 1.0:
            warnings.append(f"💡 {month.title()} is OFF-SEASON - Consider offering discounts to fill schedule")
            warnings.append("  • Offer 5-10% discount for booking now")
            warnings.append("  • Promote winter indoor remodeling specials")
        elif factor > 1.10:
            warnings.append(f"🔥 {month.title()} is PEAK SEASON - High demand justifies premium pricing")
            warnings.append("  • Book projects 4-6 weeks in advance")
            warnings.append("  • Emphasize quick turnaround times")
        else:
            warnings.append(f"✓ {month.title()} has MODERATE demand - Standard pricing recommended")
        
        # NJ-specific seasonal tips
        warnings.append(f"\n📅 NJ SEASONAL TIPS for {month.title()}:")
        if month in ["december", "january", "february"]:
            warnings.append("  • Indoor bathroom/kitchen remodels ideal")
            warnings.append("  • Homeowners using holiday bonuses")
            warnings.append("  • Less competition from outdoor contractors")
        elif month in ["march", "april", "may"]:
            warnings.append("  • Spring cleaning mentality drives remodels")
            warnings.append("  • Good time for deck/outdoor prep")
            warnings.append("  • Pre-summer bathroom upgrades")
        elif month in ["june", "july", "august"]:
            warnings.append("  • Peak season - maximize your rates")
            warnings.append("  • Outdoor deck/patio projects hot")
            warnings.append("  • Pre-book for fall to maintain flow")
        else:  # fall
            warnings.append("  • Last chance for outdoor projects")
            warnings.append("  • Holiday prep drives bathroom upgrades")
            warnings.append("  • Book winter indoor projects now")
        
        summary = f"""
NJ SEASONAL PRICING OPTIMIZER
==============================
Month: {month.title()}
Project Type: {project_type.title()}
Base Price: ${float(base_price):,.2f}

SEASONAL FACTOR: {float(factor):.2f}x
OPTIMIZED PRICE: ${float(adjusted_price):,.2f}

Weather Risk: {weather_risk.title()}
Price Adjustment: ${float(adjustment):,.2f} ({float((factor - 1) * 100):+.0f}%)

Time your projects and pricing for maximum profit!
        """.strip()
        
        # Legal disclaimers
        warnings.insert(0, "📋 OPTIMIZATION TOOL ONLY - Not a guarantee of demand or pricing accuracy")
        warnings.insert(1, "⚖️ Seasonal factors are estimates based on historical NJ trends. Actual demand varies by location, weather, and economic conditions. Not financial advice.")
        
        return CalculatorResult(
            total_quantity=1,
            total_cost=float(adjusted_price),
            unit="project",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "disclaimer": "Optimization tool only - not a guarantee of demand",
                "not_binding": True,
                "not_financial_advice": True,
                "seasonal_factor": float(factor),
                "month": month,
                "weather_risk": weather_risk,
                "adjustment_amount": float(adjustment)
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "base_price": {
                    "type": "number",
                    "title": "Base Project Price",
                    "minimum": 0
                },
                "month": {
                    "type": "string",
                    "title": "Project Month",
                    "enum": ["january", "february", "march", "april", "may", "june",
                            "july", "august", "september", "october", "november", "december"],
                    "default": "january"
                },
                "project_type": {
                    "type": "string",
                    "title": "Project Type",
                    "enum": ["indoor", "outdoor"],
                    "default": "indoor"
                }
            },
            "required": ["base_price"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "base_price": 10000,
            "month": "january",
            "project_type": "indoor"
        }
