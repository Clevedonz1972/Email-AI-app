"""add is_archived to email

Revision ID: e3d9594dcef6
Revises: c7cd0873463d
Create Date: 2025-02-14 11:45:57.875229

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e3d9594dcef6"
down_revision: Union[str, None] = "c7cd0873463d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("emails", sa.Column("is_archived", sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("emails", "is_archived")
    # ### end Alembic commands ###
