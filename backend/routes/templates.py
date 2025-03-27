from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.template import EmailTemplate
from models.user import User
from schemas.template import TemplateCreate, TemplateResponse, TemplateUpdate
from auth.security import get_current_active_user
from database import get_db

router = APIRouter(prefix="/templates", tags=["templates"])


@router.post("", response_model=TemplateResponse)
async def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> EmailTemplate:
    """Create a new email template."""
    template = EmailTemplate(user_id=current_user.id, **template_data.dict())

    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("", response_model=List[TemplateResponse])
async def get_templates(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> List[EmailTemplate]:
    """Get user's email templates."""
    return (
        db.query(EmailTemplate).filter(EmailTemplate.user_id == current_user.id).all()
    )


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> EmailTemplate:
    """Get a specific template."""
    template = (
        db.query(EmailTemplate)
        .filter(
            EmailTemplate.id == template_id, EmailTemplate.user_id == current_user.id
        )
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> EmailTemplate:
    """Update a template."""
    template = (
        db.query(EmailTemplate)
        .filter(
            EmailTemplate.id == template_id, EmailTemplate.user_id == current_user.id
        )
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    for field, value in template_update.dict(exclude_unset=True).items():
        setattr(template, field, value)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a template."""
    template = (
        db.query(EmailTemplate)
        .filter(
            EmailTemplate.id == template_id, EmailTemplate.user_id == current_user.id
        )
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}
