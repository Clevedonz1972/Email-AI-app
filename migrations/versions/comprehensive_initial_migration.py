"""comprehensive initial migration

Revision ID: comprehensive_001
Revises: None
Create Date: 2024-03-18 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'comprehensive_001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), unique=True, index=True),
        sa.Column('full_name', sa.String()),
        sa.Column('password_hash', sa.String()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.Column('preferences', postgresql.JSON(), default={}),
        sa.PrimaryKeyConstraint('id')
    )

    # Create user_preferences table
    op.create_table(
        'user_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('accessibility', postgresql.JSON(), default={}),
        sa.Column('notifications', postgresql.JSON(), default={}),
        sa.Column('ai_assistance', postgresql.JSON(), default={}),
        sa.Column('notification_frequency', sa.String(), default='daily'),
        sa.Column('theme', sa.String(), default='light'),
        sa.Column('stress_sensitivity', sa.String(), default='MEDIUM'),
        sa.Column('anxiety_triggers', postgresql.JSON(), default=['deadline', 'urgent']),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create emails table
    op.create_table(
        'emails',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('subject', sa.String()),
        sa.Column('content', sa.Text()),
        sa.Column('sender', sa.String()),
        sa.Column('recipient', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('name', sa.String()),
        sa.Column('description', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create templates table
    op.create_table(
        'templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('name', sa.String()),
        sa.Column('content', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create analytics tables
    op.create_table(
        'user_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'email_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('email_id', sa.Integer(), sa.ForeignKey('emails.id')),
        sa.Column('metrics', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create feedback tables
    op.create_table(
        'quick_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('rating', sa.Integer()),
        sa.Column('comment', sa.String()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'detailed_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('feedback_data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'feedback_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('metrics', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'accessibility_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('feedback_data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create test-related tables
    op.create_table(
        'test_scenarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('scenario_data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'test_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('scenario_id', sa.Integer(), sa.ForeignKey('test_scenarios.id')),
        sa.Column('feedback_data', postgresql.JSON()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    # Drop tables in reverse order to handle dependencies
    op.drop_table('test_feedback')
    op.drop_table('test_scenarios')
    op.drop_table('accessibility_feedback')
    op.drop_table('feedback_analytics')
    op.drop_table('detailed_feedback')
    op.drop_table('quick_feedback')
    op.drop_table('email_analytics')
    op.drop_table('user_analytics')
    op.drop_table('templates')
    op.drop_table('categories')
    op.drop_table('emails')
    op.drop_table('user_preferences')
    op.drop_table('users') 