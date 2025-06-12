from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from functions.config.settings import settings
from functions.routes.health_routes import router as health_router
from functions.routes.game_routes import router as game_router

# Initialize FastAPI app
app = FastAPI(title=settings.TITLE, version=settings.VERSION)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

# Include routers
app.include_router(health_router)
app.include_router(game_router)

# Handler for AWS Lambda
handler = Mangum(app)
