from joblib import load
import os

MODEL_PATH = os.path.join('models', 'model_with_sms_norm.joblib')

def main():
    if not os.path.exists(MODEL_PATH):
        print('Model not found:', MODEL_PATH)
        return
    m = load(MODEL_PATH)
    print('Loaded model type:', type(m))
    try:
        steps = getattr(m, 'named_steps', None)
        if steps:
            print('Pipeline steps:', list(steps.keys()))
    except Exception:
        pass

if __name__ == '__main__':
    main()
