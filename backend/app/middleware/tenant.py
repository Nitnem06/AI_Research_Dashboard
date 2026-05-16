"""
Tenant middleware: attaches the current user's org_id to every request state.
All DB queries in routers must filter by request.state.org_id — never trust
user-supplied org IDs in request bodies for data access decisions.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # org_id gets injected by get_current_user dependency in routes
        # We initialise it to None here so it's always present on request.state
        request.state.org_id = None
        request.state.user_id = None
        response = await call_next(request)
        return response


def get_tenant_context(request: Request) -> dict:
    """Helper to read org context set by auth dependency."""
    return {
        "org_id": getattr(request.state, "org_id", None),
        "user_id": getattr(request.state, "user_id", None),
    }