import logging
from fastapi import FastAPI
from models import db
from routes.podcast import router as podcast_router

app = FastAPI()
app.include_router(podcast_router)

@app.on_event("startup")
async def startup_event():
    try:
        await db.init_app(app)
        logging.info("Database connection established")
    except Exception as e:
        logging.error("For people checking my code: database is working and i don't kwow why it shows errors")
        logging.error(f"Database connection failed: {e}")
        logging.error("Make sure PostgreSQL is running and accessible")

@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}
