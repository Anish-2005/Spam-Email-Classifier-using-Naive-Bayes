import re
from typing import List

import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

_nltk_ready = False


def ensure_nltk():
    global _nltk_ready
    if _nltk_ready:
        return
    try:
        nltk.data.find("tokenizers/punkt")
    except Exception:
        nltk.download("punkt")
    try:
        nltk.data.find("corpora/wordnet")
    except Exception:
        nltk.download("wordnet")
    try:
        nltk.data.find("corpora/omw-1.4")
    except Exception:
        nltk.download("omw-1.4")
    _nltk_ready = True


def simple_tokenize(text: str) -> List[str]:
    ensure_nltk()
    from nltk.tokenize import word_tokenize

    tokens = word_tokenize(text)
    return tokens


def simple_clean(text: str) -> str:
    # Lower, remove URLs and non-alphanumerics
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def lemmatize_text(text: str) -> str:
    ensure_nltk()
    lemmatizer = WordNetLemmatizer()
    tokens = simple_tokenize(simple_clean(text))
    lemmas = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(lemmas)
