"""
Calculator Engine - Base classes and registry
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Type
from app.schemas.schemas import CalculatorResult, CalculatorLineItem, ProductCategory


class BaseCalculator(ABC):
    """Base class for all calculators"""
    
    name: str = "Base Calculator"
    description: str = ""
    category: str = "general"
    
    @abstractmethod
    def calculate(self, inputs: Dict[str, Any]) -> CalculatorResult:
        """Run calculation and return results"""
        pass
    
    @abstractmethod
    def get_input_schema(self) -> Dict[str, Any]:
        """Return JSON schema for inputs"""
        pass
    
    @abstractmethod
    def get_default_inputs(self) -> Dict[str, Any]:
        """Return default input values"""
        pass
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[str]:
        """Validate inputs and return list of errors"""
        return []


class CalculatorRegistry:
    """Registry of available calculators"""
    
    _calculators: Dict[str, Type[BaseCalculator]] = {}
    
    @classmethod
    def register(cls, calculator_type: str):
        """Decorator to register a calculator"""
        def decorator(calculator_class: Type[BaseCalculator]):
            cls._calculators[calculator_type] = calculator_class
            return calculator_class
        return decorator
    
    @classmethod
    def get(cls, calculator_type: str) -> BaseCalculator:
        """Get calculator instance by type"""
        if calculator_type not in cls._calculators:
            raise ValueError(f"Unknown calculator type: {calculator_type}")
        return cls._calculators[calculator_type]()
    
    @classmethod
    def list_all(cls) -> Dict[str, Dict[str, str]]:
        """List all registered calculators"""
        return {
            calc_type: {
                "name": calc_class.name,
                "description": calc_class.description,
                "category": calc_class.category
            }
            for calc_type, calc_class in cls._calculators.items()
        }


# Coverage constants based on TCNA standards
TROWEL_COVERAGE = {
    # trowel_size: sqft per 50lb bag (approximate, varies by substrate)
    "1/4x1/4": 95,      # Small tile, thin bed
    "1/4x3/8": 70,      # Medium tile
    "1/2x1/2": 50,      # Large tile (12x12+)
    "3/4x3/4": 35,      # Very large tile, back-butter
    "1/4x1/4_U": 80,    # U-notch variants
    "1/2x1/2_U": 40,
}

SUBSTRATE_FACTORS = {
    # Multiplier for coverage based on substrate
    "cement_board": 1.0,
    "plywood": 1.1,      # Slightly more absorption
    "concrete": 0.9,     # Smooth, less absorption
    "existing_tile": 1.2,  # More mortar needed
    "ditra": 0.85,       # Less mortar for uncoupling membranes
}

SUBSTRATE_CONDITION_FACTORS = {
    "good": 1.0,
    "fair": 1.1,
    "poor": 1.25,
}

# Grout coverage (lbs per sqft based on joint width and tile size)
# Format: (tile_length_in, tile_width_in, joint_width_in): lbs per sqft
GROUT_COVERAGE_TABLE = {
    # 12x12 tiles
    (12, 12, 0.125): 0.15,   # 1/8" joint
    (12, 12, 0.1875): 0.22,  # 3/16" joint
    (12, 12, 0.25): 0.30,    # 1/4" joint
    # 12x24 tiles
    (12, 24, 0.125): 0.12,
    (12, 24, 0.1875): 0.18,
    (12, 24, 0.25): 0.24,
    # 24x24 tiles
    (24, 24, 0.125): 0.10,
    (24, 24, 0.1875): 0.15,
    (24, 24, 0.25): 0.20,
    # 6x6 tiles
    (6, 6, 0.125): 0.30,
    (6, 6, 0.1875): 0.45,
    # 4x4 tiles
    (4, 4, 0.125): 0.45,
}

# Joint compound coverage
COMPOUND_COVERAGE = {
    # Coverage per unit (sqft of drywall)
    "premix_bucket_61lb": 230,  # 5-gallon bucket
    "premix_bucket_30lb": 115,  # 2.5-gallon bucket
    "dry_mix_25lb": 100,        # 25lb bag
    "dry_mix_45lb": 180,        # 45lb bag
}

# Tape and accessories
TAPE_LF_PER_SQFT = 0.5  # Linear feet of tape per sqft of drywall
CORNER_BEAD_LF_PER_OUTSIDE_CORNER = 8  # 8' standard height
SANDPAPER_SHEETS_PER_SQFT = 0.01  # Sheets per sqft
