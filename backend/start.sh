#!/bin/sh
set -e

# Ensure MODEL_PATH default
: ${MODEL_PATH:=./models/model_with_sms_norm.joblib}

echo "Using MODEL_PATH=${MODEL_PATH}"

if [ ! -f "${MODEL_PATH}" ]; then
  if [ -n "${MODEL_URL}" ]; then
    echo "Model not found locally; downloading from MODEL_URL=${MODEL_URL}"
    mkdir -p "$(dirname "${MODEL_PATH}")"
    # try curl or wget
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL "${MODEL_URL}" -o "${MODEL_PATH}"
    elif command -v wget >/dev/null 2>&1; then
      wget -q "${MODEL_URL}" -O "${MODEL_PATH}"
    else
      echo "Neither curl nor wget available to download model" >&2
      exit 1
    fi
    echo "Downloaded model to ${MODEL_PATH}"
  else
    echo "Model not found at ${MODEL_PATH} and MODEL_URL not provided. The service may not be ready." >&2
  fi
fi

echo "Starting gunicorn..."
exec gunicorn -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:${PORT:-8000} --workers ${WORKERS:-4} --timeout ${TIMEOUT:-120}
