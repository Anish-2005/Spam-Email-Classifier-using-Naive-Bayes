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

Additional tools

- `generate_dataset.py`: create a larger structured dataset at `data/large_emails.csv` with columns `id,subject,text,label`.
- `train_full.py`: train an optimized model with evaluation and optional grid search. Produces `models/model_advanced.joblib`.
- `predict_batch.py`: batch prediction CLI that reads a CSV and writes predicted labels.

Examples

Generate a larger dataset (2000 samples):

```bash
python generate_dataset.py --output data/large_emails.csv --n 2000
```

Train the advanced model and evaluate (fast mode):

```bash
python train_full.py --data data/large_emails.csv --output models/model_advanced.joblib
```

Train with hyperparameter search (slower):

```bash
python train_full.py --data data/large_emails.csv --grid
```

Batch predict:

```bash
python predict_batch.py --model models/model_advanced.joblib --input data/large_emails.csv --output predictions.csv
```

Next steps

- Replace `data/sample_emails.csv` with your real labeled dataset (columns `text,label`).
- Improve preprocessing, feature extraction, and hyperparameters.
