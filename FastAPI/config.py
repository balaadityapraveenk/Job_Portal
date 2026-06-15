"""
Shared configuration for the FastAPI gateway.
"""

import os

# Base URL of the Spring Boot backend
SPRING_URL = os.getenv("SPRING_URL", "http://localhost:8080")

