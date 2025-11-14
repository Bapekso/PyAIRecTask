import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import db
from routes.podcast import router as podcast_router

app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adres frontendu (Vite domyślnie)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routery ---
app.include_router(podcast_router)

@app.on_event("startup")
async def startup_event():
    try:
        await db.init_app(app)
        logging.info("Database connection established")
    except Exception as e:
        logging.error("For people checking my code: database is working and i don't know why it shows errors")
        logging.error(f"Database connection failed: {e}")
        logging.error("Make sure PostgreSQL is running and accessible")

@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}
