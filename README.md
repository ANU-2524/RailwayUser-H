🚄 RailVisionAI
AI-powered, real-time monitoring and analytics for next-generation railway operations

🌐 (Live Demo)[https://railvisionai-frontend.vercel.app/]

🚀 What is RailVisionAI?
RailVisionAI is a full-stack, production-grade platform for real-time railway health monitoring and predictive maintenance. Combining AI, telemetry, and a modern web UI, it empowers railway operators to:

Get live sensor data, smart alerts, and predictive diagnostics

Chat with an AI assistant for maintenance actions and logs

Collaborate with engineers securely (CRUD logs, image analysis, report parsing)

All running on a cloud-native microservices stack! 🌩️

🌟 Key Features
Live Sensor Dashboard:
Real-time metrics and visualizations from trackside IoT sensors (WebSockets).

Smart Alerts Feed:
Automated detection of anomalies, tracked with AI engine integration.

Predictive Analytics:
AI-powered summaries and maintenance predictions.

Operator-friendly Maintenance Logs:
Create, review, update & delete logs, powered by Strapi CMS.

AI Chatbot Assistant:
Natural language Q&A for track status, repair tips, and quick actions.

Secure, Multi-Service Architecture:
Gateways, CMS, and AI microservices—fully decoupled and scalable.

🛠 Tech Stack
Technology	Role
React/Next.js	Frontend UI (Vercel Deployed)
Node.js/Express	API Gateway & WebSocket backend
Python FastAPI	AI Engine (alerts, summaries, predictions)
Strapi CMS	Maintenance logs and content management
SQLite	Simple DB for demo
Render	Backend deployment (WebSocket/API/CMS/AI)
Vercel	Live static frontend hosting
🏗️ Architecture Overview
text
          +---------------+
          |   Frontend    |
   (Vercel, Next.js/React)|
          +-------+-------+
                  |
                  v
       +----------------------+
       |   API Gateway        | <------> AI Engine (FastAPI/Python)
       | (Express/Node, Render)         (Render)
       |     |                |
       |     +--------------->|<------> WebSocket Backend (Node.js)
       |                      |         (Render, Live Sensor Stream)
       |                      |
       |                      +-------> CMS (Strapi, Render)
       +----------------------+
🌐 Live Demo
Try it now:
🔗 https://railvisionai-frontend.vercel.app/

Connects in real-time to all deployed backends—no mocked data!

Open Developer Tools for live network/WebSocket traffic

🚉 Example Flows
Monitor Live Track Metrics:
Dashboard auto-updates via WebSocket with real sensor data.

Get Smart AI Summaries:
Paste maintenance reports for instant AI-powered parsing & risk assessment.

Create/Audit Operator Logs:
CRUD maintenance logs with user-friendly forms, powered by CMS.

Instant Chat & Support:
RailVisionAI assistant fields any operational questions, predicts actions.

🧑💻 How to Run Locally
Prerequisites
Node.js (20+ recommended), npm

Python 3.9+ (for AI engine)

(Optional) Docker for local microservice orchestration

Clone & Install
bash
git clone https://github.com/ANU-2524/RailwayUser-H.git
cd RailwayUser-H
1. Start Backends (Each in Separate Terminal)
AI Gateway:

bash
cd ai-gateway
npm install
npm run dev
AI Engine (Python):

bash
cd ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
CMS (Strapi):

bash
cd cms
npm install
npm run develop
WebSocket Backend:

bash
cd websockets
npm install
node index.js
2. Start Frontend
bash
cd frontend
npm install
npm run dev
Set .env.local with correct local or deployed backend URLs.

## 🚂 Crafted with Passion

**✨ Every line of code, every deployment, every moment of this project was imagined and realized by ANU (2nd year Student - Chitkara University) for the _Railway User Hackathon 2025_. ✨**

---
