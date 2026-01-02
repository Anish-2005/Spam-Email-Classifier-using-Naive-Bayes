import csv
import random
import uuid
from pathlib import Path

SUBJECT_SPAM = [
    "You won a prize!",
    "Lowest price on meds",
    "Exclusive offer just for you",
    "Claim your free gift now",
    "Act now to secure your loan",
]

BODY_SPAM = [
    "Congratulations, you've been selected to receive a $1000 gift card. Click the link to claim.",
    "No prescription required, buy meds at the lowest price online.",
    "Reply with your bank details to secure your prize.",
    "Limited time offer — buy one get one free. Visit our website now.",
    "Urgent: update your account information to avoid suspension.",
]

SUBJECT_HAM = [
    "Meeting tomorrow",
    "Project update",
    "Lunch plans",
    "Invoice attached",
    "Report review",
]

BODY_HAM = [
    "Can we reschedule the meeting to next week?",
    "Please find the attached report and let me know your thoughts.",
    "Are we still on for lunch today at 1pm?",
    "I've pushed the latest changes to the repo; please review when you have time.",
    "Thanks for your help on the presentation — looks great.",
]


def generate(path: str, n: int = 2000, spam_ratio: float = 0.4, ambiguous_rate: float = 0.15):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "subject", "text", "label"])
        for i in range(n):
            is_spam = random.random() < spam_ratio
            # Create ambiguous examples by mixing spam/ham parts for some samples
            if random.random() < ambiguous_rate:
                # ambiguous: mix subject and body from different classes
                subject = random.choice(SUBJECT_SPAM if not is_spam else SUBJECT_HAM)
                body = random.choice(BODY_HAM if is_spam else BODY_SPAM)
                label = "spam" if is_spam else "ham"
            else:
                if is_spam:
                    subject = random.choice(SUBJECT_SPAM)
                    body = random.choice(BODY_SPAM)
                    label = "spam"
                else:
                    subject = random.choice(SUBJECT_HAM)
                    body = random.choice(BODY_HAM)
                    label = "ham"

            # small variation and noise
            body = body + " " + random.choice(["", "Please respond.", "Thanks!", "FYI."])
            # inject occasional benign words into spam and vice versa
            if random.random() < 0.05:
                body = body + " " + random.choice(["schedule", "meeting", "invoice", "report"]) 
            if random.random() < 0.03:
                body = body + " " + random.choice(["free", "offer", "click", "win"]) 

            writer.writerow([str(uuid.uuid4()), subject, body, label])


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate synthetic email dataset")
    parser.add_argument("--output", default="data/large_emails.csv")
    parser.add_argument("--n", type=int, default=2000)
    parser.add_argument("--spam_ratio", type=float, default=0.4)
    parser.add_argument("--ambiguous_rate", type=float, default=0.15, help="Fraction of samples that are ambiguous/mixed")
    args = parser.parse_args()
    generate(args.output, args.n, args.spam_ratio, args.ambiguous_rate)
    print(f"Generated {args.n} samples to {args.output} (ambiguous_rate={args.ambiguous_rate})")
