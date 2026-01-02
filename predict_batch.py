import argparse
import csv
from src.nb_classifier_adv import AdvancedSpamClassifier


def main():
    parser = argparse.ArgumentParser(description="Batch predict labels for CSV with subject/text columns")
    parser.add_argument("--model", default="models/model_advanced.joblib")
    parser.add_argument("--input", required=True, help="Input CSV path with 'text' or 'subject'+'text' columns")
    parser.add_argument("--output", default="predictions.csv")
    args = parser.parse_args()

    clf = AdvancedSpamClassifier.load(args.model)

    import pandas as pd
    df = pd.read_csv(args.input)
    if "subject" in df.columns and "text" in df.columns:
        texts = (df["subject"].fillna("") + " " + df["text"].fillna("")).astype(str).tolist()
    elif "text" in df.columns:
        texts = df["text"].astype(str).tolist()
    else:
        raise ValueError("Input CSV must contain 'text' or ('subject' and 'text') columns")

    preds = clf.predict(texts)
    df["predicted_label"] = preds
    df.to_csv(args.output, index=False)
    print(f"Wrote predictions to {args.output}")


if __name__ == "__main__":
    main()
