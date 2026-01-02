import argparse
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

from src.nb_classifier_adv import AdvancedSpamClassifier


def load_structured(path):
    df = pd.read_csv(path)
    # support columns: id, subject, text, label OR text,label
    if "text" in df.columns and "label" in df.columns:
        if "subject" in df.columns:
            texts = (df["subject"].fillna("") + " " + df["text"].fillna("")).astype(str).tolist()
        else:
            texts = df["text"].astype(str).tolist()
        labels = df["label"].astype(str).tolist()
        return texts, labels
    else:
        raise ValueError("CSV must contain at least 'text' and 'label' columns")


def main():
    parser = argparse.ArgumentParser(description="Train an optimized Naive Bayes spam classifier")
    parser.add_argument("--data", default="data/large_emails.csv")
    parser.add_argument("--output", default="models/model_advanced.joblib")
    parser.add_argument("--grid", action="store_true", help="Run GridSearchCV for hyperparameters")
    args = parser.parse_args()

    texts, labels = load_structured(args.data)
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)

    # initialize with safer defaults to reduce overfitting
    clf = AdvancedSpamClassifier(ngram_range=(1, 1), min_df=3, max_df=0.9, sublinear_tf=True)
    if args.grid:
        print("Running grid search (this may take a while)...")
        # smaller grid to keep run time reasonable
        param_grid = {
            "tfidf__ngram_range": [(1, 1), (1, 2)],
            "clf__alpha": [0.01, 0.1, 0.5, 1.0],
        }
        gs = clf.grid_search(X_train, y_train, param_grid=param_grid, n_jobs=-1)
        print("Best params:", gs.best_params_)
    else:
        clf.train(X_train, y_train)

    preds = clf.predict(X_test)
    print("Classification report:\n", classification_report(y_test, preds))
    print("Confusion matrix:\n", confusion_matrix(y_test, preds))

    # cross-validation on training set to detect overfitting
    try:
        from sklearn.model_selection import cross_val_score

        cv_scores = cross_val_score(clf.pipeline, X_train, y_train, cv=3, scoring="f1_macro", n_jobs=-1)
        print(f"Cross-val F1-macro on train (3-fold): {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    except Exception:
        pass

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    clf.save(args.output)
    print(f"Saved trained model to {args.output}")


if __name__ == "__main__":
    main()
