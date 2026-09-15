"""Initial schema: users, rasters, analyses, catalog_images

Revision ID: 0001
Revises: 
Create Date: 2026-09-07 16:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="analyst"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. rasters table
    op.create_table(
        "rasters",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("size", sa.BigInteger(), nullable=True),
        sa.Column("modality", sa.String(length=50), nullable=False, server_default="Optical"),
        sa.Column("file_type", sa.String(length=50), nullable=True),
        sa.Column("dimensions", sa.String(length=50), nullable=True),
        sa.Column("bands", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="staged"),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # 3. analyses table
    op.create_table(
        "analyses",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("task", sa.String(length=100), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="completed"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("result", sa.JSON(), nullable=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # 4. catalog_images table
    op.create_table(
        "catalog_images",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=50), nullable=False),
        sa.Column("modality", sa.String(length=50), nullable=False),
        sa.Column("sensor", sa.String(length=100), nullable=False),
        sa.Column("date", sa.String(length=50), nullable=False),
        sa.Column("size", sa.String(length=50), nullable=False),
        sa.Column("dimensions", sa.String(length=50), nullable=False),
        sa.Column("bands", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=100), nullable=False),
        sa.Column("scenario_key", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("catalog_images")
    op.drop_table("analyses")
    op.drop_table("rasters")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
