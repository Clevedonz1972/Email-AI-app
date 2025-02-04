import pytest
from httpx import AsyncClient
from backend.email_api.server import app

@pytest.mark.asyncio
async def test_get_emails():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/emails?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "emails" in data
        assert "total" in data

@pytest.mark.asyncio
async def test_get_email_analytics():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/analytics/emails", params={"user_id": "test-user"})
        assert response.status_code == 200
        data = response.json()
        # Check that analytics data contains the expected keys
        assert "email_volume" in data
        assert "stress_patterns" in data
        assert "success_metrics" in data 