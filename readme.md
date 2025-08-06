# RailVisionAI

AI-Powered Predictive Maintenance & Alert System for Railway Infrastructure

Microservice-based with realtime telemetry, LLM summaries, image defect detection, and operator report NLP.

Built for Railway Hackathon.

## Folder Structure

- frontend/: Next.js dashboard UI
- api-gateway/: Node.js REST/GraphQL backend
- ai-engine/: FastAPI AI microservices
- websocket/: mock realtime sensor data feed
- cms/: Strapi headless CMS
- db/: DB setup (Postgres)
- auth/: Auth service (Clerk)
- railway.template.yml: Railway deploy config
uvicorn app.main:app --reload

