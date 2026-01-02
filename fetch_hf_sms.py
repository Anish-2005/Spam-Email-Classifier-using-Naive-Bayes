# Try loading SMS Spam datasets from Hugging Face `datasets` and save as CSV
from datasets import load_dataset
from pathlib import Path
import csv

candidates = [
    "sms_spam",
    "sms_spam_collection",
    "smsspamcollection",
    "sms",
    "mispell/sms_spam",  # some hubs
    "sms_spam/SMSSpamCollection",
]
out = Path("data/sms_spam.csv")
out.parent.mkdir(parents=True, exist_ok=True)

for name in candidates:
    try:
        ds = load_dataset(name)
        # dataset loaded; pick first split
        split = list(ds.keys())[0] if isinstance(ds, dict) else None
        if split:
            data = ds[split]
        else:
            data = ds
        # Expect columns like 'label' and 'text' or 'sms'
        rows = []
        for i, item in enumerate(data):
            # find text column
            text = None
            label = None
            for key in ["text", "message", "sms", "message_text", "body"]:
                if key in item:
                    text = item[key]
                    break
            if not text:
                # fallback: take first string field
                for k, v in item.items():
                    if isinstance(v, str) and len(v) > 0:
                        text = v
                        break
            for key in ["label", "labels", "target", "class"]:
                if key in item:
                    label = item[key]
                    break
            # normalize label to 'spam'/'ham' if possible
            if label is None:
                # try to infer from item if keys present
                if "spam" in item.values() or "ham" in item.values():
                    label = 'spam' if 'spam' in item.values() else 'ham'
            if text is None:
                continue
            rows.append((i, text, str(label) if label is not None else "ham"))
        if rows:
            with out.open('w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["id", "text", "label"])
                for r in rows:
                    writer.writerow(r)
            print(f"Saved dataset from {name} to {out}")
            break
    except Exception as e:
        print(f"Failed to load {name}: {e}")
else:
    print("No Hugging Face candidate succeeded.")
