from fastapi import FastAPI

from routers import health, ingest, query

app = FastAPI(title='VeritasRAG AI Service', version='0.1.0')

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(query.router)
