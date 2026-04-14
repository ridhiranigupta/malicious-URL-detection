import json
import math
import sys
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "model.json"


def sigmoid(value: float) -> float:
    return 1 / (1 + math.exp(-value))


def main() -> None:
    payload = json.loads(sys.argv[1])
    model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))

    score = model["bias"]
    for key, weight in model["weights"].items():
        score += float(payload.get(key, 0)) * float(weight)

    probability = max(0.001, min(0.999, sigmoid(score / 6.0)))

    impacts = [
        {
            "feature": key,
            "impact": float(payload.get(key, 0)) * float(weight),
        }
        for key, weight in model["weights"].items()
    ]
    impacts.sort(key=lambda item: abs(item["impact"]), reverse=True)

    response = {
        "mlProbability": round(probability, 3),
        "modelVersion": model.get("version", "unknown"),
        "factors": impacts[:4],
    }
    print(json.dumps(response))


if __name__ == "__main__":
    main()
