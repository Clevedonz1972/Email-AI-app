from backend.models.user import User
from backend.database import get_db, SessionLocal
from sqlalchemy.orm import Session

with SessionLocal() as db:
    # Delete existing test user if exists
    existing = db.query(User).filter(User.email == 'test@example.com').first()
    if existing:
        db.delete(existing)
        db.commit()
        
    # Create new test user
    user = User(
        email='test@example.com',
        is_active=True,
        preferences={}
    )
    user.set_password('password123')
    db.add(user)
    db.commit()
    print(f'Created test user: test@example.com with password: password123') 