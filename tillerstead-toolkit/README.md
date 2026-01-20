# Tillerstead Toolkit

**Contractor Calculator Hub + Inventory + Catalog Connector**

A production-ready web app for NJ tile/general contractor project management. Features calculators, room takeoffs, material lists, and priced shopping lists from a local inventory database.

## Web App Integration

The TillerPro web app (`/tools/`) integrates with this toolkit:

- **Hybrid Mode**: Uses toolkit API when available, falls back to client-side calculations
- **Project Sync**: Local projects can be synced to the backend database
- **Shared Calculators**: Both use the same TCNA-compliant formulas

### Connect the Web App to Toolkit

1. Start the backend: `cd backend && uvicorn app.main:app --reload`
2. Open the web app: `http://localhost:4000/tools/app/`
3. The API status indicator will show "Connected" when linked

## Architecture

```
tillerstead-toolkit/
├── frontend/          # Next.js 14 + TypeScript + Tailwind (standalone)
├── backend/           # FastAPI + Python + SQLAlchemy
│   └── app/
│       ├── api/       # REST endpoints
│       ├── calculators/ # TCNA calculation engines
│       ├── db/        # SQLAlchemy models
│       └── schemas/   # Pydantic validation
├── shared/            # Shared types and constants
└── docs/              # Documentation
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`  
Docs available at: `http://localhost:8000/docs`

### Frontend (Optional)
```bash
cd frontend
npm install
npm run dev
```

## Features

### Calculators
- **Tile Floor**: Area from shapes + waste% + tile size + box rounding
- **Tile Wall**: Walls minus openings + niches + waste
- **Thinset/Mortar**: Coverage by trowel + tile size + substrate factor
- **Grout**: Tile size + thickness + joint width
- **Waterproofing**: Liquid (gallons) and sheet (rolls)
- **Backer Board**: Sheets + screws + tape
- **Self-Leveler**: Area + thickness → bags + primer
- **Drywall Joint Compound**: Dry mix bags AND premix buckets
- **Trim/Baseboard**: LF + waste + corners
- **Paint**: Walls/ceilings + coats
- **Labor & Schedule**: Production rates → hours/days
- **Bid Builder**: Full estimate generation

### Catalog Connectors
- **ManualPriceBookConnector** (default): User enters products, prices, uploads receipts/CSV
- **HomeDepotAffiliateFeedConnector**: Accepts user-uploaded affiliate feed files
- **ThirdPartyCatalogConnector**: Third-party API integration (requires user API key)

## Compliance Notes

⚠️ **Retailer pricing changes frequently. Always verify prices in cart/receipt before purchasing.**

This application does NOT scrape retailer websites. All pricing data comes from:
1. Manual entry by the user
2. User-provided affiliate feed files
3. Third-party APIs with user-supplied credentials

## License

Proprietary - Tillerstead LLC
