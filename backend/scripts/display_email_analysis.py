#!/usr/bin/env python3
"""
Display AI-generated email analysis results.

This script retrieves emails from the database and displays the AI analysis
in a readable format, including summaries, emotional tone, and suggested actions.
"""
import asyncio
import json
import sys
from pathlib import Path
from typing import List, Optional
from datetime import datetime

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

from sqlalchemy.orm import Session, joinedload
from backend.database import get_db
from backend.models.email import Email, EmailAnalysis

def display_email_summary(email: Email, analysis: Optional[EmailAnalysis] = None):
    """Display a summary of an email and its AI analysis in a readable format."""
    print("\n" + "="*80)
    print(f"EMAIL: {email.subject}")
    print("="*80)
    
    # Email metadata
    print(f"From: {email.sender.get('name', 'Unknown')} <{email.sender.get('email', 'unknown@example.com')}>")
    print(f"Date: {email.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Priority: {email.priority}")
    print(f"Stress Level: {email.stress_level}")
    
    # AI Summary
    print("\n" + "-"*40)
    print("AI SUMMARY")
    print("-"*40)
    print(f"{email.ai_summary or 'No AI summary available'}")
    
    # Full analysis if available
    if analysis:
        # Emotional context
        print("\n" + "-"*40)
        print("EMOTIONAL CONTEXT")
        print("-"*40)
        print(f"Tone: {analysis.emotional_tone or 'Unknown'}")
        print(f"Stress Level: {analysis.stress_level}")
        print(f"Needs Immediate Attention: {'Yes' if analysis.needs_immediate_attention else 'No'}")
        
        # Expectations
        if analysis.explicit_expectations or analysis.implicit_expectations:
            print("\n" + "-"*40)
            print("SENDER EXPECTATIONS")
            print("-"*40)
            
            if analysis.explicit_expectations:
                print("Explicit expectations:")
                for i, exp in enumerate(analysis.explicit_expectations, 1):
                    print(f"  {i}. {exp}")
            
            if analysis.implicit_expectations:
                print("\nImplicit expectations:")
                for i, exp in enumerate(analysis.implicit_expectations, 1):
                    print(f"  {i}. {exp}")
        
        # Suggested actions
        if analysis.suggested_actions:
            print("\n" + "-"*40)
            print("SUGGESTED ACTIONS")
            print("-"*40)
            
            for i, action in enumerate(analysis.suggested_actions, 1):
                print(f"{i}. {action.get('action', 'Unknown action')}")
                
                if action.get('deadline'):
                    print(f"   Deadline: {action.get('deadline')}")
                
                if action.get('effort_level'):
                    print(f"   Effort: {action.get('effort_level')}")
                
                if action.get('steps'):
                    print("   Steps:")
                    for j, step in enumerate(action.get('steps'), 1):
                        print(f"     {j}. {step}")
                print()
        
        # Suggested response
        if analysis.suggested_response:
            print("\n" + "-"*40)
            print("SUGGESTED RESPONSE")
            print("-"*40)
            print(analysis.suggested_response)
    
    print("\n" + "="*80 + "\n")

def display_all_email_analysis(db: Session):
    """Retrieve and display all emails with their AI analysis."""
    # Get all processed emails with their analysis
    emails = (
        db.query(Email)
        .filter(Email.is_processed == True)
        .options(joinedload(Email.analysis))
        .order_by(Email.timestamp.desc())
        .all()
    )
    
    if not emails:
        print("No processed emails found in the database.")
        return
    
    print(f"Found {len(emails)} processed emails.")
    
    for email in emails:
        display_email_summary(email, email.analysis)

def display_email_by_id(db: Session, email_id: int):
    """Retrieve and display a specific email by ID."""
    email = (
        db.query(Email)
        .filter(Email.id == email_id)
        .options(joinedload(Email.analysis))
        .first()
    )
    
    if not email:
        print(f"No email found with ID {email_id}.")
        return
    
    display_email_summary(email, email.analysis)

def main():
    """Main function to display email analysis."""
    print("=== ASTI Email Analysis Display ===\n")
    
    # Get database session
    db = next(get_db())
    try:
        # Check if an email ID was provided
        if len(sys.argv) > 1:
            try:
                email_id = int(sys.argv[1])
                display_email_by_id(db, email_id)
            except ValueError:
                print(f"Invalid email ID: {sys.argv[1]}. Please provide a valid integer ID.")
        else:
            # Display all emails
            display_all_email_analysis(db)
    finally:
        db.close()
    
    print("=== Display Completed ===")

if __name__ == "__main__":
    main() 