import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, files, summary, user

app = FastAPI()


origins_raw = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = origins_raw.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(summary.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}