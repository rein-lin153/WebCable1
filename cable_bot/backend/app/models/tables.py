from sqlalchemy import Column, Integer, String, Float, Boolean
from .database import Base

class CableSpec(Base):
    __tablename__ = "cable_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    material = Column(String)    # cu, al
    insulation = Column(String)  # bv, yjv
    size = Column(String)        # 1.5, 2.5
    ampacity = Column(Float)     # 载流量
    weight_per_100m = Column(Float, nullable=True) # 标准重量 (用于防伪)

class CopperPrice(Base):
    __tablename__ = "copper_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True) # YYYY-MM-DD
    price_usd_ton = Column(Float)