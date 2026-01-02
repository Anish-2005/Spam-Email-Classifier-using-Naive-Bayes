from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from joblib import load
from typing import List
import os
import logging
from dotenv import load_dotenv
import traceback

load_dotenv()

import sys
# Ensure repo root is on sys.path so custom `src` package is importable
# This allows joblib/pickle to find classes defined under `src.*` when loading models
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

logger = logging.getLogger("spam_classifier")
logging.basicConfig(level=logging.INFO)

# Model path can be overridden via environment variable for deployments
DEFAULT_MODEL = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'model_with_sms_norm.joblib')
MODEL_PATH = os.environ.get('MODEL_PATH', DEFAULT_MODEL)
if not os.path.exists(MODEL_PATH):
    # fallback to workspace models path
    alt = os.path.join('models', 'model_with_sms_norm.joblib')
    if os.path.exists(alt):
        MODEL_PATH = alt

ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*')

app = FastAPI(title="Spam Classifier API")

# Allow CORS for frontend deployments (set ALLOWED_ORIGINS in env)
if ALLOWED_ORIGINS == '*' or ALLOWED_ORIGINS.strip() == '':
    origins = ["*"]
else:
    origins = [o.strip() for o in ALLOWED_ORIGINS.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend export if present in backend/static
# Mount under /static so FastAPI docs (/docs) remain available.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    # Mount the top-level static dir at /static
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    # Also mount Next.js asset directory at /_next so exported pages reference assets correctly
    next_dir = os.path.join(STATIC_DIR, "_next")
    if os.path.isdir(next_dir):
        app.mount("/_next", StaticFiles(directory=next_dir), name="next_static")
    logger.info(f"Serving frontend static files from: {STATIC_DIR} at /static and /_next")


@app.get("/")
def serve_frontend_index():
    """Serve frontend index.html from backend/static if present, otherwise return a tiny message."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path, media_type='text/html')
    return {"status": "spam classifier API", "docs": "/docs", "openapi": "/openapi.json"}


class TextIn(BaseModel):
    text: str


class BatchIn(BaseModel):
    texts: List[str]


model = None
model_loaded = False
last_prediction_exception: str | None = None


def load_model(path: str):
    logger.info(f"Loading model from: {path}")
    m = load(path)
    logger.info("Model loaded successfully")
    return m


@app.on_event("startup")
def startup_event():
    global model, model_loaded
    try:
        # Ensure NLTK corpora are present before loading models that may call them
        try:
            from src import preprocess as _pre
            try:
                _pre.ensure_nltk()
            except Exception:
                logger.warning("Failed to ensure NLTK corpora; continuing and hoping model doesn't require them at load time.")
        except Exception:
            # src.preprocess may not be importable in some environments; proceed to load model and surface errors
            logger.debug("Could not import src.preprocess to prefetch NLTK data")
        if os.path.exists(MODEL_PATH):
            model = load_model(MODEL_PATH)
            model_loaded = True
        else:
            logger.warning(f"Model path does not exist: {MODEL_PATH}")
    except Exception as e:
        logger.exception("Failed to load model on startup: %s", e)
        model_loaded = False


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def ready():
    if not model_loaded:
        raise HTTPException(status_code=503, detail="model_not_loaded")
    return {"status": "ready", "model_path": MODEL_PATH}


def ensure_model():
    if not model_loaded or model is None:
        raise HTTPException(status_code=503, detail="model_not_loaded")


@app.post("/predict")
def predict(item: TextIn):
    ensure_model()
    m = model
    text = [item.text]
    try:
        proba = m.predict_proba(text)[:, 1][0]
    except Exception as e:
        # store traceback for short-term debugging and log
        tb = traceback.format_exc()
        global last_prediction_exception
        last_prediction_exception = tb
        logger.exception("predict_proba failed: %s", e)
        try:
            pred = m.predict(text)[0]
            proba = 1.0 if str(pred).lower() == 'spam' else 0.0
        except Exception as e2:
            tb2 = traceback.format_exc()
            last_prediction_exception = (last_prediction_exception or "") + "\n" + tb2
            logger.exception("predict failed: %s", e2)
            raise HTTPException(status_code=500, detail="model_prediction_failed")
    label = 'spam' if proba >= 0.5 else 'ham'
    return {"label": label, "probability": float(proba)}


@app.post("/predict_batch")
def predict_batch(item: BatchIn):
    ensure_model()
    m = model
    texts = item.texts
    try:
        probas = m.predict_proba(texts)[:, 1].tolist()
    except Exception as e:
        tb = traceback.format_exc()
        last_prediction_exception = tb
        logger.exception("predict_proba batch failed: %s", e)
        try:
            preds = m.predict(texts)
            probas = [1.0 if str(p).lower() == 'spam' else 0.0 for p in preds]
        except Exception as e2:
            tb2 = traceback.format_exc()
            last_prediction_exception = (last_prediction_exception or "") + "\n" + tb2
            logger.exception("predict batch failed: %s", e2)
            raise HTTPException(status_code=500, detail="model_prediction_failed")
    labels = ['spam' if p >= 0.5 else 'ham' for p in probas]
    return {"predictions": [ {"text": t, "label": l, "probability": float(p)} for t, l, p in zip(texts, labels, probas) ]}


@app.get("/debug/last_exception")
def debug_last_exception():
    """Return the last stored prediction exception traceback when debugging is enabled.

    Enable by setting environment variable `DEBUG_API=1` on the service. This endpoint
    is intentionally guarded to avoid exposing internals in normal production.
    """
    if os.environ.get("DEBUG_API") != "1":
        raise HTTPException(status_code=403, detail="debug_disabled")
    return {"last_exception": last_prediction_exception}
