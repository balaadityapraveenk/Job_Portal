from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import application_routes, auth_routes, job_routes

app = FastAPI(
    title="Job Listing and Application Interface",
    description="FastAPI gateway that proxies requests to the Spring Boot backend.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers BEFORE defining any standalone routes
app.include_router(application_routes.router, tags=["Applications"])
app.include_router(auth_routes.router, tags=["Auth"])
app.include_router(job_routes.router, tags=["Jobs"])


@app.get("/", tags=["Health"])
def home():
    return {"message": "FastAPI Gateway Running"}

#2500031053,2500031882,2500031886