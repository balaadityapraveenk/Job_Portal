"""
Shared configuration for the FastAPI gateway.
"""

import os

# Base URL of the Spring Boot backend
SPRING_URL = os.getenv("SPRING_URL", "http://localhost:8080")
if SPRING_URL and not (SPRING_URL.startswith("http://") or SPRING_URL.startswith("https://")):
    SPRING_URL = f"http://{SPRING_URL}"

