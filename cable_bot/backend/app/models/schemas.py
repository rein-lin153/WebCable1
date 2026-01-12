from pydantic import BaseModel, Field
from typing import Literal, Optional

# --- V2.0 电缆选型请求模型 ---
class CableCalcRequest(BaseModel):
    # 1. 负载信息
    power: float = Field(..., gt=0, description="功率数值")
    power_unit: Literal["kw", "hp", "amps"] = Field(..., description="功率单位")
    voltage_type: Literal["220v", "380v"] = Field(..., description="电压等级")
    power_factor: float = Field(0.85, ge=0.1, le=1.0, description="功率因数 (电机0.8, 加热1.0)")
    
    # 2. 环境与敷设
    distance: float = Field(..., gt=0, description="线路长度(米)")
    temperature: float = Field(40.0, description="环境温度")
    installation_factor: float = Field(1.0, description="敷设系数: 明装1.0, 穿管0.8, 直埋0.9")
    max_voltage_drop: float = Field(5.0, description="允许压降%")
    
    # 3. 线缆参数
    material: Literal["cu", "al"] = Field("cu", description="材质")
    cable_type: Literal["yjv", "bv"] = Field("yjv", description="绝缘类型")

class CableCalcResponse(BaseModel):
    current_amps: float
    recommended_size: str
    voltage_drop_percent: float
    mcb_rating: str
    selection_reason: str
    safe_ampacity: float

    
# --- 防伪检测请求模型 ---
class AntiFakeRequest(BaseModel):
    nominal_size: str = Field(..., description="标称截面，如 '2.5', '4.0'")
    measured_weight: float = Field(..., gt=0, description="实测重量 (kg/100m)")
    cable_type: str = Field("bv", description="默认针对家装BV线")

# --- 防伪检测响应模型 ---
class AntiFakeResponse(BaseModel):
    is_pass: bool
    standard_weight: float
    diff_percent: float
    message: str
    risk_level: Literal["safe", "warning", "danger"]