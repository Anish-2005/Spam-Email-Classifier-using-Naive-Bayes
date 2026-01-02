import re
from sklearn.feature_extraction.text import TfidfVectorizer, HashingVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
from joblib import dump, load


def simple_clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class AdvancedSpamClassifier:
    """Higher-quality pipeline for spam classification with tuning helpers."""

    def __init__(self, use_hashing: bool = False, stop_words: str = "english", ngram_range=(1, 1), min_df: int = 3, max_df: float = 0.9, max_features: int = 50000, sublinear_tf: bool = True):
        """Create a pipeline with safer defaults to reduce overfitting.

        Parameters intentionally favor simpler features (unigrams), stopword removal,
        and higher min_df to avoid memorizing rare tokens from synthetic data.
        """
        if use_hashing:
            vect = HashingVectorizer(decode_error="ignore", n_features=2 ** 18, alternate_sign=False)
            # when hashing, no inverse transform; TfidfTransformer would be used separately if needed
            self.pipeline = Pipeline([
                ("vect", vect),
                ("clf", MultinomialNB()),
            ])
        else:
            vect = TfidfVectorizer(preprocessor=simple_clean, stop_words=stop_words, ngram_range=ngram_range, max_df=max_df, min_df=min_df, max_features=max_features, sublinear_tf=sublinear_tf)
            self.pipeline = Pipeline([
                ("tfidf", vect),
                ("clf", MultinomialNB()),
            ])

    def train(self, texts, labels):
        self.pipeline.fit(texts, labels)

    def grid_search(self, texts, labels, param_grid=None, cv=3, n_jobs=1):
        if param_grid is None:
            param_grid = {
                "tfidf__ngram_range": [(1, 1), (1, 2)],
                "tfidf__max_df": [0.85, 0.95],
                "clf__alpha": [0.1, 0.5, 1.0],
            }
        gs = GridSearchCV(self.pipeline, param_grid=param_grid, cv=cv, n_jobs=n_jobs, scoring="f1_macro")
        gs.fit(texts, labels)
        self.pipeline = gs.best_estimator_
        return gs

    def partial_train(self, text_batches, label_batches, classes=None):
        # For streaming training use HashingVectorizer + MultinomialNB with partial_fit
        from sklearn.feature_extraction.text import HashingVectorizer

        hv = HashingVectorizer(decode_error="ignore", n_features=2 ** 18, alternate_sign=False)
        clf = MultinomialNB()
        first = True
        for texts, labels in zip(text_batches, label_batches):
            X = hv.transform([simple_clean(t) for t in texts])
            if first:
                if classes is None:
                    classes = list(set(labels))
                clf.partial_fit(X, labels, classes=classes)
                first = False
            else:
                clf.partial_fit(X, labels)
        self.pipeline = Pipeline([("vect", hv), ("clf", clf)])

    def predict(self, texts):
        return self.pipeline.predict(texts)

    def predict_proba(self, texts):
        if hasattr(self.pipeline, "predict_proba"):
            return self.pipeline.predict_proba(texts)
        return None

    def save(self, path):
        dump(self.pipeline, path)

    @classmethod
    def load(cls, path):
        pipeline = load(path)
        inst = cls.__new__(cls)
        inst.pipeline = pipeline
        return inst
