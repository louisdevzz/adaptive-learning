"""API v1 endpoints."""

from fastapi import APIRouter

from api.v1 import auth, courses, knowledge_points, modules, sections

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(modules.router)
api_router.include_router(sections.router)
api_router.include_router(knowledge_points.router)
