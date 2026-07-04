from sqlalchemy import Column, Integer, Float, String, Date, Boolean, Index, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date as dt_date
from .session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    consent_given = Column(Boolean, default=False, nullable=False)
    
    operations = relationship("Operation", back_populates="owner")
    recurring_operations = relationship("RecurringOperation", back_populates="owner")


class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, default=dt_date.today, nullable=False)
    comment = Column(String, nullable=True)

    owner = relationship("User", back_populates="operations")

    __table_args__ = (
        Index('idx_user_date_category', 'user_id', 'date', 'category'),
    )


class RecurringOperation(Base):
    __tablename__ = "recurring_operations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
  
    frequency = Column(String, nullable=False) 

    next_date = Column(Date, nullable=False) 
    comment = Column(String, nullable=True)

    owner = relationship("User", back_populates="recurring_operations")