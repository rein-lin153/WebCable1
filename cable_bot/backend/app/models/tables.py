from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from .database import Base

class CableSpec(Base):
    __tablename__ = "cable_specs"
    
    id = Column(Integer, primary_key=True, index=True)
    material = Column(String)    # cu, al
    insulation = Column(String)  # bv, yjv
    size = Column(String)        # 1.5, 2.5
    ampacity = Column(Float)     # 载流量
    weight_per_100m = Column(Float, nullable=True) # 标准重量

# --- 修改后的铜价表 ---
class CopperPrice(Base):
    __tablename__ = "copper_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now, index=True) # 抓取时间
    price_cny = Column(Float) # 人民币价格
    price_usd = Column(Float) # 美元价格
    exchange_rate = Column(Float) # 当时汇率
    source = Column(String)   # 数据源 (e.g., "SHFE")