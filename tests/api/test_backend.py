"""
Integration and API contract tests for Royals Intelligence OS FastAPI backend.
"""
import pytest
from starlette.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_api_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "version" in data

def test_api_system_status(client):
    res = client.get("/api/v1/system/status")
    assert res.status_code == 200
    data = res.json()
    assert data["datasets_validated"] == 7
    assert data["total_deliveries"] == 200999
    assert "WinProbability-HGB" in data["models_active"]

def test_api_rankings_batters(client):
    res = client.get("/api/v1/rankings/batters?limit=10")
    assert res.status_code == 200
    data = res.json()
    batters = data["batters"]
    assert len(batters) == 10
    assert batters[0]["rank"] == 1
    assert "hp_balls" in batters[0]
    assert "reliability_score" in batters[0]

def test_api_rankings_bowlers(client):
    res = client.get("/api/v1/rankings/bowlers?limit=10")
    assert res.status_code == 200
    data = res.json()
    bowlers = data["bowlers"]
    assert len(bowlers) == 10
    assert bowlers[0]["rank"] == 1
    assert "hp_balls" in bowlers[0]
    assert "reliability_score" in bowlers[0]

def test_api_auction_simulation(client):
    req_body = {
        "budget_cr": 45.0,
        "max_overseas": 3,
        "squad_slots": 4
    }
    res = client.post("/api/v1/auction/simulate", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"]["status"] == "OPTIMAL_SOLUTION_FOUND"
    assert data["metrics"]["total_estimated_spend_cr"] <= 45.0
    assert "optimal_squad" in data

def test_api_ai_copilot_grounded(client):
    req_body = {
        "query": "Who is the best death bowler under pressure and why?"
    }
    res = client.post("/api/v1/ai/query", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "supporting_metrics" in data
