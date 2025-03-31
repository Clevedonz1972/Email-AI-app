#!/usr/bin/env python3
"""
Test script for OpenAI integration in ASTI.

This script tests the basic functionality of:
1. Email summary generation
2. Embedding generation
3. Vector memory storage
"""
import asyncio
import sys
from pathlib import Path
import json

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

from backend.services.openai_service import get_email_summary_and_suggestion, generate_embedding
from backend.services.vector_memory import add_memory
from backend.utils.logger import logger

TEST_EMAIL = """
Subject: Project Deadline Extended

Hi Team,

I wanted to let you know that the deadline for the project has been extended to next Friday. 
This should give us more time to complete the final deliverables.

Please let me know if you have any questions or concerns about this change.

Best regards,
John
"""

async def test_email_summary():
    """Test the email summary generation."""
    try:
        print("Testing email summary generation...")
        summary = await get_email_summary_and_suggestion(TEST_EMAIL)
        print("\nEmail Summary Result:")
        print(json.dumps(summary, indent=2))
        
        return summary
    except Exception as e:
        logger.error(f"Error testing email summary: {str(e)}")
        print(f"Error: {str(e)}")
        return None

async def test_embedding_generation():
    """Test the embedding vector generation."""
    try:
        print("\nTesting embedding generation...")
        embedding = await generate_embedding(TEST_EMAIL)
        
        print(f"Embedding generated successfully!")
        print(f"Embedding dimensions: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")
        
        return embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        print(f"Error: {str(e)}")
        return None

async def test_vector_memory():
    """Test storing an item in vector memory."""
    try:
        print("\nTesting vector memory storage...")
        
        # Get summary first
        summary = await get_email_summary_and_suggestion(TEST_EMAIL)
        if not summary:
            print("Skipping vector memory test as summary generation failed.")
            return
        
        # Store in vector memory
        metadata = {
            "email_id": "test-email-123",
            "subject": "Project Deadline Extended",
            "sender": {"email": "john@example.com", "name": "John"},
            "summary": summary.get("summary"),
            "emotional_tone": summary.get("emotional_tone"),
            "stress_level": summary.get("stress_level"),
            "needs_immediate_attention": summary.get("needs_immediate_attention", False)
        }
        
        memory_id = await add_memory(
            TEST_EMAIL,
            metadata,
            "test-user-123",
            "email",
            0.7  # Importance
        )
        
        print(f"Memory stored successfully with ID: {memory_id}")
        
        return memory_id
    except Exception as e:
        logger.error(f"Error testing vector memory: {str(e)}")
        print(f"Error: {str(e)}")
        return None

async def run_tests():
    """Run all the tests in sequence."""
    print("=== ASTI OpenAI Integration Test ===\n")
    
    # Check for API key
    from backend.config import settings
    if not hasattr(settings, "OPENAI_API_KEY") or not settings.OPENAI_API_KEY:
        print("ERROR: OPENAI_API_KEY is not set in the .env file")
        return
    
    print(f"OpenAI API Key found: {settings.OPENAI_API_KEY[:5]}***{settings.OPENAI_API_KEY[-4:]}")
    
    await test_email_summary()
    await test_embedding_generation()
    await test_vector_memory()
    
    print("\n=== Test Completed ===")

if __name__ == "__main__":
    asyncio.run(run_tests()) 