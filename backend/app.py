from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load
from typing import List
import os
import logging
from dotenv import load_dotenv

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


class TextIn(BaseModel):
    text: str


class BatchIn(BaseModel):
    texts: List[str]


model = None
model_loaded = False


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
    except Exception:
        pred = m.predict(text)[0]
        proba = 1.0 if str(pred).lower() == 'spam' else 0.0
    label = 'spam' if proba >= 0.5 else 'ham'
    return {"label": label, "probability": float(proba)}


@app.post("/predict_batch")
def predict_batch(item: BatchIn):
    ensure_model()
    m = model
    texts = item.texts
    try:
        probas = m.predict_proba(texts)[:, 1].tolist()
    except Exception:
        preds = m.predict(texts)
        probas = [1.0 if str(p).lower() == 'spam' else 0.0 for p in preds]
    labels = ['spam' if p >= 0.5 else 'ham' for p in probas]
    return {"predictions": [ {"text": t, "label": l, "probability": float(p)} for t, l, p in zip(texts, labels, probas) ]}
