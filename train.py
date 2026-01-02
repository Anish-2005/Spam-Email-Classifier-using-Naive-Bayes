import argparse
import os
import pandas as pd

from src.nb_classifier import SpamClassifier


def load_data(path):
    df = pd.read_csv(path)
    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError("CSV must contain 'text' and 'label' columns")
    return df["text"].astype(str).tolist(), df["label"].astype(str).tolist()


def main():
    parser = argparse.ArgumentParser(description="Train a Naive Bayes spam classifier")
    parser.add_argument("--data", default="data/sample_emails.csv", help="Path to CSV dataset")
    parser.add_argument("--output", default="models/model.joblib", help="Where to save the trained model")
    args = parser.parse_args()

    texts, labels = load_data(args.data)
    clf = SpamClassifier()
    clf.train(texts, labels)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    clf.save(args.output)
    print(f"Model trained and saved to {args.output}")


if __name__ == "__main__":
    main()
