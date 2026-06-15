from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse
from typing import Any, Dict
import requests

from config import SPRING_URL

router = APIRouter()


def _parse_spring_response(response: requests.Response):
    """Parse Spring Boot response — handles both JSON and plain-text bodies."""
    content_type = response.headers.get("Content-Type", "")
    text = response.text.strip()
    if "application/json" in content_type:
        try:
            return response.json()
        except ValueError:
            pass
    # Plain text response (e.g. "Email already registered", "Invalid email or password")
    return {"detail": text} if text else {"detail": "Unknown error"}


@router.post("/auth/register")
def register(user: Dict[str, Any] = Body(...)):
    """Register a new user via the Spring backend."""
    try:
        response = requests.post(
            f"{SPRING_URL}/auth/register",
            json=user,
            timeout=60
        )
        body = _parse_spring_response(response)
        return JSONResponse(status_code=response.status_code, content=body)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.post("/auth/login")
def login(user: Dict[str, Any] = Body(...)):
    """Authenticate a user via the Spring backend."""
    try:
        response = requests.post(
            f"{SPRING_URL}/auth/login",
            json=user,
            timeout=60
        )
        body = _parse_spring_response(response)
        return JSONResponse(status_code=response.status_code, content=body)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")