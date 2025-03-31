"""add ai analysis fields

Revision ID: 1a2b3c4d5e6f
Revises: previous_revision_id
Create Date: 2023-05-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None  # Set this to the actual previous revision ID
branch_labels = None
depends_on = None


def upgrade():
    # Add AI analysis fields to Email table
    op.add_column('emails', sa.Column('ai_summary', sa.String(), nullable=True))
    op.add_column('emails', sa.Column('ai_emotional_tone', sa.String(), nullable=True))
    op.add_column('emails', sa.Column('ai_suggested_action', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('emails', sa.Column('embedding_id', sa.String(), nullable=True))
    
    # Add AI analysis fields to EmailAnalysis table
    op.add_column('email_analysis', sa.Column('emotional_tone', sa.String(), nullable=True))
    op.add_column('email_analysis', sa.Column('explicit_expectations', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('email_analysis', sa.Column('implicit_expectations', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('email_analysis', sa.Column('suggested_actions', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('email_analysis', sa.Column('suggested_response', sa.Text(), nullable=True))
    op.add_column('email_analysis', sa.Column('needs_immediate_attention', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('email_analysis', sa.Column('embedding_vector_id', sa.String(), nullable=True))


def downgrade():
    # Remove AI analysis fields from Email table
    op.drop_column('emails', 'ai_summary')
    op.drop_column('emails', 'ai_emotional_tone')
    op.drop_column('emails', 'ai_suggested_action')
    op.drop_column('emails', 'embedding_id')
    
    # Remove AI analysis fields from EmailAnalysis table
    op.drop_column('email_analysis', 'emotional_tone')
    op.drop_column('email_analysis', 'explicit_expectations')
    op.drop_column('email_analysis', 'implicit_expectations')
    op.drop_column('email_analysis', 'suggested_actions')
    op.drop_column('email_analysis', 'suggested_response')
    op.drop_column('email_analysis', 'needs_immediate_attention')
    op.drop_column('email_analysis', 'embedding_vector_id') 