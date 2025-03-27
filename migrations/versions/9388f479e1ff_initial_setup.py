"""initial_setup

Revision ID: 9388f479e1ff
Revises: 
Create Date: 2025-02-20 14:36:47.513375

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '9388f479e1ff'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('password_hash', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('preferences', sa.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('color', sa.String(length=7), nullable=True),
    sa.Column('icon', sa.String(length=50), nullable=True),
    sa.Column('rules', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_table('user_analytics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('email_volume', sa.Integer(), nullable=True),
    sa.Column('avg_response_time', sa.Float(), nullable=True),
    sa.Column('stress_patterns', sa.JSON(), nullable=True),
    sa.Column('productivity_scores', sa.JSON(), nullable=True),
    sa.Column('category_distribution', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_analytics_id'), 'user_analytics', ['id'], unique=False)
    op.create_table('emails',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.Column('subject', sa.String(), nullable=False),
    sa.Column('content', sa.String(), nullable=False),
    sa.Column('sender', sa.JSON(), nullable=False),
    sa.Column('recipient', sa.JSON(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('is_read', sa.Boolean(), nullable=True),
    sa.Column('is_processed', sa.Boolean(), nullable=True),
    sa.Column('is_archived', sa.Boolean(), nullable=True),
    sa.Column('is_deleted', sa.Boolean(), nullable=True),
    sa.Column('stress_level', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='stresslevel'), nullable=True),
    sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='priority'), nullable=True),
    sa.Column('summary', sa.String(), nullable=True),
    sa.Column('action_items', sa.JSON(), nullable=True),
    sa.Column('sentiment_score', sa.Float(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emails_id'), 'emails', ['id'], unique=False)
    op.create_table('email_analytics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('email_id', sa.Integer(), nullable=True),
    sa.Column('stress_score', sa.Float(), nullable=True),
    sa.Column('priority_score', sa.Float(), nullable=True),
    sa.Column('sentiment_score', sa.Float(), nullable=True),
    sa.Column('analysis_data', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['email_id'], ['emails.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_email_analytics_id'), 'email_analytics', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_email_analytics_id'), table_name='email_analytics')
    op.drop_table('email_analytics')
    op.drop_index(op.f('ix_emails_id'), table_name='emails')
    op.drop_table('emails')
    op.drop_index(op.f('ix_user_analytics_id'), table_name='user_analytics')
    op.drop_table('user_analytics')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ### 