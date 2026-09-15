from datetime import datetime
from typing import Optional
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Raster(Base):
    __tablename__ = "rasters"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    modality: Mapped[str] = mapped_column(String(50), default="Optical", nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    dimensions: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bands: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="staged", nullable=False)
    benchmark_source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

