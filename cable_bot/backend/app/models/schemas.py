from pydantic import BaseModel, Field
from typing import Literal, Optional

# --- 电缆选型请求模型 (升级版) ---
class CableCalcRequest(BaseModel):
    power: float = Field(..., gt=0, description="功率数值")
    power_unit: Literal["kw", "hp", "amps"] = Field(..., description="功率单位")
    voltage_type: Literal["220v", "380v"] = Field(..., description="电压等级")
    distance: float = Field(..., gt=0, description="线路长度(米)")
    material: Literal["cu", "al"] = Field("cu", description="材质: 铜/铝")
    cable_type: Literal["yjv", "bv"] = Field("yjv", description="绝缘类型: YJV(XLPE)/BV(PVC)")
    
    # 新增高级参数
    temperature: Optional[float] = Field(40.0, description="环境温度 (默认柬埔寨 40°C)")
    max_voltage_drop: Optional[float] = Field(5.0, description="最大允许压降% (默认 5%)")

class CableCalcResponse(BaseModel):
    current_amps: float
    recommended_size: str      # 最终推荐规格
    voltage_drop_percent: float
    mcb_rating: str
    
    # 新增解释字段，告诉用户为什么选这么大
    selection_reason: str      # 例如: "因压降过大(6.5%)，已自动从 4mm² 升级为 6mm²"
    safe_ampacity: float       # 该电缆在当前温度下的实际载流量