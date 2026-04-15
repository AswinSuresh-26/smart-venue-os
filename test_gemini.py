#!/usr/bin/env python
"""
Quick test to verify Gemini API key works
Run this before final submission to ensure backend will function
"""

import os
import httpx
import json

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not set in environment")
    print("Set it with: export GEMINI_API_KEY=your_key")
    exit(1)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

print("🧪 Testing Gemini API...")
print(f"Project ID: 64290534607")
print(f"API Key: {GEMINI_API_KEY[:20]}...")

payload = {
    "system_instruction": {
        "parts": [{
            "text": "You are SVOS Assistant. Keep responses SHORT (2 sentences max)."
        }]
    },
    "contents": [
        {
            "role": "user",
            "parts": [{
                "text": "Where's the shortest food queue?"
            }]
        }
    ],
    "generationConfig": {
        "maxOutputTokens": 100,
    }
}

try:
    response = httpx.post(
        f"{GEMINI_URL}?key={GEMINI_API_KEY}",
        json=payload,
        headers={"content-type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"\n✅ SUCCESS! Gemini response:\n{reply}\n")
        print("🎉 Your API key works! Ready to deploy.")
    else:
        print(f"\n❌ API Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("Check your internet connection and API key.")
