import pytest
from backend.auth.security import create_access_token

def test_health_check(test_client):
    """Test health check endpoint"""
    response = test_client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_user_login(test_client, setup_test_db):
    """Test user login endpoint"""
    response = test_client.post(
        "/api/auth/login",
        json={
            "email": "adhd_test@example.com",
            "password": "test123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "Bearer"

def test_get_emails(test_client, setup_test_db):
    """Test get emails endpoint"""
    # Get the ADHD test user
    user = setup_test_db["users"]["adhd_user"]
    
    # Create access token
    access_token = create_access_token({"sub": str(user.id)})
    
    response = test_client.get(
        "/api/emails",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    emails = response.json()
    assert isinstance(emails, list)
    # Verify emails belong to the correct user
    for email in emails:
        assert email["user_id"] == user.id

def test_email_analysis(test_client, setup_test_db):
    """Test email analysis endpoint"""
    # Get the anxiety test user and their first email
    user = setup_test_db["users"]["anxiety_user"]
    emails = [e for e in setup_test_db["emails"] if e.user_id == user.id]
    email = emails[0]
    
    # Create access token
    access_token = create_access_token({"sub": str(user.id)})
    
    response = test_client.get(
        f"/api/emails/{email.id}/analysis",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    analysis = response.json()
    assert "stress_level" in analysis
    assert "priority" in analysis
    assert "sentiment_score" in analysis

def test_user_preferences(test_client, setup_test_db):
    """Test user preferences endpoints"""
    # Get the dyslexic test user
    user = setup_test_db["users"]["dyslexic_user"]
    
    # Create access token
    access_token = create_access_token({"sub": str(user.id)})
    
    # Test GET preferences
    response = test_client.get(
        "/api/preferences",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    preferences = response.json()
    assert preferences["accessibility"]["high_contrast"] is True
    assert preferences["accessibility"]["large_text"] is True
    assert preferences["accessibility"]["text_scale"] == 125
    assert preferences["notifications"]["email"] is True
    assert preferences["notifications"]["push"] is True
    assert preferences["ai_assistance"]["level"] == "balanced"
    
    # Test PUT preferences
    new_preferences = {
        "accessibility": {
            "high_contrast": False,
            "large_text": True,
            "reduced_motion": True,
            "text_scale": 150
        }
    }
    response = test_client.put(
        "/api/preferences",
        headers={"Authorization": f"Bearer {access_token}"},
        json=new_preferences
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["accessibility"]["high_contrast"] is False
    assert updated["accessibility"]["large_text"] is True
    assert updated["accessibility"]["text_scale"] == 150

def test_email_reply_generation(test_client, setup_test_db):
    """Test email reply generation endpoint"""
    # Get the ADHD test user and their first email
    user = setup_test_db["users"]["adhd_user"]
    emails = [e for e in setup_test_db["emails"] if e.user_id == user.id]
    email = emails[0]
    
    # Create access token
    access_token = create_access_token({"sub": str(user.id)})
    
    response = test_client.post(
        f"/api/emails/{email.id}/reply",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"tone": "professional"}
    )
    assert response.status_code == 200
    reply = response.json()
    assert "content" in reply
    assert isinstance(reply["content"], str)

def test_unauthorized_access(test_client):
    """Test unauthorized access to protected endpoints"""
    endpoints = [
        "/api/auth/me",
        "/api/preferences",
        "/api/emails"
    ]
    
    for endpoint in endpoints:
        # Test without token
        response = test_client.get(endpoint)
        assert response.status_code == 401
        
        # Test with invalid token
        response = test_client.get(
            endpoint,
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401 