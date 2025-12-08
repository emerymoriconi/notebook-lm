from fastapi import FastAPI
from app.routers import auth, files, summary, user

app = FastAPI()

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(summary.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}