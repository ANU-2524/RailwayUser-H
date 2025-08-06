from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
from io import BytesIO
from datetime import datetime, timezone
import random
app = FastAPI()

class SensorData(BaseModel):
    temperature: float
    vibration: float
    speed: float


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower() 
        print("Received file:", filename) 
        contents = await file.read()
        print("Starting image analysis...")
        img = Image.open(BytesIO(contents)).convert('RGB')
        arr = np.array(img)

        # Filename demo triggers
        if "crack" in filename:
            return JSONResponse({"defect_probability": 0.85, "defect_type": "Crack detected"})
        elif any(word in filename for word in ["tree", "branch", "debris"]):
            return JSONResponse({"defect_probability": 0.93, "defect_type": "Obstruction on track (tree/branch/debris detected)"})

        # Green pixel (obstruction by foliage or debris)
        green_mask = (arr[:,:,1] > 120) & (arr[:,:,0] < 100) & (arr[:,:,2] < 100)
        green_ratio = np.sum(green_mask) / (arr.shape[0] * arr.shape[1])
        if green_ratio > 0.05:  # lower threshold for demo
            return JSONResponse({"defect_probability": 0.92, "defect_type": "Obstruction on track (green debris)"})

        # Edge: simple “crack” detection (relaxed for more positives!)
        from scipy import ndimage
        edges = np.mean(np.abs(ndimage.sobel(arr[:,:,0].astype(float))))
        if edges > 5:  # lower threshold for more cracks
            return JSONResponse({"defect_probability": 0.76, "defect_type": "Possible crack or discontinuity detected"})

        # Default
        return JSONResponse({"defect_probability": 0.03, "defect_type": "No visible defect"})

    except Exception as e:
        return JSONResponse({"defect_probability": 0, "defect_type": f"Could not analyze: {str(e)}"})


class ReportIn(BaseModel):
    report: str

@app.post("/parse-report")
async def parse_report(report_in: ReportIn):
    text = report_in.report.lower()
    summary = text[:40] + "..." if len(text) > 40 else text

    # --- Keyword heuristics ---
    entities = []
    actions = []
    urgency = 0.2  # default: low urgency

    # Find urgency and entities
    if "crack" in text:
        entities.append("Crack")
        urgency = 0.9
        actions.append("Dispatch team")
        actions.append("Limit speed")
    if "zone" in text:
        # Extract the first zone mentioned
        import re
        zone_match = re.search(r'zone\s?([a-z0-9]+)', text)
        if zone_match:
            entities.append(f"Zone {zone_match.group(1).upper()}")
    if "loose bolt" in text or "bolt" in text or "joint" in text:
        entities.append("Bolts")
        urgency = max(urgency, 0.7)
        actions.append("Tighten bolts")
    if "urgent" in text or "immediate" in text:
        urgency = max(urgency, 0.95)
    if "no issue" in text or "routine" in text or "ok" in text:
        urgency = 0.1
        actions = ["Routine monitoring"]

    if not entities:
        entities.append("General Inspection")

    if not actions:
        actions.append("Monitor track")
    
    return {
        "summary": summary,
        "urgency_score": urgency,
        "extracted_entities": entities,
        "suggested_actions": actions
    }


@app.post("/predict")
def predict(data: List[SensorData]):
    # Simple mock anomaly detection:
    # Example: if vibration > 0.5 and temperature > 50°C ==> anomaly
    anomalies = []
    for i, d in enumerate(data):
        abnormal = d.vibration > 0.5 and d.temperature > 50
        anomalies.append({
            "index": i,
            "temperature": d.temperature,
            "vibration": d.vibration,
            "speed": d.speed,
            "anomaly": abnormal,
            "score": (d.vibration + (d.temperature / 100)) / 2  # mock score
        })
    return {"anomalies": anomalies}

ALERT_MESSAGES = [
    ("Possible track fault detected", "High"),
    ("Anomaly score: 92%", "Medium"),
    ("Temperature spike detected", "High"),
    ("Routine inspection completed", "Low"),
    ("Vibration levels abnormal", "High"),
    ("Scheduled maintenance due soon", "Low"),
]


@app.get("/alerts")
def get_alerts():
    # Generate 1-3 alerts dynamically
    n = random.randint(1, 3)
    alerts = []
    now_iso = datetime.now(timezone.utc).isoformat()
    for _ in range(n):
        msg, sev = random.choice(ALERT_MESSAGES)
        # You could also randomize message contents here for more realism
        alerts.append({
            "message": msg,
            "time": now_iso,
            "severity": sev
        })
    return JSONResponse(alerts)
    
@app.post("/summarize")
def summarize(data: List[SensorData]):
    # Mock, but you can adjust for more realism!
    avg_temp = sum([d.temperature for d in data]) / len(data)
    avg_vib = sum([d.vibration for d in data]) / len(data)
    summary = (
        f"Average temperature was {avg_temp:.1f}°C. "
        f"Average vibration: {avg_vib:.3f}. "
    )
    # Simple anomaly statement
    if any(d.vibration > 0.5 for d in data):
        summary += "High vibration detected. Possible anomaly in tracked data."
    else:
        summary += "All telemetry within normal ranges."
    return {"summary": summary}

# You’ll add more endpoints for prediction, summarization, etc. later

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
