from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import CableCalcRequest, CableCalcResponse, AntiFakeRequest, AntiFakeResponse
from app.services.calc_logic import ElectricalCalculator

app = FastAPI(
    title="Phnom Penh Cable Expert API",
    description="Backend for Telegram Mini App",
    version="1.0.0"
)

# --- CORS 设置 (关键：Telegram Webview 需要跨域) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议替换为具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Phnom Penh Cable Expert API is running"}

@app.post("/api/v1/calculate/sizing", response_model=CableCalcResponse)
async def calculate_cable_sizing(request: CableCalcRequest):
    # 1. 计算电流
    amps = ElectricalCalculator.calculate_current(
        request.power, request.power_unit, request.voltage_type
    )
    
    # 2. 选线
    size = ElectricalCalculator.select_cable(
        amps, request.material, request.cable_type
    )
    
    # 3. 算压降
    v_drop = ElectricalCalculator.calculate_voltage_drop(
        amps, request.distance, size, request.material, request.voltage_type
    )
    
    # 4. 推荐断路器 (简单逻辑: 选线载流量 * 0.8 或者 > Amps 的最近规格)
    # 这里简化处理，仅做演示
    mcb = f"{math.ceil(amps * 1.2 / 10) * 10}A" 
    
    return CableCalcResponse(
        current_amps=amps,
        recommended_size=size,
        voltage_drop_percent=v_drop,
        mcb_rating=mcb
    )

@app.post("/api/v1/check/fake", response_model=AntiFakeResponse)
async def check_fake_cable(request: AntiFakeRequest):
    result = ElectricalCalculator.check_fake(request.nominal_size, request.measured_weight)
    
    std_weight = WEIGHT_STD_DB.get(request.nominal_size, 0)
    
    return AntiFakeResponse(
        is_pass=result.get("pass", False),
        standard_weight=std_weight,
        diff_percent=round(((request.measured_weight - std_weight) / std_weight) * 100, 2) if std_weight else 0,
        message=result["msg"],
        risk_level=result["risk"]
    )

# 启动命令 (开发用):
# uvicorn app.main:app --reload