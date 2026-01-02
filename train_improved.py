import argparse
import os
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB, ComplementNB
from sklearn.linear_model import LogisticRegression
from joblib import dump

from src.preprocess import lemmatize_text


def load_structured(path):
    df = pd.read_csv(path)
    if "text" in df.columns and "label" in df.columns:
        if "subject" in df.columns:
            texts = (df["subject"].fillna("") + " " + df["text"].fillna("")).astype(str).tolist()
        else:
            texts = df["text"].astype(str).tolist()
        labels = df["label"].astype(str).tolist()
        return texts, labels
    else:
        raise ValueError("CSV must contain at least 'text' and 'label' columns")


def build_pipelines():
    # return dict of candidate pipelines
    pipelines = {}

    tfidf = TfidfVectorizer(preprocessor=lemmatize_text, stop_words="english", ngram_range=(1, 2), max_df=0.9, min_df=3, max_features=40000)

    pipelines["mnb"] = Pipeline([("tfidf", tfidf), ("clf", MultinomialNB())])
    pipelines["cnb"] = Pipeline([("tfidf", tfidf), ("clf", ComplementNB())])
    pipelines["logreg"] = Pipeline([("tfidf", tfidf), ("clf", LogisticRegression(max_iter=1000, solver="saga", class_weight="balanced"))])

    return pipelines


def main():
    parser = argparse.ArgumentParser(description="Train improved spam classifier and compare models")
    parser.add_argument("--data", default="data/large_emails.csv")
    parser.add_argument("--output", default="models/model_best.joblib")
    parser.add_argument("--cv", type=int, default=3)
    args = parser.parse_args()

    texts, labels = load_structured(args.data)
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)

    candidates = build_pipelines()

    best_model = None
    best_score = -1
    results = {}

    for name, pipeline in candidates.items():
        print(f"Training candidate: {name}")
        # small grid for each classifier
        if name == "mnb" or name == "cnb":
            param_grid = {"clf__alpha": [0.01, 0.1, 0.5]}
        else:
            param_grid = {"clf__C": [0.1, 1.0, 5.0]}

        gs = GridSearchCV(pipeline, param_grid, cv=args.cv, scoring="f1_macro", n_jobs=-1)
        gs.fit(X_train, y_train)
        score = gs.best_score_
        print(f"  best cv f1_macro: {score:.3f}, params: {gs.best_params_}")
        results[name] = (score, gs)
        if score > best_score:
            best_score = score
            best_model = gs.best_estimator_

    # Evaluate best model on test set
    preds = best_model.predict(X_test)
    print("\nBest model test evaluation:\n")
    print(classification_report(y_test, preds))
    print("Confusion matrix:\n", confusion_matrix(y_test, preds))

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    dump(best_model, args.output)
    print(f"Saved best model to {args.output}")


if __name__ == "__main__":
    main()
