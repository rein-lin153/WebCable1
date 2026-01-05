# backend/app/main.py
import math
import random
import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 引入数据库依赖
from app.models.database import engine, Base, get_db
from app.models.tables import CableSpec # 确保表模型被加载
from app.models.schemas import CableCalcRequest, CableCalcResponse, AntiFakeRequest, AntiFakeResponse
from app.services.calc_logic import ElectricalCalculator
# 引入配置文件 (假设存在，如果没有可以直接硬编码URL)
# from app.config import settings 

app = FastAPI(
    title="Phnom Penh Cable Expert API",
    description="Backend for Telegram Mini App",
    version="1.0.0"
)

# 初始化数据库表
Base.metadata.create_all(bind=engine)

# --- CORS 设置 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Phnom Penh Cable Expert API is running"}

# --- 新增：实时铜价接口 ---
@app.get("/api/v1/market/copper")
async def get_copper_price():
    """获取实时铜价 (Sina Finance Crawler + Exchange Rate)"""
    # 1. 尝试从新浪财经获取沪铜连续价格 (CNY)
    sina_url = "http://hq.sinajs.cn/list=hf_CAD" # LME铜代码通常是 hf_CAD 或类似，这里使用模拟或国内期货代码
    # 也可以用沪铜主连: shfe_cu0
    sina_url_shfe = "http://hq.sinajs.cn/list=shfe_cu0" # 示例URL
    
    headers = {"Referer": "https://finance.sina.com.cn/"}
    cny_price = 0.0
    
    # 模拟真实爬虫逻辑 (这里为了演示稳定性，如果爬虫失败会回退到模拟值)
    try:
        # 这里用更简单的模拟逻辑，实际部署时请替换为真实爬虫代码
        # resp = requests.get(sina_url_shfe, headers=headers, timeout=5)
        # ... 解析 resp.text ...
        # 假设爬到了 74000
        cny_price = 74000.0 + random.randint(-200, 200)
    except Exception as e:
        print(f"❌ 铜价接口报错: {e}")
        cny_price = 0.0

    # 2. 获取汇率 (USD -> CNY)
    usd_to_cny_rate = 7.25 # 默认兜底
    try:
        # rate_resp = requests.get("https://api.exchangerate-api.com/v4/latest/USD", timeout=3)
        # if rate_resp.status_code == 200:
        #     usd_to_cny_rate = rate_resp.json().get("rates", {}).get("CNY", 7.25)
        pass
    except:
        pass
    
    # 3. 计算美元价格
    usd_price = cny_price / usd_to_cny_rate if cny_price > 0 else 9240.0 # 兜底LME价格
    
    # 如果爬虫完全失败，返回模拟数据
    if cny_price == 0:
        usd_price = 9240 + random.randint(-50, 50)
        cny_price = usd_price * usd_to_cny_rate

    return {
        "CNY": {
            "source": "SHFE (Simulated)", 
            "symbol": "¥", 
            "price": round(cny_price, 2), 
            "change": round(random.uniform(-1.5, 1.5), 2)
        },
        "USD": {
            "source": f"Calculated (1:{usd_to_cny_rate:.2f})", 
            "symbol": "$", 
            "price": round(usd_price, 2), 
            "change": round(random.uniform(-1.5, 1.5), 2)
        },
        "exchange_rate": round(usd_to_cny_rate, 4),
        "updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# --- 更新：电缆计算接口 (注入 DB) ---
@app.post("/api/v1/calculate/sizing", response_model=CableCalcResponse)
async def calculate_cable_sizing(request: CableCalcRequest, db: Session = Depends(get_db)):
    # 1. 计算电流
    amps = ElectricalCalculator.calculate_current(
        request.power, request.power_unit, request.voltage_type
    )
    
    # 2. 选线 (传入 db 进行查库)
    size = ElectricalCalculator.select_cable(
        db, amps, request.material, request.cable_type
    )
    
    # 3. 算压降
    v_drop = ElectricalCalculator.calculate_voltage_drop(
        amps, request.distance, size, request.material, request.voltage_type
    )
    
    # 4. 推荐断路器
    mcb_val = math.ceil(amps * 1.2)
    # 简单的规格规整逻辑 (10, 16, 20, 32, 40, 50, 63, 80, 100...)
    standard_mcb = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400]
    final_mcb = next((x for x in standard_mcb if x >= mcb_val), mcb_val)
    
    return CableCalcResponse(
        current_amps=amps,
        recommended_size=size,
        voltage_drop_percent=v_drop,
        mcb_rating=f"{final_mcb}A"
    )

# --- 更新：防伪检测接口 (注入 DB) ---
@app.post("/api/v1/check/fake", response_model=AntiFakeResponse)
async def check_fake_cable(request: AntiFakeRequest, db: Session = Depends(get_db)):
    # 1. 调用逻辑层 (传入 db)
    result = ElectricalCalculator.check_fake(
        db, request.nominal_size, request.measured_weight
    )
    
    # 2. 再次查询获取标准值用于展示 (或者让 check_fake 直接返回标准值)
    # 这里为了简单，我们让 check_fake 的返回值包含更多信息，或者在这里简单重查一次
    spec = db.query(CableSpec).filter(
        CableSpec.size == request.nominal_size,
        CableSpec.insulation == 'bv', # 默认
        CableSpec.material == 'cu'
    ).first()
    std_weight = spec.weight_per_100m if spec else 0.0
    
    return AntiFakeResponse(
        is_pass=result.get("pass", False),
        standard_weight=std_weight,
        diff_percent=round(((request.measured_weight - std_weight) / std_weight) * 100, 2) if std_weight else 0,
        message=result["msg"],
        risk_level=result["risk"]
    )
