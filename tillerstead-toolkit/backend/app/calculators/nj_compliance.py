"""
New Jersey HIC Compliance Calculator
Helps contractors comply with NJ Home Improvement Contractor regulations
"""
from typing import Dict, Any
from decimal import Decimal
from app.calculators.base import BaseCalculator, CalculatorRegistry
from app.schemas.schemas import CalculatorResult, CalculatorLineItem


@CalculatorRegistry.register("nj_hic_contract")
class NJHICContractCalculator(BaseCalculator):
    """
    NJ HIC Contract Requirements Calculator
    Ensures contract meets NJ Home Improvement Contractor Act (N.J.S.A. 56:8-136 et seq.)
    """
    
    name = "NJ HIC Contract Generator"
    description = "Generate compliant NJ Home Improvement Contract with required disclosures"
    category = "nj_compliance"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Generate contract checklist and required elements"""
        
        project_total = Decimal(str(inputs.get("project_total", 0)))
        deposit_percent = Decimal(str(inputs.get("deposit_percent", 10)))
        has_right_to_cancel = inputs.get("has_right_to_cancel", True)
        payment_schedule = inputs.get("payment_schedule", "progressive")
        
        items = []
        warnings = []
        
        # Calculate deposit (NJ law limits to 1/3 or $1000, whichever is less for contracts under $5000)
        if project_total < 5000:
            max_deposit = min(project_total / 3, Decimal("1000"))
        else:
            max_deposit = project_total / 3
        
        requested_deposit = project_total * (deposit_percent / 100)
        
        if requested_deposit > max_deposit:
            warnings.append(f"⚠️ Deposit ${requested_deposit:.2f} exceeds NJ legal limit of ${max_deposit:.2f}")
            deposit_amount = max_deposit
        else:
            deposit_amount = requested_deposit
        
        items.append(CalculatorLineItem(
            name="Maximum Legal Deposit (1/3 or $1000 for <$5000)",
            quantity=1,
            unit="payment",
            unit_price=float(deposit_amount),
            total_price=float(deposit_amount),
            notes=f"{deposit_percent}% of ${project_total:.2f}"
        ))
        
        # Contract requirements checklist
        required_items = [
            "✓ Contractor Name & HIC License Number",
            "✓ Business Address & Phone",
            "✓ Project Description & Specifications",
            "✓ Total Contract Price",
            "✓ Payment Schedule",
            "✓ Start & Completion Dates",
            "✓ Right to Cancel (3-day for home solicitation)",
            "✓ Permit Information",
            "✓ Warranty Information",
            "✓ Certificate of Insurance",
            "✓ Change Order Procedures",
        ]
        
        items.append(CalculatorLineItem(
            name="Required Contract Elements",
            quantity=len(required_items),
            unit="items",
            unit_price=0,
            total_price=0,
            notes=" | ".join(required_items)
        ))
        
        # Three-day right to cancel notice
        if has_right_to_cancel and project_total >= 500:
            items.append(CalculatorLineItem(
                name="3-Day Right to Cancel Notice",
                quantity=1,
                unit="notice",
                unit_price=0,
                total_price=0,
                notes="Required for home solicitation sales. Must be in 10-point bold type."
            ))
        
        # Payment schedule breakdown
        if payment_schedule == "progressive":
            # Recommended NJ progressive payment schedule
            milestones = [
                ("Deposit (at signing)", deposit_amount),
                ("Rough-in completion (30%)", project_total * Decimal("0.30")),
                ("Substantial completion (50%)", project_total * Decimal("0.50")),
                ("Final payment (remainder)", project_total - deposit_amount - (project_total * Decimal("0.30")) - (project_total * Decimal("0.50"))),
            ]
            
            for milestone_name, amount in milestones:
                items.append(CalculatorLineItem(
                    name=f"Payment Milestone: {milestone_name}",
                    quantity=1,
                    unit="payment",
                    unit_price=float(amount),
                    total_price=float(amount),
                    notes="Progress-based payment"
                ))
        
        summary = f"""
NJ HIC Compliant Contract Requirements:
- Project Total: ${project_total:,.2f}
- Maximum Deposit: ${deposit_amount:,.2f}
- HIC License: #13VH10808800 (Tillerstead LLC)
- Contract must be signed by both parties
- Homeowner must receive a copy within 48 hours
- All changes must be in writing
        """.strip()
        
        # Legal disclaimers
        warnings.insert(0, "📋 COMPLIANCE CHECKLIST ONLY - Not a legal contract or binding agreement")
        warnings.insert(1, "⚖️ LEGAL DISCLAIMER: This tool provides NJ HIC compliance guidance only. It does NOT create a contract. All work requires a separate, signed written contract that complies with N.J.S.A. 56:8-136 et seq. Consult with legal counsel for contract preparation.")
        warnings.insert(2, "🏛️ This is an educational tool - not legal advice. Contractors are responsible for their own compliance.")
        
        return CalculatorResult(
            total_quantity=float(project_total),
            total_cost=float(project_total),
            unit="project",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "disclaimer": "Compliance checklist only - not a legal contract",
                "not_binding": True,
                "not_legal_advice": True,
                "requires_signed_contract": True,
                "max_deposit": float(max_deposit),
                "recommended_deposit": float(deposit_amount),
                "requires_right_to_cancel": has_right_to_cancel,
                "nj_hic_license": "13VH10808800",
                "compliance_checklist": required_items,
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "project_total": {
                    "type": "number",
                    "title": "Total Project Cost",
                    "description": "Total contract amount in dollars",
                    "minimum": 0,
                },
                "deposit_percent": {
                    "type": "number",
                    "title": "Desired Deposit Percentage",
                    "description": "Percentage of total for deposit (will be adjusted to NJ limits)",
                    "minimum": 0,
                    "maximum": 100,
                    "default": 10,
                },
                "has_right_to_cancel": {
                    "type": "boolean",
                    "title": "Home Solicitation Sale",
                    "description": "Was contract initiated at customer's home?",
                    "default": True,
                },
                "payment_schedule": {
                    "type": "string",
                    "title": "Payment Schedule Type",
                    "enum": ["progressive", "custom"],
                    "default": "progressive",
                },
            },
            "required": ["project_total"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "project_total": 5000,
            "deposit_percent": 10,
            "has_right_to_cancel": True,
            "payment_schedule": "progressive",
        }


@CalculatorRegistry.register("nj_sales_tax")
class NJSalesTaxCalculator(BaseCalculator):
    """
    New Jersey Sales Tax Calculator for Construction
    Handles material vs labor taxation per NJ rules
    """
    
    name = "NJ Sales Tax Calculator"
    description = "Calculate NJ sales tax on materials (6.625%) - labor is exempt"
    category = "nj_compliance"
    
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Calculate NJ sales tax"""
        
        materials_cost = Decimal(str(inputs.get("materials_cost", 0)))
        labor_cost = Decimal(str(inputs.get("labor_cost", 0)))
        is_capital_improvement = inputs.get("is_capital_improvement", False)
        county = inputs.get("county", "Atlantic")
        
        items = []
        warnings = []
        
        # NJ Sales Tax Rate (as of 2026)
        nj_tax_rate = Decimal("0.06625")  # 6.625%
        
        # Salem County has reduced rate
        if county.lower() == "salem":
            nj_tax_rate = Decimal("0.03313")  # 3.313%
            warnings.append("ℹ️ Salem County reduced rate applied (3.313%)")
        
        # Urban Enterprise Zones have reduced rate
        uez_cities = ["atlantic city", "camden", "trenton", "newark", "paterson"]
        if any(city in inputs.get("city", "").lower() for city in uez_cities):
            nj_tax_rate = Decimal("0.03313")  # 3.313%
            warnings.append("ℹ️ Urban Enterprise Zone reduced rate applied (3.313%)")
        
        # Calculate tax on materials only
        materials_tax = materials_cost * nj_tax_rate
        
        items.append(CalculatorLineItem(
            name=f"Materials Cost (taxable @ {float(nj_tax_rate * 100):.3f}%)",
            quantity=1,
            unit="subtotal",
            unit_price=float(materials_cost),
            total_price=float(materials_cost),
            notes="Materials and supplies are taxable in NJ"
        ))
        
        items.append(CalculatorLineItem(
            name="Labor Cost (tax-exempt)",
            quantity=1,
            unit="subtotal",
            unit_price=float(labor_cost),
            total_price=float(labor_cost),
            notes="Labor for installation/repair is not taxable"
        ))
        
        items.append(CalculatorLineItem(
            name="NJ Sales Tax",
            quantity=1,
            unit="tax",
            unit_price=float(materials_tax),
            total_price=float(materials_tax),
            notes=f"{float(nj_tax_rate * 100):.3f}% on materials only"
        ))
        
        # Capital improvement exemption
        if is_capital_improvement:
            warnings.append("✓ Capital improvement may be exempt from sales tax if meets NJ criteria")
            warnings.append("  - Must add to property value")
            warnings.append("  - Must become permanent part of real property")
            warnings.append("  - Requires ST-8 exemption certificate")
        
        total = materials_cost + labor_cost + materials_tax
        
        summary = f"""
NJ Sales Tax Calculation:
- Materials: ${materials_cost:,.2f} (taxable)
- Labor: ${labor_cost:,.2f} (exempt)
- Sales Tax: ${materials_tax:,.2f} ({float(nj_tax_rate * 100):.3f}%)
- Total: ${total:,.2f}

⚠️ Note: Contractors are responsible for collecting and remitting sales tax
        """.strip()
        
        return CalculatorResult(
            total_quantity=float(total),
            total_cost=float(total),
            unit="dollars",
            summary=summary,
            line_items=items,
            warnings=warnings,
            metadata={
                "materials_cost": float(materials_cost),
                "labor_cost": float(labor_cost),
                "tax_rate": float(nj_tax_rate),
                "tax_amount": float(materials_tax),
                "county": county,
            }
        )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "materials_cost": {
                    "type": "number",
                    "title": "Materials Cost",
                    "description": "Total cost of materials and supplies",
                    "minimum": 0,
                },
                "labor_cost": {
                    "type": "number",
                    "title": "Labor Cost",
                    "description": "Total labor cost (tax-exempt)",
                    "minimum": 0,
                },
                "county": {
                    "type": "string",
                    "title": "NJ County",
                    "description": "County where work is performed",
                    "enum": [
                        "Atlantic", "Bergen", "Burlington", "Camden", "Cape May",
                        "Cumberland", "Essex", "Gloucester", "Hudson", "Hunterdon",
                        "Mercer", "Middlesex", "Monmouth", "Morris", "Ocean",
                        "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren"
                    ],
                    "default": "Atlantic",
                },
                "is_capital_improvement": {
                    "type": "boolean",
                    "title": "Capital Improvement?",
                    "description": "Work may qualify for sales tax exemption",
                    "default": False,
                },
                "city": {
                    "type": "string",
                    "title": "City",
                    "description": "City name (for UEZ detection)",
                    "default": "",
                },
            },
            "required": ["materials_cost", "labor_cost"]
        }
    
    def get_default_inputs(self) -> Dict[str, Any]:
        return {
            "materials_cost": 1000,
            "labor_cost": 500,
            "county": "Atlantic",
            "is_capital_improvement": False,
            "city": "",
        }
