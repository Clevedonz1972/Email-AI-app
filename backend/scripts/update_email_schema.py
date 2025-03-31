"""
Script to generate a migration for adding new AI analysis fields to the email tables.
Run this script to create a migration file that can be applied to update the database schema.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path to allow importing from the backend
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(backend_dir)

from alembic import command
from alembic.config import Config
from backend.config import settings
from backend.utils.logger import logger


def main():
    """Generate a migration to update email schema with AI analysis fields."""
    try:
        # Get the alembic.ini file path
        alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
        
        # Check if file exists
        if not os.path.exists(alembic_ini_path):
            logger.error(f"Alembic config file not found at {alembic_ini_path}")
            return
        
        # Create Alembic configuration
        alembic_cfg = Config(alembic_ini_path)
        
        # Generate a migration with a descriptive message
        logger.info("Generating migration for AI analysis fields...")
        command.revision(alembic_cfg, 
                        autogenerate=True,
                        message="add_ai_analysis_fields_to_email")
        
        logger.info("Migration file generated successfully!")
        logger.info("To apply the migration, run: alembic upgrade head")
        
    except Exception as e:
        logger.error(f"Error generating migration: {str(e)}")
        raise


if __name__ == "__main__":
    main() 