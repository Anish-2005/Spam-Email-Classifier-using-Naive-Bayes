Model JSON for JavaScript runtime

This project ships a Next.js API route at `pages/api/predict.ts` which
expects a pre-exported model JSON at `public/model/model.json`.

To produce this JSON from the existing scikit-learn joblib model, run:

```bash
python backend/scripts/export_model_json.py \
  --model backend/models/model_with_sms_norm.joblib \
  --out frontend/public/model/model.json
```

Make sure you have `joblib` and `scikit-learn` installed in the Python
environment when running the exporter. After the model JSON is created,
`/api/predict` will load it and perform TF-IDF + NB scoring entirely in
JavaScript (no Python backend required).

Development flow

1. Run the exporter (one-time) to write `frontend/public/model/model.json`.
2. Start Next.js dev server from `frontend`:

```bash
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000 and run predictions locally.

Notes

- The JS predictor implements a compatible TF-IDF transform (counts * idf + L2
  normalization) and applies the classifier using the exported
  `feature_log_prob` and `class_log_prior` arrays. Results should be close
  but may differ slightly from Python due to tokenization/lemmatization
  differences.
- If you prefer a hosted Python backend, continue using the existing
  FastAPI backend instead and skip the exporter.
