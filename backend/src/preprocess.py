import re
from typing import List

import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from nltk.corpus import stopwords

_nltk_ready = False


def ensure_nltk():
    global _nltk_ready
    if _nltk_ready:
        return
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
    # lightweight tokenizer: split on word boundaries to avoid heavy NLTK tokenizers
    return re.findall(r"\b[a-z0-9]+\b", text.lower())


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


def tokenize_and_lemmatize(text: str) -> List[str]:
    """Return a list of lemmatized tokens with English stopwords removed.

    This is suitable to pass as `tokenizer` to sklearn vectorizers so that
    stopword removal happens consistently with the tokenization/lemmatization.
    """
    ensure_nltk()
    lemmatizer = WordNetLemmatizer()
    sw = set(stopwords.words("english"))
    tokens = simple_tokenize(simple_clean(text))
    lemmas = [lemmatizer.lemmatize(t) for t in tokens]
    return [l for l in lemmas if l not in sw]
