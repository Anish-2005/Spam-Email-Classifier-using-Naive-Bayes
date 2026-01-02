import argparse

from src.nb_classifier import SpamClassifier


def main():
    parser = argparse.ArgumentParser(description="Load saved model and predict text labels")
    parser.add_argument("--model", default="models/model.joblib", help="Path to saved model")
    parser.add_argument("--text", help="Text to classify; if omitted, runs a small demo")
    args = parser.parse_args()

    clf = SpamClassifier.load(args.model)

    if args.text:
        texts = [args.text]
    else:
        texts = [
            "Congratulations, you won a free prize! Click here to claim.",
            "Hey, are we still meeting for lunch tomorrow?",
        ]

    preds = clf.predict(texts)
    for t, p in zip(texts, preds):
        print(f"{p}\t{t}")


if __name__ == "__main__":
    main()
