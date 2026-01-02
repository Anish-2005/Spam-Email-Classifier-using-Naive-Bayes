Deployment (Docker Compose)

1. Build and run (from project root):

```bash
docker-compose up --build -d
```

2. Backend API: http://localhost:8000/docs (FastAPI Swagger UI)
3. Frontend UI: http://localhost:3000

Notes:
- Ensure `models/model_with_sms_norm.joblib` exists in project root; docker-compose copies `models/` into the backend image.
- For production, add TLS, authentication, and proper secrets management.
