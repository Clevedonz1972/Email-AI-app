#!/usr/bin/env python3
"""
Check if the OpenAI API key is set up properly.

This script verifies that the OpenAI API key is configured in the .env file,
and tests it with a simple API call to ensure it's valid.
"""
import os
import sys
import asyncio
from pathlib import Path

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

def check_env_file():
    """Check if .env file exists and if it contains OPENAI_API_KEY."""
    env_path = os.path.join(backend_dir, '.env')
    
    if not os.path.exists(env_path):
        print("ERROR: .env file not found at:", env_path)
        print("Please create this file with your OpenAI API key.")
        return None
    
    api_key = None
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('OPENAI_API_KEY='):
                api_key = line.strip().split('=', 1)[1].strip()
                # Remove quotes if present
                if (api_key.startswith('"') and api_key.endswith('"')) or \
                   (api_key.startswith("'") and api_key.endswith("'")):
                    api_key = api_key[1:-1]
                break
    
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in .env file")
        print("Please add your OpenAI API key to the .env file with the format:")
        print("OPENAI_API_KEY=your-api-key-here")
        return None
    
    return api_key

async def test_openai_api():
    """Test the OpenAI API key with a simple completion request."""
    try:
        # Try to import settings
        try:
            from backend.config import settings
            api_key = settings.OPENAI_API_KEY if hasattr(settings, "OPENAI_API_KEY") else None
        except ImportError:
            print("Could not import settings. Checking .env file directly...")
            api_key = check_env_file()
        
        if not api_key:
            return False
        
        # Try to import OpenAI
        try:
            from openai import AsyncOpenAI, APIError
        except ImportError:
            print("ERROR: OpenAI package not installed")
            print("Please install it with: pip install openai")
            return False
        
        # Mask most of the API key for display
        masked_key = f"{api_key[:5]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
        print(f"OpenAI API Key found: {masked_key}")
        
        # Initialize the client
        client = AsyncOpenAI(api_key=api_key)
        
        # Test with a simple completion
        print("Testing API key with a simple completion request...")
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello!"}
            ],
            max_tokens=10
        )
        
        # Get the response text
        response_text = response.choices[0].message.content
        
        print(f"API response received: '{response_text}'")
        print("OpenAI API key is valid and working correctly!")
        
        # Check token usage
        if hasattr(response, 'usage'):
            print(f"Token usage: {response.usage.total_tokens} tokens")
        
        return True
    
    except Exception as e:
        print(f"Error testing OpenAI API: {str(e)}")
        print("Your API key may be invalid or there might be connection issues.")
        return False

def check_dependencies():
    """Check if required packages are installed."""
    missing_packages = []
    
    try:
        import openai
    except ImportError:
        missing_packages.append("openai")
    
    try:
        import pydantic
    except ImportError:
        missing_packages.append("pydantic")
    
    try:
        import sqlalchemy
    except ImportError:
        missing_packages.append("sqlalchemy")
    
    if missing_packages:
        print("WARNING: The following required packages are missing:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nYou can install them with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def main():
    """Main function to check API key and print helpful info."""
    print("=== OpenAI API Key Checker ===\n")
    
    # Check dependencies
    if not check_dependencies():
        print("\nPlease install the missing dependencies before proceeding.")
        return
    
    # Test OpenAI API
    success = asyncio.run(test_openai_api())
    
    if success:
        print("\nYour OpenAI integration is ready to use!")
        print("You can now run the following scripts:")
        print("  - backend/scripts/test_openai_integration.py - Test basic OpenAI integration")
        print("  - backend/scripts/generate_test_emails.py - Generate test emails with AI analysis")
        print("  - backend/scripts/display_email_analysis.py - View analyzed emails")
    else:
        print("\nPlease fix the API key issues before proceeding.")
        print("Visit https://platform.openai.com/account/api-keys to create or retrieve your API key.")
    
    print("\n=== Check Completed ===")

if __name__ == "__main__":
    main() 