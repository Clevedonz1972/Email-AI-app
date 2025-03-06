from sqlalchemy import text
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from sqlalchemy.ext.asyncio import AsyncSession

client = TestClient(app)


def test_health_check(client, db_session):
    """Test health check endpoint"""
    # Execute a query to ensure database is working
    db_session.execute(text("SELECT 1")).scalar()
    db_session.commit()
    
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "components" in data
    assert data["components"]["api"] == "healthy"
    assert data["components"]["database"] == "healthy"
