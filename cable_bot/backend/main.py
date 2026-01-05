# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional
import math

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class CableCalcRequest(BaseModel):
    power: float
    power_unit: str
    voltage_type: str
    distance: float
    material: str
    cable_type: str

class CableCalcResponse(BaseModel):
    current_amps: float
    recommended_size: str
    voltage_drop_percent: float
    mcb_rating: str

class AntiFakeRequest(BaseModel):
    nominal_size: str
    measured_weight: float
    cable_type: str = "bv"

class AntiFakeResponse(BaseModel):
    is_pass: bool
    standard_weight: float
    diff_percent: float
    message: str
    risk_level: str

# --- Logic ---
AMPACITY_DB = {
    "cu": {
        "bv": {"1.5": 17, "2.5": 24, "4.0": 32, "6.0": 40, "10": 55},
        "yjv": {"1.5": 20, "2.5": 28, "4.0": 38, "6.0": 49, "10": 68}
    }
}
WEIGHT_STD_DB = {"1.5": 2.0, "2.5": 3.1, "4.0": 4.6, "6.0": 6.8}

@app.post("/api/v1/calculate/sizing")
async def calculate_sizing(req: CableCalcRequest):
    # 简化的计算逻辑用于测试
    amps = req.power  # 简化：假设输入即电流
    if req.power_unit == "kw":
        amps = (req.power * 1000) / (220 if req.voltage_type == "220v" else 658)

    table = AMPACITY_DB.get(req.material, {}).get(req.cable_type, {})
    rec_size = "Over Limit"
    for size, cap in table.items():
        if cap >= amps:
            rec_size = size
            break

    return {
        "current_amps": round(amps, 2),
        "recommended_size": rec_size,
        "voltage_drop_percent": 3.5, # 模拟数据
        "mcb_rating": "40A"
    }

@app.post("/api/v1/check/fake")
async def check_fake(req: AntiFakeRequest):
    std = WEIGHT_STD_DB.get(req.nominal_size, 0)
    if std == 0: return {"is_pass": False, "standard_weight": 0, "diff_percent": 0, "message": "未知规格", "risk_level": "warning"}

    ratio = req.measured_weight / std
    if ratio >= 0.95:
        return {"is_pass": True, "standard_weight": std, "diff_percent": round((ratio-1)*100, 1), "message": "合格正品", "risk_level": "safe"}
    else:
        return {"is_pass": False, "standard_weight": std, "diff_percent": round((ratio-1)*100, 1), "message": "重量不足", "risk_level": "danger"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)