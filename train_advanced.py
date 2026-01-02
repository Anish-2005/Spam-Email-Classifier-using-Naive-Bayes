"""Advanced training script for spam classifier.

This script accepts both `--inputs` (one or more CSVs) and `--data` (alias) to remain
backwards-compatible with older usage.
"""

import argparse
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from joblib import dump

from src.preprocess import lemmatize_text


def load_and_combine(paths):
    dfs = []
    for p in paths:
        df = pd.read_csv(p)
        if "subject" in df.columns and "text" in df.columns:
            df["text"] = df["subject"].fillna("") + " " + df["text"].fillna("")
        if "text" not in df.columns or "label" not in df.columns:
            raise ValueError(f"{p} must contain 'text' and 'label' columns")
        dfs.append(df[["text", "label"]])
    combined = pd.concat(dfs, ignore_index=True)
    return combined["text"].astype(str).tolist(), combined["label"].astype(str).tolist()


def build_pipeline(use_char=False, k_best=None, clf_name="logreg"):
    vect = TfidfVectorizer(preprocessor=lemmatize_text, stop_words="english",
                           ngram_range=(1, 2) if not use_char else (1, 3),
                           max_df=0.95, min_df=2, max_features=60000)
    steps = [("tfidf", vect)]
    if k_best:
        steps.append(("select", SelectKBest(chi2, k=k_best)))
    if clf_name == "logreg":
        clf = LogisticRegression(max_iter=2000, solver="saga", class_weight="balanced")
    else:
        clf = ComplementNB()
    steps.append(("clf", clf))
    return Pipeline(steps)


def main():
    parser = argparse.ArgumentParser(description="Advanced training with char n-grams, selection, calibration")
    parser.add_argument("--inputs", nargs="+", default=["data/large_emails.csv", "data/sms_spam.csv"], help="CSV files to combine for training")
    parser.add_argument("--data", nargs="*", help="Alias for --inputs (single path or list)")
    parser.add_argument("--output", default="models/model_advanced_final.joblib")
    parser.add_argument("--cv", type=int, default=3)
    args = parser.parse_args()

    # allow --data as alias to --inputs
    inputs = args.inputs
    if args.data:
        inputs = args.data

    texts, labels = load_and_combine(inputs)
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)

    # moderate grid: try with/without char n-grams, a couple of k values, and two classifiers
    param_grid = [
        {
            "use_char": [False],
            "k_best": [None, 5000, 10000],
            "clf_name": ["logreg"],
        },
        {
            "use_char": [True],
            "k_best": [None, 5000],
            "clf_name": ["logreg", "cnb"],
        },
    ]

    candidates = []
    for spec in param_grid:
        for use_char in spec["use_char"]:
            for k in spec["k_best"]:
                for clf_name in spec["clf_name"]:
                    candidates.append((use_char, k, clf_name))

    best_model = None
    best_score = -1

    for use_char, k, clf_name in candidates:
        print(f"Training candidate: use_char={use_char} k_best={k} clf={clf_name}")
        pipeline = build_pipeline(use_char=use_char, k_best=k, clf_name=clf_name)
        if clf_name == "logreg":
            param_grid_clf = {"clf__C": [0.1, 1.0, 5.0]}
        else:
            param_grid_clf = {"clf__alpha": [0.01, 0.1, 0.5]}

        gs = GridSearchCV(pipeline, param_grid_clf, cv=args.cv, scoring="f1_macro", n_jobs=-1)
        gs.fit(X_train, y_train)
        print(f"  best cv f1_macro: {gs.best_score_:.3f}, params: {gs.best_params_}")

        final = gs.best_estimator_
        if clf_name == "logreg":
            try:
                final = CalibratedClassifierCV(final, cv="prefit")
                final.fit(X_train, y_train)
            except Exception:
                final = gs.best_estimator_

        score = gs.best_score_
        if score > best_score:
            best_score = score
            best_model = final

    preds = best_model.predict(X_test)
    probas = None
    try:
        probas = best_model.predict_proba(X_test)[:, 1]
    except Exception:
        pass

    print("\nBest model test evaluation:\n")
    print(classification_report(y_test, preds))
    print("Confusion matrix:\n", confusion_matrix(y_test, preds))

    if probas is not None:
        precision, recall, thresholds = precision_recall_curve([1 if y=="spam" else 0 for y in y_test], probas)
        f1_scores = 2 * (precision * recall) / (precision + recall + 1e-12)
        best_idx = np.argmax(f1_scores)
        best_threshold = thresholds[best_idx] if best_idx < len(thresholds) else 0.5
        print(f"Best threshold by F1 on test: {best_threshold:.3f}")

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    dump(best_model, args.output)
    print(f"Saved final model to {args.output}")


if __name__ == "__main__":
    main()
