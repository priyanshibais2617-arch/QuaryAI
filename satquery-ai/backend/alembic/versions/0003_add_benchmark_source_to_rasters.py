"""Add benchmark_source to rasters

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-07 18:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("rasters", sa.Column("benchmark_source", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("rasters", "benchmark_source")
