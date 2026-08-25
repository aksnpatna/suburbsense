import os
import sys
import sqlalchemy
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize security features
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add the current directory to Python path to import app module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings
from app.suburbs import router as suburbs_router
from app.school_zones import router as school_zones_router
from app.scanners import router as scanners_router
from app.grocery import router as grocery_router
from app.leads import router as leads_router
from app.calculators import router as calculators_router
from app.nbn import router as nbn_router
from app.property_tools import router as property_tools_router
from app.seo import router as seo_router
from app.analytics import router as analytics_router
from app.guides import router as guides_router
from app.db import utility_engine
from app import db

# Initialize utility_hub database
def init_utility_db():
    try:
        # Check if utility_hub DB exists and has our tables
        with utility_engine.connect() as conn:
            # Create tables from our schema
            with open(os.path.join(os.path.dirname(__file__), 'sql', 'init.sql'), 'r') as f:
                init_sql = f.read()
                
            for statement in init_sql.split(';'):
                if statement.strip():
                    try:
                        conn.execute(sqlalchemy.text(statement))
                    except Exception as e:
                        print(f"Warning: SQL statement failed: {e}")
                        
            conn.commit()
        print("✅ utility_hub database initialized")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

app = FastAPI(
    title=get_settings().site_name,
    description="Suburb living cost and bill comparison platform",
    version="0.1.0"
)

# Attach Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def set_secure_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;"
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://suburbsense.com",
        "https://www.suburbsense.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the utility_hub DB on startup
@app.on_event("startup")
async def startup_event():
    init_utility_db()

# Health endpoint
@app.get("/api/health")
async def health():
    settings = get_settings()
    return {
        "status": "healthy",
        "service": settings.site_name,
        "version": "0.1.0"
    }

# Include routers
app.include_router(suburbs_router)
app.include_router(scanners_router)
app.include_router(grocery_router)
app.include_router(leads_router)
app.include_router(calculators_router)
app.include_router(nbn_router)
app.include_router(school_zones_router)
app.include_router(property_tools_router)
app.include_router(seo_router)
app.include_router(analytics_router)
app.include_router(guides_router)

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8888, reload=True)
