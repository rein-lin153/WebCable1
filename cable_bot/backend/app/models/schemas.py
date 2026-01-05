from pydantic import BaseModel, Field
from typing import Literal, Optional

# --- 电缆选型请求模型 ---
class CableCalcRequest(BaseModel):
    power: float = Field(..., gt=0, description="功率数值")
    power_unit: Literal["kw", "hp", "amps"] = Field(..., description="功率单位")
    voltage_type: Literal["220v", "380v"] = Field(..., description="电压等级")
    distance: float = Field(..., gt=0, description="线路长度(米)")
    material: Literal["cu", "al"] = Field("cu", description="材质: 铜/铝")
    cable_type: Literal["yjv", "bv"] = Field("yjv", description="绝缘类型")
    # 预留参数：环境温度，默认为柬埔寨常见高温 35-40度
    temp_correction: Optional[float] = 1.0 

# --- 电缆选型响应模型 ---
class CableCalcResponse(BaseModel):
    current_amps: float
    recommended_size: str
    voltage_drop_percent: float
    mcb_rating: str  # 断路器推荐
    warning: Optional[str] = None

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