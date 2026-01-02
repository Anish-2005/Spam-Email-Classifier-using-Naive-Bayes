#!/usr/bin/env python3
"""
Export scikit-learn TfidfVectorizer + NaiveBayes model parameters to JSON
so the Next.js app can load the model in JavaScript.

Usage:
  python backend/scripts/export_model_json.py \
      --model backend/models/model_with_sms_norm.joblib \
      --out frontend/public/model/model.json

This script finds the TfidfVectorizer and the classifier inside the
joblib'd object (supports Pipeline with named_steps) and writes a JSON
containing: vocabulary, idf, feature_log_prob, class_log_prior, classes.
"""
import argparse
import json
from pathlib import Path

from joblib import load


def find_vectorizer_and_clf(obj):
    # If it's a Pipeline-ish object with named_steps
    vect = None
    clf = None
    if hasattr(obj, "named_steps"):
        for name, step in obj.named_steps.items():
            clsname = step.__class__.__name__.lower()
            if "tfidf" in clsname or "vector" in clsname:
                vect = step
            if "nb" in clsname or "classifier" in clsname or "complement" in clsname:
                clf = step
    else:
        # Maybe a tuple (vect, clf) or similar
        try:
            maybe_vect, maybe_clf = obj
            vect = maybe_vect
            clf = maybe_clf
        except Exception:
            pass
    return vect, clf


def export(model_path, out_path):
    obj = load(model_path)
    vect, clf = find_vectorizer_and_clf(obj)
    if vect is None or clf is None:
        raise RuntimeError("Could not find vectorizer and classifier in model. Inspect the joblib object.")

    vocab = getattr(vect, "vocabulary_", None)
    idf = getattr(vect, "idf_", None)
    feature_log_prob = getattr(clf, "feature_log_prob_", None)
    class_log_prior = getattr(clf, "class_log_prior_", None)
    classes = getattr(clf, "classes_", None)

    if vocab is None or idf is None or feature_log_prob is None:
        raise RuntimeError("Missing expected attributes on vectorizer/classifier (vocabulary_, idf_, feature_log_prob_)")

    # Convert vocabulary indices (which may be numpy.int64) to plain ints
    vocab_py = {str(k): int(v) for k, v in vocab.items()}

    data = {
        "vocabulary": vocab_py,
        "idf": list(map(float, idf.tolist())) if hasattr(idf, "tolist") else list(map(float, idf)),
        "feature_log_prob": [list(map(float, row.tolist())) for row in feature_log_prob],
        "class_log_prior": list(map(float, class_log_prior.tolist())) if hasattr(class_log_prior, "tolist") else list(map(float, class_log_prior)),
        "classes": [str(c) for c in classes.tolist()] if hasattr(classes, "tolist") else [str(c) for c in classes],
    }

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"Exported model JSON to: {out_path}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    export(args.model, args.out)


if __name__ == "__main__":
    main()
