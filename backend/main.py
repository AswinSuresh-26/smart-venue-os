"""
SVOS Backend - FastAPI
Handles:
- Google Gemini API proxy (keeps key server-side)
- Crowd data seeding to Firebase
- Google Cloud Pub/Sub real-time streaming
- Google Cloud BigQuery analytics logging
- Health check endpoint
"""

import os
import asyncio
import random
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx

# Google Cloud imports
from google.cloud import pubsub_v1
from google.cloud import bigquery

app = FastAPI(title="SVOS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod, restrict to your domain
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# Google Cloud configuration
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "diesel-command-493401-q7")
PUBSUB_TOPIC = os.getenv("PUBSUB_CROWD_TOPIC", "crowd-data")
BIGQUERY_DATASET = os.getenv("BIGQUERY_DATASET", "svos_analytics")
BIGQUERY_TABLE = os.getenv("BIGQUERY_TABLE", "crowd_events")

# Initialize Google Cloud clients
try:
    pubsub_publisher = pubsub_v1.PublisherClient()
    topic_path = pubsub_publisher.topic_path(GCP_PROJECT_ID, PUBSUB_TOPIC)
    PUBSUB_ENABLED = True
except Exception as e:
    print(f"⚠️ Pub/Sub not initialized: {e}")
    PUBSUB_ENABLED = False

try:
    bigquery_client = bigquery.Client(project=GCP_PROJECT_ID)
    BIGQUERY_ENABLED = True
except Exception as e:
    print(f"⚠️ BigQuery not initialized: {e}")
    BIGQUERY_ENABLED = False

# ---- Pydantic Models ----

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: str = ""  # Live crowd data context

class ZoneData(BaseModel):
    id: str
    name: str
    type: str
    density: int
    waitTime: int
    alert: bool
    x: Optional[float] = None
    y: Optional[float] = None
    timestamp: str

# ---- Google Cloud Helper Functions ----

async def publish_to_pubsub(zone_data: dict):
    """Publish crowd data to Pub/Sub for real-time streaming"""
    if not PUBSUB_ENABLED:
        return

    try:
        message_json = json.dumps(zone_data)
        future = pubsub_publisher.publish(
            topic_path,
            message_json.encode("utf-8"),
            zone_id=zone_data.get("id", ""),
        )
        future.result(timeout=5)
    except Exception as e:
        print(f"⚠️ Pub/Sub publish error: {e}")

async def log_to_bigquery(zone_data: dict):
    """Log crowd data to BigQuery for analytics"""
    if not BIGQUERY_ENABLED:
        return

    try:
        table = bigquery_client.get_table(f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}")
        rows_to_insert = [zone_data]
        errors = bigquery_client.insert_rows_json(table, rows_to_insert)
        if errors:
            print(f"⚠️ BigQuery insert errors: {errors}")
    except Exception as e:
        print(f"⚠️ BigQuery logging error: {e}")

# ---- Routes ----

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "pubsub": "enabled" if PUBSUB_ENABLED else "disabled",
            "bigquery": "enabled" if BIGQUERY_ENABLED else "disabled",
        }
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Proxy chat requests to Google Gemini, injecting live crowd context.
    This keeps the API key server-side.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    system = f"""You are SVOS Assistant, an AI guide for a large sports venue (SVOS Arena, capacity 55,000).
You help attendees navigate, find shortest queues, and have the best experience.
Keep answers SHORT (2-3 sentences), friendly, and actionable.
Always recommend the least crowded option when asked.

{req.context}"""

    # Format message history for Gemini
    contents = []
    for m in req.messages:
        contents.append({
            "role": "user" if m.role == "user" else "model",
            "parts": [{"text": m.content}]
        })

    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": 300,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers={
                "content-type": "application/json",
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    reply = data["candidates"][0]["content"]["parts"][0]["text"] if data.get("candidates") else "Sorry, try again."
    return {"reply": reply}


@app.get("/api/zones")
async def get_zones():
    """
    Returns real-time zone data with Pub/Sub publishing and BigQuery logging.
    In production, this would pull from IoT sensors / camera feeds.
    """
    zones = [
        {"id": "gate-a", "name": "Gate A (Main)", "type": "gate", "x": 50, "y": 5},
        {"id": "gate-b", "name": "Gate B (East)", "type": "gate", "x": 90, "y": 45},
        {"id": "gate-c", "name": "Gate C (West)", "type": "gate", "x": 10, "y": 45},
        {"id": "gate-d", "name": "Gate D (South)", "type": "gate", "x": 50, "y": 90},
        {"id": "food-1", "name": "Food Court North", "type": "food", "x": 30, "y": 20},
        {"id": "food-2", "name": "Food Court East", "type": "food", "x": 75, "y": 35},
        {"id": "food-3", "name": "Food Court South", "type": "food", "x": 65, "y": 75},
        {"id": "wc-1", "name": "Restrooms North", "type": "wc", "x": 55, "y": 18},
        {"id": "wc-2", "name": "Restrooms West", "type": "wc", "x": 18, "y": 60},
        {"id": "wc-3", "name": "Restrooms East", "type": "wc", "x": 82, "y": 60},
        {"id": "medic", "name": "Medical Center", "type": "medic", "x": 50, "y": 50},
        {"id": "merch", "name": "Merchandise", "type": "merch", "x": 25, "y": 75},
    ]

    result = []
    for z in zones:
        density = random.randint(20, 95)
        wait = 0
        if z["type"] in ("food", "wc", "gate"):
            wait = max(0, round(density / 10) + random.randint(-2, 2))
        
        zone_data = {
            **z,
            "density": density,
            "waitTime": wait,
            "alert": density > 80,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        result.append(zone_data)
        
        # Async publish to Pub/Sub and BigQuery (fire and forget)
        asyncio.create_task(publish_to_pubsub(zone_data))
        asyncio.create_task(log_to_bigquery(zone_data))

    return {"zones": result}


@app.get("/api/analytics/crowd-summary")
async def crowd_analytics():
    """
    Returns crowd analytics from BigQuery for dashboard visualization.
    Queries historical data for trends.
    """
    if not BIGQUERY_ENABLED:
        return {
            "status": "BigQuery not configured",
            "message": "Set up GCP credentials to enable analytics"
        }

    try:
        query = f"""
        SELECT
            zone_id,
            zone_name,
            ROUND(AVG(density), 1) as avg_density,
            MAX(density) as peak_density,
            COUNT(*) as events,
            TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), HOUR) as hour_bucket
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
        WHERE TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), timestamp, HOUR) <= 24
        GROUP BY zone_id, zone_name, hour_bucket
        ORDER BY hour_bucket DESC, zone_id
        LIMIT 100
        """
        
        results = bigquery_client.query(query).result()
        analytics = [dict(row) for row in results]
        
        return {
            "status": "success",
            "analytics": analytics,
            "total_events": len(analytics),
            "query_timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/api/analytics/alerts")
async def alerts_analytics():
    """
    Returns high-density alert events from BigQuery.
    """
    if not BIGQUERY_ENABLED:
        return {"status": "BigQuery not configured"}

    try:
        query = f"""
        SELECT
            zone_id,
            zone_name,
            density,
            wait_time,
            timestamp,
            alert
        FROM `{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
        WHERE alert = true
        AND TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), timestamp, HOUR) <= 24
        ORDER BY timestamp DESC
        LIMIT 50
        """
        
        results = bigquery_client.query(query).result()
        alerts = [dict(row) for row in results]
        
        return {
            "status": "success",
            "alerts": alerts,
            "total_alerts": len(alerts),
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/api/pubsub/topic-info")
async def pubsub_info():
    """
    Returns Pub/Sub topic information and current subscription status.
    """
    if not PUBSUB_ENABLED:
        return {
            "status": "Pub/Sub not configured",
            "message": "Set up GCP credentials to enable real-time streaming"
        }

    try:
        topic_path = pubsub_publisher.topic_path(GCP_PROJECT_ID, PUBSUB_TOPIC)
        return {
            "status": "enabled",
            "topic": PUBSUB_TOPIC,
            "project": GCP_PROJECT_ID,
            "topic_path": str(topic_path),
            "note": "Frontend can subscribe to this topic for real-time updates"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.on_event("startup")
async def startup_event():
    """Initialize BigQuery table if it doesn't exist"""
    if not BIGQUERY_ENABLED:
        print("⏭️  Skipping BigQuery initialization (credentials not configured)")
        return
    
    try:
        try:
            dataset = bigquery_client.get_dataset(BIGQUERY_DATASET)
        except:
            # Create dataset if it doesn't exist
            dataset = bigquery.Dataset(f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}")
            dataset.location = "US"
            dataset = bigquery_client.create_dataset(dataset)
            print(f"✅ Created BigQuery dataset: {BIGQUERY_DATASET}")
        
        try:
            table = bigquery_client.get_table(f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}")
        except:
            # Create table if it doesn't exist
            schema = [
                bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("type", "STRING", mode="NULLABLE"),
                bigquery.SchemaField("density", "INTEGER", mode="NULLABLE"),
                bigquery.SchemaField("wait_time", "INTEGER", mode="NULLABLE"),
                bigquery.SchemaField("alert", "BOOLEAN", mode="NULLABLE"),
                bigquery.SchemaField("zone_id", "STRING", mode="NULLABLE"),
                bigquery.SchemaField("zone_name", "STRING", mode="NULLABLE"),
                bigquery.SchemaField("x", "FLOAT", mode="NULLABLE"),
                bigquery.SchemaField("y", "FLOAT", mode="NULLABLE"),
                bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED"),
            ]
            table = bigquery.Table(f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}", schema=schema)
            table = bigquery_client.create_table(table)
            print(f"✅ Created BigQuery table: {BIGQUERY_TABLE}")
    except Exception as e:
        print(f"⚠️ BigQuery startup error (non-blocking): {e}")
