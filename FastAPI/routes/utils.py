from fastapi import HTTPException, Request
from typing import Any, Dict
import requests

def get_headers(request: Request) -> Dict[str, str]:
    headers = {}
    auth = request.headers.get("Authorization")
    if auth:
        headers["Authorization"] = auth
    return headers

def handle_spring_response(response: requests.Response) -> Any:
    """
    Checks if response is successful. If not, raises HTTPException with the 
    appropriate status code and the actual error message from the backend.
    Otherwise, returns the parsed JSON.
    """
    if response.status_code >= 400:
        content_type = response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            try:
                body = response.json()
                detail = body.get("detail") or body.get("message") or response.text
            except Exception:
                detail = response.text or "Unknown error from Spring backend"
        else:
            detail = response.text.strip() or "Unknown error from Spring backend"
        raise HTTPException(status_code=response.status_code, detail=detail)
    
    # Successful response (2xx)
    if response.status_code == 204:
        return None
        
    try:
        return response.json()
    except ValueError:
        # If response was empty or not JSON, but status was 200/201
        return {"detail": response.text} if response.text else {}
