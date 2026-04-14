import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression

# Placeholder synthetic data. Replace with real phishing dataset features for production training.
X = np.array(
    [
        [2.1, 3, 4.0, 0, 0, 1, 30],
        [3.5, 6, 5.5, 2, 1, 0, 120],
        [4.2, 10, 4.9, 4, 1, 0, 190],
        [2.4, 4, 5.0, 1, 0, 1, 60],
        [3.8, 7, 4.7, 3, 0, 0, 145],
        [2.3, 4, 4.2, 0, 0, 1, 45],
    ]
)
y = np.array([0, 1, 1, 0, 1, 0])

model = LogisticRegression(max_iter=200)
model.fit(X, y)

feature_names = [
    "entropy",
    "tokenCount",
    "avgTokenLength",
    "subdomainCount",
    "hasIpAddress",
    "https",
    "urlLength",
]
weights = {name: float(weight) for name, weight in zip(feature_names, model.coef_[0])}

output = {
    "version": "sklearn-logreg-v1",
    "bias": float(model.intercept_[0]),
    "weights": weights,
}

output_path = Path(__file__).parent / "model.json"
output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
print(f"Model written to {output_path}")
