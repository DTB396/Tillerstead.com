"""
Tillerstead Toolkit - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import jobs, rooms, calculators, products, imports, exports, settings
from app.db.database import engine, Base
from app.core.config import settings as app_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Tillerstead Toolkit API",
    description="Contractor Calculator Hub + Inventory + Catalog Connector",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - allow production domains + local dev
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://tillerstead.com",
    "https://www.tillerstead.com",
    "https://tillerstead.github.io"  # GitHub Pages if using default domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(calculators.router, prefix="/api/calculators", tags=["Calculators"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(imports.router, prefix="/api/imports", tags=["Imports"])
app.include_router(exports.router, prefix="/api/exports", tags=["Exports"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])


@app.get("/")
async def root():
    return {
        "name": "Tillerstead Toolkit API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
