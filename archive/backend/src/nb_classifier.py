from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from joblib import dump, load


class SpamClassifier:
    """Simple wrapper around a sklearn pipeline for spam classification."""

    def __init__(self):
        self.pipeline = Pipeline([
            ("vect", CountVectorizer()),
            ("tfidf", TfidfTransformer()),
            ("clf", MultinomialNB()),
        ])

    def train(self, texts, labels):
        """Train the pipeline on lists/arrays of texts and labels."""
        self.pipeline.fit(texts, labels)

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
