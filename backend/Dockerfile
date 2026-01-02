FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	&& rm -rf /var/lib/apt/lists/*

COPY . .

# Install numpy and cython first to satisfy build-time dependencies for packages
# that need the numpy C headers (helps avoid Cython/compile failures).
RUN pip install --no-cache-dir "numpy==1.26.4" "Cython==0.29.36"

# Install requirements from backend directory
RUN pip install --no-cache-dir -r backend/requirements.txt

# Ensure start script is executable if present
RUN if [ -f ./backend/start.sh ]; then chmod +x ./backend/start.sh; fi

EXPOSE 8000

# Ensure curl is available for optional model download at startup
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Entrypoint handles optional model download (via MODEL_URL) then starts gunicorn
# Use backend/start.sh if present, else fallback to gunicorn directly
ENTRYPOINT ["/bin/sh", "-c", "if [ -f ./backend/start.sh ]; then exec ./backend/start.sh; else exec gunicorn -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:${PORT:-8000} --workers ${WORKERS:-4} --timeout ${TIMEOUT:-120}; fi"]
