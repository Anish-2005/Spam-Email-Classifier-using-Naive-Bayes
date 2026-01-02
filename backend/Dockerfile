FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	&& rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# copy model and app
COPY models ./models
COPY backend/app.py ./app.py
COPY backend/start.sh ./start.sh

RUN chmod +x ./start.sh

EXPOSE 8000

# Ensure curl is available for optional model download at startup
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Entrypoint handles optional model download (via MODEL_URL) then starts gunicorn
ENTRYPOINT ["./start.sh"]
