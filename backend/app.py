from fastapi import FastAPI
from pydantic import BaseModel
from joblib import load
from typing import List
import os

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'model_with_sms_norm.joblib')
if not os.path.exists(MODEL_PATH):
    # fallback to workspace models path
    MODEL_PATH = os.path.join('models', 'model_with_sms_norm.joblib')

app = FastAPI(title="Spam Classifier API")

class TextIn(BaseModel):
    text: str

class BatchIn(BaseModel):
    texts: List[str]

model = None


def get_model():
    global model
    if model is None:
        model = load(MODEL_PATH)
    return model


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(item: TextIn):
    m = get_model()
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
    m = get_model()
    texts = item.texts
    try:
        probas = m.predict_proba(texts)[:, 1].tolist()
    except Exception:
        preds = m.predict(texts)
        probas = [1.0 if str(p).lower() == 'spam' else 0.0 for p in preds]
    labels = ['spam' if p >= 0.5 else 'ham' for p in probas]
    return {"predictions": [ {"text": t, "label": l, "probability": float(p)} for t, l, p in zip(texts, labels, probas) ]}
