"""
Calculators API router - List and run calculations
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException

from app.calculators import CalculatorRegistry
from app.schemas.schemas import (
    CalculatorResult,
    TileFloorInput,
    ThinsetInput,
    DrywallCompoundInput,
)

router = APIRouter(prefix="/calculators", tags=["calculators"])

# Map calculator types to their input schemas
CALCULATOR_INPUT_SCHEMAS = {
    "tile_floor": TileFloorInput,
    "thinset_mortar": ThinsetInput,
    "drywall_compound": DrywallCompoundInput,
}


@router.get("")
async def list_calculators() -> Dict[str, Dict[str, str]]:
    """List all available calculators with their metadata"""
    return CalculatorRegistry.list_all()


@router.get("/{calculator_type}")
async def get_calculator_info(calculator_type: str) -> Dict[str, Any]:
    """Get details about a specific calculator including input schema and defaults"""
    try:
        calculator = CalculatorRegistry.get(calculator_type)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Calculator '{calculator_type}' not found")
    
    return {
        "type": calculator_type,
        "name": calculator.name,
        "description": calculator.description,
        "category": calculator.category,
        "input_schema": calculator.get_input_schema(),
        "default_inputs": calculator.get_default_inputs(),
    }


@router.post("/{calculator_type}/calculate", response_model=CalculatorResult)
async def run_calculation(
    calculator_type: str,
    inputs: Dict[str, Any]
) -> CalculatorResult:
    """Run a calculation with the specified calculator and inputs"""
    try:
        calculator = CalculatorRegistry.get(calculator_type)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Calculator '{calculator_type}' not found")
    
    # Validate inputs
    errors = calculator.validate_inputs(inputs)
    if errors:
        raise HTTPException(status_code=422, detail={"validation_errors": errors})
    
    # Run calculation
    try:
        result = calculator.calculate(inputs)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")
    
    return result
