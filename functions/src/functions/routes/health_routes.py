from fastapi import APIRouter
from functions.config.settings import settings

router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    """Health check endpoint."""
    return {"message": settings.TITLE, "version": settings.VERSION, "status": "healthy"}
