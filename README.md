# Spam Email Classifier — Naive Bayes

Simple, fast spam detection with a Naive Bayes pipeline (scikit-learn).

This repository implements data preparation, training, evaluation, and multiple prediction interfaces (CLI, batch, and a Streamlit demo). It includes utilities to generate toy datasets, several training entry points, and deployment-ready artifacts (models and a simple frontend/backend demo).

---

## Highlights

- Lightweight Naive Bayes classifier with text preprocessing and feature pipeline.
- Train locally on CSV datasets, evaluate, and save reusable models to `models/`.
- Multiple ways to predict: `predict.py` (interactive/CLI), `predict_batch.py` (CSV batch), and `app_streamlit.py` (web UI).
- Example frontend in `frontend/` and a legacy backend in `archive/backend/` for reference.

---

## Quickstart (Windows / cross-platform)

1. Create and activate a virtual environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # PowerShell
# or on cmd: .\.venv\Scripts\activate.bat
# or on mac/linux: source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Train a quick demo model on the sample dataset:

```bash
python train.py --data data/sample_emails.csv --output models/model.joblib
```

4. Run an interactive prediction demo using the saved model:

```bash
python predict.py --model models/model.joblib
```

5. Launch the Streamlit demo UI (web):

```bash
python -m streamlit run app_streamlit.py
```

6. (Optional) Start the frontend + backend with Docker Compose:

```bash
docker-compose up --build
```

---

## Files & Structure (quick tour)

- `train.py` — lightweight trainer for quick experiments.
- `train_full.py`, `train_advanced.py`, `train_improved.py` — extended training/evaluation pipelines (grid search, metrics, improved preprocessing).
- `predict.py` — single-text prediction CLI/demo.
- `predict_batch.py` — batch predictions: CSV in → CSV out.
- `app_streamlit.py` — Streamlit-based demo UI for manual testing.
- `generate_dataset.py`, `fetch_dataset.py`, `fetch_hf_sms.py` — dataset generation & fetching utilities.
- `models/` — pre-trained model artifacts (joblib files).
- `data/` — example datasets: `sample_emails.csv`, `large_emails.csv`, `sms_spam.csv`.
- `frontend/` — Next.js demo frontend and instructions.
- `archive/backend/` — legacy Flask backend and helper scripts.
- `src/` and `archive/backend/src/` — core classifier and preprocessing implementations (look for `nb_classifier.py` and `preprocess.py`).

---

## Usage Examples

- Train using a larger dataset:

```bash
python train_full.py --data data/large_emails.csv --output models/model_advanced.joblib
```

- Train with hyperparameter search:

```bash
python train_full.py --data data/large_emails.csv --grid
```

- Batch predict with a saved model:

```bash
python predict_batch.py --model models/model_advanced.joblib --input data/large_emails.csv --output predictions.csv
```

- Quick single-text predict (reads from stdin or prompts):

```bash
python predict.py --model models/model.joblib --text "Congratulations, you won a prize!"
```

---

## Notes on Models & Zero-Downtime Changes

- Models are saved as joblib files under `models/` (examples: `model.joblib`, `model_advanced.joblib`, `model_advanced_final.joblib`).
- If you update schema or preprocessing steps, retrain the model — saved joblib artifacts are tied to the preprocessing pipeline used during training.

---

## Deployment

- Quick local demo: `python -m streamlit run app_streamlit.py`.
- Docker: `docker-compose.yml` exists to build the demo stack (frontend + optional backend). See `frontend/` and `archive/backend/` for Dockerfiles and deployment notes.

---

## Tips & Next Steps

- Replace `data/sample_emails.csv` with a labeled dataset of your own (`text,label`).
- Improve feature engineering (e.g., n-grams, TF-IDF tuning) or try other classifiers for higher accuracy.
- Add unit tests around `src/nb_classifier.py` and `src/preprocess.py` to lock behavior.

---

## Contributing

PRs are welcome. Please open an issue if you plan larger changes so we can coordinate.

---

## License & Contact

This repo is provided as-is. For questions or help, open an issue or contact the maintainer.

