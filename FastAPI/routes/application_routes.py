from fastapi import APIRouter, Body, HTTPException, Request
from typing import Any, Dict
import requests

from config import SPRING_URL
from routes.utils import get_headers, handle_spring_response

router = APIRouter()


@router.post("/applications")
def apply_job(request: Request, application: Dict[str, Any] = Body(...)):
    """Submit a new job application to the Spring backend."""
    try:
        response = requests.post(
            f"{SPRING_URL}/applications",
            json=application,
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.get("/applications")
def get_applications(request: Request):
    """Retrieve all job applications from the Spring backend (Admin use)."""
    try:
        response = requests.get(
            f"{SPRING_URL}/applications",
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.get("/applications/user/{userId}")
def get_applications_by_user(userId: int, request: Request):
    """Retrieve all job applications for a specific user from the Spring backend."""
    try:
        response = requests.get(
            f"{SPRING_URL}/applications/user/{userId}",
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.put("/applications/{id}")
def update_application_status(id: int, request: Request, application: Dict[str, Any] = Body(...)):
    """Update the status of a job application via the Spring backend (Admin use)."""
    try:
        response = requests.put(
            f"{SPRING_URL}/applications/{id}",
            json=application,
            headers=get_headers(request),
            timeout=10
        )
        return handle_spring_response(response)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")


@router.delete("/applications/{id}")
def withdraw_application(id: int, request: Request):
    """Withdraw/delete a job application via the Spring backend."""
    try:
        response = requests.delete(
            f"{SPRING_URL}/applications/{id}",
            headers=get_headers(request),
            timeout=10
        )
        handle_spring_response(response)
        return {"message": "Application withdrawn successfully"}
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Spring backend is unavailable")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Spring backend timed out")