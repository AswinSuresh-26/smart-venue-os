"""
SVOS Backend - FastAPI
Handles:
- Google Gemini API proxy (keeps key server-side)  
- Crowd data endpoints
- Health check
"""

import os
import random
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx

app = FastAPI(title="SVOS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# ---- Pydantic Models ----

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: str = ""

# ---- Routes ----

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "SVOS Backend",
        "version": "1.0.0"
    }

@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Proxy chat requests to Gemini API, injecting live crowd context.
    Keeps API key server-side for security.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    system = f"""You are SVOS Assistant, an AI guide for a large sports venue (capacity 55,000).
Help attendees navigate, find shortest queues, and have the best experience.
Keep answers SHORT (2-3 sentences), friendly, and actionable.
Always recommend the least crowded option when asked.

{req.context}"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": msg.content}
                    for msg in req.messages
                ]
            }
        ],
        "system_instruction": {
            "parts": {
                "text": system
            }
        },
        "generationConfig": {
            "maxOutputTokens": 300,
            "temperature": 0.7,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload,
            )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        data = response.json()
        
        # Extract text from response
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                reply = parts[0]["text"]
                return {"reply": reply}
        
        return {"reply": "Sorry, I couldn't process that. Try again!"}
        
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.get("/api/zones")
async def get_zones():
    """
    Returns simulated real-time zone data.
    In production, this would pull from IoT sensors / camera feeds.
    """
    zones = [
        {"id": "gate-a", "name": "Gate A (Main)", "type": "gate"},
        {"id": "gate-b", "name": "Gate B (East)", "type": "gate"},
        {"id": "gate-c", "name": "Gate C (West)", "type": "gate"},
        {"id": "gate-d", "name": "Gate D (South)", "type": "gate"},
        {"id": "food-1", "name": "Food Court North", "type": "food"},
        {"id": "food-2", "name": "Food Court East", "type": "food"},
        {"id": "food-3", "name": "Food Court South", "type": "food"},
        {"id": "wc-1", "name": "Restrooms North", "type": "wc"},
        {"id": "wc-2", "name": "Restrooms West", "type": "wc"},
        {"id": "wc-3", "name": "Restrooms East", "type": "wc"},
        {"id": "medic", "name": "Medical Center", "type": "medic"},
        {"id": "merch", "name": "Merchandise", "type": "merch"},
    ]

    result = []
    for z in zones:
        density = random.randint(20, 95)
        wait = 0
        if z["type"] in ("food", "wc", "gate"):
            wait = max(0, round(density / 10) + random.randint(-2, 2))
        result.append({
            **z,
            "density": density,
            "waitTime": wait,
            "alert": density > 80,
            "timestamp": datetime.utcnow().isoformat(),
        })

    return {"zones": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
