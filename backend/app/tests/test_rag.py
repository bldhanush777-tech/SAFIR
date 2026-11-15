import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app

client = TestClient(app)

def test_rag_assistant_verified_query():
    # Query matching indexed Saffire-I flight report
    response = client.post("/api/v1/assistant/chat", json={
        "query": "What was the flame spread rate of cotton-fiberglass SIBAL fabric in Saffire-I?"
    })
    assert response.status_code == 200
    card = response.json()

    # Check 6-part scientific card structure
    assert "answer" in card
    assert "relevant_investigations" in card
    assert "experimental_conditions" in card
    assert "source_document" in card
    assert "limitations" in card
    assert "missing_information" in card

    assert card["is_verified_psi"] is True
    assert card["confidence_score"] > 0.4
    assert "Saffire-I" in card["relevant_investigations"]
    assert "NASA" in card["source_document"]["citation_str"]
    assert "1.85" in card["answer"] or "1.85" in str(card["experimental_conditions"])

def test_rag_assistant_fallback_on_unverified_query():
    # Completely unrelated query with no NASA combustion data
    response = client.post("/api/v1/assistant/chat", json={
        "query": "What is the breeding cycle of tropical pink flamingos in Madagascar?"
    })
    assert response.status_code == 200
    card = response.json()

    # Must invoke the Fallback Rule:
    # "Insufficient verified NASA evidence available in the indexed corpus to answer this query reliably."
    assert "Insufficient verified NASA evidence" in card["answer"]
    assert card["is_verified_psi"] is False
    assert card["experimental_conditions"]["sample_material"] == "Not available"
