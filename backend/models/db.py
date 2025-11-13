import asyncpg
import os

async def init_app(app):
    database_url = os.getenv('DATABASE_URL')
    
    try:
        app.state.db_pool = await asyncpg.create_pool(database_url)
        print("Database pool created successfully")
    except Exception as e:
        print(f"Failed to create database pool: {e}")
        raise e