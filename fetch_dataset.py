"""Download the SMS Spam Collection dataset and write a CSV with columns: id,text,label

Source: UCI ML repository
"""
import csv
import urllib.request
from pathlib import Path

URLS = [
    "https://archive.ics.uci.edu/ml/machine-learning-databases/00228/SMSSpamCollection",
    "https://raw.githubusercontent.com/justmarkham/pycon-2016-tutorial/master/SMSSpamCollection",
    "https://raw.githubusercontent.com/efsu/SMSSpamCollection/master/SMSSpamCollection",
]


def fetch(output="data/sms_spam.csv"):
    out = Path(output)
    out.parent.mkdir(parents=True, exist_ok=True)

    raw = None
    for url in URLS:
        try:
            with urllib.request.urlopen(url) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            print(f"Fetched dataset from {url}")
            break
        except Exception as e:
            print(f"Failed to fetch from {url}: {e}")
            continue

    if raw is None:
        raise RuntimeError("Failed to download dataset from known mirrors")

    lines = [l for l in raw.splitlines() if l.strip()]
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "text", "label"])
        for i, line in enumerate(lines):
            # format: label\tmessage
            if "\t" in line:
                label, text = line.split("\t", 1)
            else:
                parts = line.split(maxsplit=1)
                label = parts[0]
                text = parts[1] if len(parts) > 1 else ""
            writer.writerow([i, text, label])


if __name__ == "__main__":
    fetch()
    print("Fetched SMS Spam dataset to data/sms_spam.csv")
