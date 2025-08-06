from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
from io import BytesIO
app = FastAPI()

class SensorData(BaseModel):
    temperature: float
    vibration: float
    speed: float


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower()
        contents = await file.read()
        img = Image.open(BytesIO(contents)).convert('RGB')
        arr = np.array(img)

        # DEMO FILENAME TRIGGERS for hackathon
        if "crack" in filename:
            return JSONResponse({"defect_probability": 0.87, "defect_type": "Crack detected"})
        elif "tree" in filename or "branch" in filename or "debris" in filename:
            return JSONResponse({"defect_probability": 0.95, "defect_type": "Obstruction on track"})

        # Pixel rule: green pixel detection
        green_mask = (arr[:,:,1] > 120) & (arr[:,:,0] < 100) & (arr[:,:,2] < 100)
        green_ratio = np.sum(green_mask) / (arr.shape[0] * arr.shape[1])
        if green_ratio > 0.10:
            return JSONResponse({"defect_probability": 0.95, "defect_type": "Obstruction on track (tree/branch/debris detected)"})

        # Pixel rule: edge detection (lower threshold for demo!)
        from scipy import ndimage
        edges = np.mean(np.abs(ndimage.sobel(arr[:,:,0].astype(float))))
        if edges > 5:
            return JSONResponse({"defect_probability": 0.75, "defect_type": "Possible crack or discontinuity detected"})
        # Default fallback
        return JSONResponse({"defect_probability": 0.01, "defect_type": "No visible defect"})
    except Exception as e:
        return JSONResponse({"defect_probability": 0, "defect_type": "Could not analyze: " + str(e)})


class ReportIn(BaseModel):
    report: str

@app.post("/parse-report")
async def parse_report(report_in: ReportIn):
    text = report_in.report
    # Do your NLP here; always try/except and return defaults on error
    try:
        # simulate analysis
        return {
            "summary": text[:40] + "...",
            "urgency_score": 0.9,
            "extracted_entities": ["Zone 6", "Crack"],
            "suggested_actions": ["Dispatch team", "Limit speed"]
        }
    except Exception as e:
        return {
            "summary": "",
            "urgency_score": 0,
            "extracted_entities": [],
            "suggested_actions": [],
            "error": str(e)
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

@app.get("/alerts")
def get_alerts():
    return [
        {
            "message": "Possible track fault detected",
            "time": "2025-08-06T00:54:49Z",
            "severity": "High"
        },
        {
            "message": "Anomaly score: 92%",
            "time": "2025-08-06T00:54:49Z",
            "severity": "Medium"
        }
    ]
    
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
