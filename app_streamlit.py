import streamlit as st
import pandas as pd
import numpy as np
from joblib import load
from io import StringIO
import os

MODEL_PATH = os.path.join("models", "model_with_sms_norm.joblib")

@st.cache_resource
def load_model(path=MODEL_PATH):
    return load(path)

def predict_text(model, texts, threshold=0.5):
    try:
        probas = model.predict_proba(texts)[:, 1]
    except Exception:
        # if model doesn't support predict_proba
        preds = model.predict(texts)
        probas = np.array([1.0 if p == 'spam' else 0.0 for p in preds])
    labels = np.where(probas >= threshold, 'spam', 'ham')
    return labels, probas

def main():
    st.set_page_config(page_title="Spam Classifier — UI", layout="wide")
    st.title("Spam Email / SMS Classifier — Professional UI")
    st.markdown("A Streamlit interface for the trained spam classifier.\nUse single-text input or upload a CSV with a `text` column for batch predictions.")

    if not os.path.exists(MODEL_PATH):
        st.error(f"Model not found at {MODEL_PATH}. Train and save the model first.")
        return

    model = load_model()

    st.sidebar.header("Settings")
    threshold = st.sidebar.slider("Spam probability threshold", 0.0, 1.0, 0.686, 0.01)
    show_raw = st.sidebar.checkbox("Show raw probabilities", value=False)

    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("Single message")
        text_input = st.text_area("Enter message text", height=150)
        if st.button("Predict message"):
            if not text_input.strip():
                st.warning("Enter some text first")
            else:
                labels, probs = predict_text(model, [text_input], threshold=threshold)
                st.metric("Prediction", labels[0])
                st.write(f"Spam probability: {probs[0]:.3f}")
                if show_raw:
                    st.json({"probability": float(probs[0]), "label": labels[0]})

    with col2:
        st.subheader("Batch upload")
        uploaded = st.file_uploader("Upload CSV (must contain `text` column)", type=["csv"]) 
        if uploaded is not None:
            try:
                df = pd.read_csv(uploaded)
            except Exception as e:
                st.error(f"Failed to read CSV: {e}")
                df = None
            if df is not None:
                if 'text' not in df.columns:
                    st.error("CSV must contain a `text` column")
                else:
                    if st.button("Predict file"):
                        texts = df['text'].astype(str).tolist()
                        labels, probs = predict_text(model, texts, threshold=threshold)
                        df['pred_label'] = labels
                        df['pred_proba'] = probs
                        st.write(df.head(20))
                        csv = df.to_csv(index=False)
                        st.download_button("Download predictions CSV", data=csv, file_name="predictions.csv", mime="text/csv")

    st.markdown("---")
    st.subheader("Model info")
    try:
        info = getattr(model, 'named_steps', None)
        if info:
            st.write("Pipeline steps:")
            st.write(list(info.keys()))
            st.write("Classifier details:")
            clf = info.get('clf') or info.get('classifier')
            if clf is not None:
                st.write(type(clf))
                if hasattr(clf, 'get_params'):
                    st.json(clf.get_params())
    except Exception:
        st.write("No detailed model info available")

    st.caption("Interface created by automation — for production use add authentication, logging, and rate limiting.")

if __name__ == '__main__':
    main()
