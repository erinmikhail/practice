from sqlalchemy import Column, Integer, Float, String, Date, Index, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date as dt_date
from .session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    operations = relationship("Operation", back_populates="owner")


class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)

    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, default=dt_date.today, nullable=False)
    comment = Column(String, nullable=True)

    owner = relationship("User", back_populates="operations")

    __table_args__ = (
        Index('idx_user_date_category', 'user_id', 'date', 'category'),
    )
