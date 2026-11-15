import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "NASA FireSafe AI"
    assert "0g Microgravity" in data["verified_regimes"]

def test_get_investigations():
    response = client.get("/api/v1/investigations")
    assert response.status_code == 200
    invs = response.json()
    assert len(invs) >= 10
    codes = [inv["code"] for inv in invs]
    assert "BASS" in codes
    assert "Saffire-I" in codes
    assert "FLEX" in codes
    assert "SAME" in codes
    assert "SoFIE" in codes

def test_get_investigation_detail():
    response = client.get("/api/v1/investigations/Saffire-I")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "Saffire-I"
    assert len(data["runs"]) > 0
    assert len(data["rankings"]) > 0

def test_fleet_stats():
    response = client.get("/api/v1/investigations/summary/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["verified_investigations_count"] >= 10
    assert data["status"] == "NOMINAL"
    assert data["gravity_regimes_mapped"] == 4

def test_compare_investigations():
    response = client.post("/api/v1/experiments/compare", json=["BASS", "Saffire-I", "SoFIE"])
    assert response.status_code == 200
    data = response.json()
    assert len(data["compared_investigations"]) == 3
    assert "synthesis" in data

def test_get_research_gaps():
    response = client.get("/api/v1/gaps")
    assert response.status_code == 200
    gaps = response.json()
    assert len(gaps) >= 4
    titles = [g["gap_title"] for g in gaps]
    assert any("Partial-Gravity" in t for t in titles)

def test_get_radar_scan():
    response = client.get("/api/v1/gaps/radar")
    assert response.status_code == 200
    radar = response.json()
    assert "blips" in radar
    assert "concentric_rings" in radar
    assert radar["critical_gaps_count"] >= 2

def test_visualizations_data():
    r1 = client.get("/api/v1/visualizations/flammability-envelope")
    assert r1.status_code == 200
    assert len(r1.json()["boundary_curve"]) > 0

    r2 = client.get("/api/v1/visualizations/flame-spread-velocity")
    assert r2.status_code == 200
    assert len(r2.json()["curves"]) > 0

    r3 = client.get("/api/v1/visualizations/smoke-distribution")
    assert r3.status_code == 200
    assert len(r3.json()["particle_distribution"]) > 0

def test_earth_applications():
    response = client.get("/api/v1/earth-applications")
    assert response.status_code == 200
    apps = response.json()
    assert len(apps) >= 4
    titles = [a["title"] for a in apps]
    assert any("Cool Flames" in t or "HCCI" in t for t in titles)
