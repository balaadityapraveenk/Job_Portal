from fastapi import APIRouter, Body, HTTPException, Request
from typing import Any, Dict
import requests

from config import SPRING_URL
from routes.utils import get_headers, handle_spring_response

router = APIRouter()


@router.get("/jobs")
def get_jobs(request: Request):
    """Retrieve all job listings from the Spring backend."""
    try:
        response = requests.get(
            f"{SPRING_URL}/jobs",
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.post("/jobs")
def create_job(request: Request, job: Dict[str, Any] = Body(...)):
    """Create a new job listing via the Spring backend."""
    try:
        response = requests.post(
            f"{SPRING_URL}/jobs",
            json=job,
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.get("/jobs/{id}")
def get_job(id: int, request: Request):
    """Retrieve a single job listing by ID from the Spring backend."""
    try:
        response = requests.get(
            f"{SPRING_URL}/jobs/{id}",
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.put("/jobs/{id}")
def update_job(id: int, request: Request, job: Dict[str, Any] = Body(...)):
    """Update a job listing via the Spring backend."""
    try:
        response = requests.put(
            f"{SPRING_URL}/jobs/{id}",
            json=job,
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.delete("/jobs/{id}")
def delete_job(id: int, request: Request):
    """Delete a job listing via the Spring backend."""
    try:
        response = requests.delete(
            f"{SPRING_URL}/jobs/{id}",
            headers=get_headers(request),
            timeout=10
        )
        handle_spring_response(response)
        return {"message": "Job deleted successfully"}
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")