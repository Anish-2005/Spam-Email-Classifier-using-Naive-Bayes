# Spam Email Classifier using Naive Bayes

Quickstart

1. Create a Python environment (recommended):

	- Python 3.8+

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Train a model on the sample data:

```bash
python train.py --data data/sample_emails.csv --output models/model.joblib
```

4. Run predictions (demo):

```bash
python predict.py --model models/model.joblib
```

Files

- `src/nb_classifier.py`: classifier wrapper using sklearn pipeline.
- `train.py`: trains and saves a model.
- `predict.py`: loads model and predicts labels for text.
- `data/sample_emails.csv`: small example dataset.
- `requirements.txt`: Python dependencies.

Next steps

- Replace `data/sample_emails.csv` with your real labeled dataset (columns `text,label`).
- Improve preprocessing, feature extraction, and hyperparameters.
