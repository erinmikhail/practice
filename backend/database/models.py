from sqlalchemy import Column, Integer, Float, String, Date, Index
from datetime import date as dt_date
from .session import Base


class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1, index=True, nullable=False)

    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)

    date = Column(Date, default=dt_date.today, nullable=False)
    comment = Column(String, nullable=True)

    __table_args__ = (
        Index('idx_user_date_category', 'user_id', 'date', 'category'),
    )
