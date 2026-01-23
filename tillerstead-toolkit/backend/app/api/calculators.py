"""
Calculators API router - List and run calculations
"""
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Query

from app.calculators import (
    CalculatorRegistry,
    CalculatorGroup,
    CalculatorCategory,
    get_calculator_badge,
    get_calculator_search_terms,
)
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


@router.get("/categories")
async def list_categories() -> List[Dict[str, Any]]:
    """Get all calculator categories with metadata"""
    return CalculatorGroup.get_all_categories()


@router.get("/categories/featured")
async def list_featured_categories() -> List[Dict[str, Any]]:
    """Get featured calculator categories (NJ-specific tools)"""
    return CalculatorGroup.get_featured_categories()


@router.get("/categories/{category_id}")
async def get_category(category_id: str) -> Dict[str, Any]:
    """Get details about a specific category"""
    category_info = CalculatorGroup.get_category_info(category_id)
    if not category_info:
        raise HTTPException(status_code=404, detail=f"Category '{category_id}' not found")
    
    # Get all calculators in this category
    all_calculators = CalculatorRegistry.list_all()
    category_calculators = []
    
    for calc_id in category_info.get("calculators", []):
        if calc_id in all_calculators:
            calc_info = all_calculators[calc_id]
            calc_info["id"] = calc_id
            calc_info["badge"] = get_calculator_badge(calc_id)
            category_calculators.append(calc_info)
    
    return {
        "id": category_id,
        **category_info,
        "available_calculators": category_calculators
    }


@router.get("/search")
async def search_calculators(
    q: str = Query(..., min_length=2, description="Search query")
) -> List[Dict[str, Any]]:
    """Search calculators by name, description, tags, or category"""
    query = q.lower()
    results = []
    all_calculators = CalculatorRegistry.list_all()
    
    for calc_id, calc_info in all_calculators.items():
        # Get search terms for this calculator
        search_terms = get_calculator_search_terms(calc_id)
        search_text = " ".join(search_terms + [
            calc_info.get("name", "").lower(),
            calc_info.get("description", "").lower(),
        ])
        
        # Check if query matches
        if query in search_text:
            category = CalculatorGroup.get_calculator_category(calc_id)
            category_info = CalculatorGroup.get_category_info(category)
            
            results.append({
                "id": calc_id,
                **calc_info,
                "badge": get_calculator_badge(calc_id),
                "category": category,
                "category_name": category_info.get("name", ""),
                "category_icon": category_info.get("icon", ""),
            })
    
    return results


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
    
    category = CalculatorGroup.get_calculator_category(calculator_type)
    category_info = CalculatorGroup.get_category_info(category)
    
    return {
        "type": calculator_type,
        "name": calculator.name,
        "description": calculator.description,
        "category": calculator.category,
        "category_name": category_info.get("name", ""),
        "category_icon": category_info.get("icon", ""),
        "category_color": category_info.get("color", "#10b981"),
        "badge": get_calculator_badge(calculator_type),
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
