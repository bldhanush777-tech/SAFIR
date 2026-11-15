import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app

client = TestClient(app)

def test_get_habitat_rankings():
    response = client.get("/api/v1/habitats/rankings")
    assert response.status_code == 200
    rankings = response.json()
    assert len(rankings) > 0
    for r in rankings:
        assert "target_habitat" in r
        assert "relevance_score" in r
        assert "scoring_breakdown_json" in r
        assert "justification" in r

def test_recalculate_habitat_rankings():
    # Recalculate with heavy gravity weight
    payload = {
        "target_habitat": "Artemis Lunar Surface (0.16g)",
        "weight_atmospheric": 0.1,
        "weight_gravity": 0.7,
        "weight_material": 0.1,
        "weight_scale": 0.1
    }
    response = client.post("/api/v1/habitats/recalculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "rankings" in data
    assert data["target_habitat"]["name"] == "Artemis Lunar Surface (0.16g)"
    assert len(data["rankings"]) >= 10
