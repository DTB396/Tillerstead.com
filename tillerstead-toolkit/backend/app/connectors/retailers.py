"""
Retailer Connector Interface and Implementations

COMPLIANCE NOTE: This module does NOT scrape retailer websites.
All pricing data comes from:
1. Manual entry by the user
2. User-provided affiliate feed files
3. Third-party APIs with user-supplied credentials
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import csv
import io
from app.schemas.schemas import ProductCreate, PriceSource


class RetailerConnector(ABC):
    """
    Base interface for retailer data connectors.
    
    All connectors must:
    - Clearly identify their data source
    - Not scrape websites directly
    - Use only user-provided credentials/files
    """
    
    name: str = "Base Connector"
    requires_credentials: bool = False
    data_source: str = "unknown"
    
    @abstractmethod
    async def import_products(self, input_data: Any) -> List[ProductCreate]:
        """Import products from the connector's data source"""
        pass
    
    @abstractmethod
    async def refresh_prices(self, skus: List[str]) -> Dict[str, float]:
        """Refresh prices for given SKUs. Returns {sku: price}"""
        pass
    
    @abstractmethod
    def validate_credentials(self) -> bool:
        """Validate that required credentials/files are present"""
        pass


class ManualPriceBookConnector(RetailerConnector):
    """
    Manual Price Book Connector (DEFAULT)
    
    User enters products, pack sizes, prices manually or via CSV upload.
    This is the primary and safest data entry method.
    """
    
    name = "Manual Price Book"
    requires_credentials = False
    data_source = "user_manual_entry"
    
    def validate_credentials(self) -> bool:
        """No credentials required for manual entry"""
        return True
    
    async def import_products(self, input_data: Any) -> List[ProductCreate]:
        """
        Import products from CSV data.
        
        Expected CSV columns:
        name, brand, category, sku, upc, unit, pack_size, pack_unit, 
        cost, retail, vendor, notes
        """
        products = []
        
        if isinstance(input_data, str):
            # CSV string
            reader = csv.DictReader(io.StringIO(input_data))
        elif hasattr(input_data, 'read'):
            # File-like object
            content = input_data.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(content))
        else:
            raise ValueError("Input must be CSV string or file-like object")
        
        for row in reader:
            try:
                product = ProductCreate(
                    name=row.get('name', '').strip(),
                    brand=row.get('brand', '').strip() or None,
                    category=row.get('category', 'other').strip().lower(),
                    sku=row.get('sku', '').strip() or None,
                    upc=row.get('upc', '').strip() or None,
                    unit=row.get('unit', 'each').strip(),
                    pack_size=float(row.get('pack_size', 1) or 1),
                    pack_unit=row.get('pack_unit', '').strip() or None,
                    cost=float(row['cost']) if row.get('cost') else None,
                    retail=float(row['retail']) if row.get('retail') else None,
                    vendor=row.get('vendor', '').strip() or None,
                    notes=row.get('notes', '').strip() or None,
                )
                if product.name:  # Only add if name is present
                    products.append(product)
            except (ValueError, KeyError) as e:
                # Skip invalid rows but could log error
                continue
        
        return products
    
    async def refresh_prices(self, skus: List[str]) -> Dict[str, float]:
        """
        Manual connector doesn't auto-refresh prices.
        Returns empty dict - user must update manually.
        """
        return {}


class HomeDepotAffiliateFeedConnector(RetailerConnector):
    """
    Home Depot Affiliate Feed Connector
    
    Imports product data from user-provided affiliate feed files.
    
    IMPORTANT: This does NOT scrape HomeDepot.com.
    Users must obtain feed files through:
    - Home Depot affiliate program
    - Authorized data feed providers
    - Direct partnership agreements
    
    Feed files are typically provided as daily/weekly CSV/TSV exports.
    """
    
    name = "Home Depot Affiliate Feed"
    requires_credentials = True
    data_source = "homedepot_affiliate_feed"
    
    # Expected feed columns (adjust based on actual feed format)
    FEED_COLUMNS = {
        'product_id': 'sku',
        'product_name': 'name',
        'brand_name': 'brand', 
        'category': 'category',
        'upc': 'upc',
        'price': 'retail',
        'sale_price': 'our_price',
        'product_url': 'vendor_url',
        'description': 'description',
    }
    
    def __init__(self, feed_file_path: Optional[str] = None):
        self.feed_file_path = feed_file_path
    
    def validate_credentials(self) -> bool:
        """Check if feed file exists"""
        if not self.feed_file_path:
            return False
        
        import os
        return os.path.exists(self.feed_file_path)
    
    async def import_products(self, input_data: Any) -> List[ProductCreate]:
        """
        Import products from Home Depot affiliate feed file.
        
        input_data can be:
        - File path string
        - File-like object
        - Raw CSV/TSV content string
        """
        products = []
        
        # Determine input type and read content
        if isinstance(input_data, str):
            if '\n' in input_data or '\t' in input_data:
                # Looks like raw content
                content = input_data
            else:
                # Looks like file path
                with open(input_data, 'r', encoding='utf-8') as f:
                    content = f.read()
        elif hasattr(input_data, 'read'):
            content = input_data.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8')
        else:
            raise ValueError("Input must be file path, file object, or CSV content")
        
        # Detect delimiter (TSV or CSV)
        first_line = content.split('\n')[0]
        delimiter = '\t' if '\t' in first_line else ','
        
        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        
        for row in reader:
            try:
                # Map feed columns to our schema
                product_data = {}
                
                for feed_col, our_col in self.FEED_COLUMNS.items():
                    if feed_col in row:
                        product_data[our_col] = row[feed_col]
                
                # Clean and validate
                if not product_data.get('name'):
                    continue
                
                # Parse prices
                for price_field in ['retail', 'our_price', 'cost']:
                    if product_data.get(price_field):
                        try:
                            # Remove $ and commas
                            price_str = str(product_data[price_field]).replace('$', '').replace(',', '')
                            product_data[price_field] = float(price_str)
                        except ValueError:
                            product_data[price_field] = None
                
                # Set vendor
                product_data['vendor'] = 'Home Depot'
                
                # Determine category from feed category if present
                feed_category = product_data.get('category', '').lower()
                if 'tile' in feed_category:
                    product_data['category'] = 'tile'
                elif 'mortar' in feed_category or 'thinset' in feed_category:
                    product_data['category'] = 'mortar'
                elif 'grout' in feed_category:
                    product_data['category'] = 'grout'
                elif 'drywall' in feed_category:
                    product_data['category'] = 'drywall'
                else:
                    product_data['category'] = 'other'
                
                product = ProductCreate(**product_data)
                products.append(product)
                
            except Exception as e:
                # Skip problematic rows
                continue
        
        return products
    
    async def refresh_prices(self, skus: List[str]) -> Dict[str, float]:
        """
        Refresh prices from feed file.
        
        Note: This re-reads the feed file. For real-time prices,
        users should update their feed file from the affiliate portal.
        """
        if not self.validate_credentials():
            return {}
        
        prices = {}
        products = await self.import_products(self.feed_file_path)
        
        for product in products:
            if product.sku in skus:
                prices[product.sku] = product.retail or product.our_price or 0
        
        return prices


class ThirdPartyCatalogConnector(RetailerConnector):
    """
    Third-Party Catalog API Connector
    
    Connects to third-party product data APIs (e.g., SerpApi, Dataweave, etc.)
    
    IMPORTANT: 
    - Requires user-provided API key
    - Data source is clearly labeled as "third-party"
    - Pricing may not match actual retailer prices
    - Always verify prices before purchasing
    """
    
    name = "Third-Party Catalog API"
    requires_credentials = True
    data_source = "third_party_api"
    
    def __init__(self, api_key: Optional[str] = None, api_url: Optional[str] = None):
        self.api_key = api_key
        self.api_url = api_url
    
    def validate_credentials(self) -> bool:
        """Check if API credentials are configured"""
        return bool(self.api_key and self.api_url)
    
    async def import_products(self, input_data: Any) -> List[ProductCreate]:
        """
        Import products from third-party API.
        
        input_data should be a dict with query parameters:
        {
            "search_term": "porcelain tile",
            "category": "tile",
            "limit": 100
        }
        """
        if not self.validate_credentials():
            raise ValueError("API credentials not configured")
        
        # This is a stub - actual implementation would call the API
        # Example with httpx:
        #
        # import httpx
        # async with httpx.AsyncClient() as client:
        #     response = await client.get(
        #         self.api_url,
        #         headers={"Authorization": f"Bearer {self.api_key}"},
        #         params=input_data
        #     )
        #     data = response.json()
        #     # Map API response to ProductCreate objects
        
        # For now, return empty list with documentation
        return []
    
    async def refresh_prices(self, skus: List[str]) -> Dict[str, float]:
        """
        Refresh prices from third-party API.
        
        Note: Third-party prices may differ from actual retailer prices.
        Always verify before purchasing.
        """
        if not self.validate_credentials():
            return {}
        
        # Stub - actual implementation would query API
        return {}


# Connector factory
class ConnectorFactory:
    """Factory for creating connector instances"""
    
    _connectors = {
        "manual": ManualPriceBookConnector,
        "homedepot_feed": HomeDepotAffiliateFeedConnector,
        "thirdparty": ThirdPartyCatalogConnector,
    }
    
    @classmethod
    def get_connector(cls, connector_type: str, **kwargs) -> RetailerConnector:
        """Get connector instance by type"""
        if connector_type not in cls._connectors:
            raise ValueError(f"Unknown connector type: {connector_type}")
        
        return cls._connectors[connector_type](**kwargs)
    
    @classmethod
    def list_connectors(cls) -> List[Dict[str, Any]]:
        """List available connectors with metadata"""
        return [
            {
                "type": conn_type,
                "name": conn_class.name,
                "requires_credentials": conn_class.requires_credentials,
                "data_source": conn_class.data_source,
            }
            for conn_type, conn_class in cls._connectors.items()
        ]


# Compliance notice for settings page
COMPLIANCE_NOTICE = """
⚠️ PRICING DISCLAIMER

Retailer pricing changes frequently. Product prices shown in this application 
are estimates based on:

• Manual entries you have provided
• Affiliate feed data (if configured)
• Third-party data sources (clearly labeled)

ALWAYS VERIFY PRICES in your shopping cart and on receipts before completing 
purchases. Tillerstead Toolkit is not responsible for pricing discrepancies.

For the most accurate pricing:
1. Check retailer websites directly
2. Update your price book regularly
3. Verify prices at checkout
"""
