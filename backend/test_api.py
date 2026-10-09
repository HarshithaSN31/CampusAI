import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"

def test_sections():
    res = client.get("/api/timetable/sections")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 42
    assert "5CSE01" in data["sections"]
    assert "5CSE42" in data["sections"]

def test_timetable_grid():
    res = client.get("/api/timetable?section=5CSE01")
    assert res.status_code == 200
    data = res.json()
    assert data["metadata"]["section"] == "5CSE01"
    assert len(data["entries"]) > 0

def test_rooms():
    res = client.get("/api/rooms")
    assert res.status_code == 200
    rooms = res.json()
    assert len(rooms) > 10

def test_analytics_utilization():
    res = client.get("/api/analytics/utilization")
    assert res.status_code == 200
    data = res.json()
    assert "overall_utilization_rate" in data
    assert "energy_insights" in data

def test_conflicts():
    res = client.get("/api/conflicts")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert len(data["conflicts"]) > 0

def test_chat_assistant():
    res = client.post("/api/ai/chat", json={"message": "What is my next class?", "section": "5CSE01"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["sources"]) > 0

def test_maintenance_tickets():
    res = client.get("/api/maintenance")
    assert res.status_code == 200
    tickets = res.json()
    assert len(tickets) >= 3
