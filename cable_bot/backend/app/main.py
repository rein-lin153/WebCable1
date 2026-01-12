# backend/app/main.py
import math
import random
import requests
import urllib3
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler

# 引入数据库依赖
from app.models.database import engine, Base, get_db, SessionLocal
from app.models.tables import CableSpec, CopperPrice
from app.models.schemas import CableCalcRequest, CableCalcResponse, AntiFakeRequest, AntiFakeResponse
from app.services.calc_logic import ElectricalCalculator

# 🔇 禁用 SSL 警告 (为了在网络不佳时能强制连接国内源)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- 核心功能：获取实时铜价 (国际优化版) ---
def get_realtime_copper_prices():
    """
    策略：Yahoo财经 (全球节点, 速度快) -> 东方财富 (国内备用) -> 模拟兜底
    """
    print(f"🕷️ [{datetime.now().strftime('%H:%M:%S')}] 正在获取铜价...", end=" ")
    
    result = {
        "CNY": {"price": 0.0, "symbol": "¥", "source": "Failed"},
        "USD": {"price": 0.0, "symbol": "$", "source": "Failed"},
        "exchange_rate": 7.25,
        "updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # 1. 获取汇率 (USD -> CNY)
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        rate_resp = requests.get("https://api.exchangerate-api.com/v4/latest/USD", headers=headers, timeout=5)
        if rate_resp.status_code == 200:
            result["exchange_rate"] = rate_resp.json().get("rates", {}).get("CNY", 7.25)
    except: pass

    usd_price = 0.0
    
    # ==============================
    # 🌍 源 1: Yahoo Finance (全球最快, 推荐)
    # ==============================
    try:
        # HG=F 是铜期货 (Copper Futures), 单位通常是 USD/Lbs (磅)
        # 1 吨 = 2204.62 磅
        yahoo_url = "https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1d&range=1d"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(yahoo_url, headers=headers, timeout=10) # 10秒超时
        
        if resp.status_code == 200:
            data = resp.json()
            meta = data['chart']['result'][0]['meta']
            current_price_lbs = meta['regularMarketPrice'] # 美元/磅
            
            if current_price_lbs > 0:
                # 换算为 美元/吨
                usd_price = current_price_lbs * 2204.62
                result["USD"]["source"] = "Yahoo Finance (Global)"
                result["CNY"]["source"] = "Calculated"
                print(f"✅ Yahoo成功: ${usd_price:.2f}", end=" ")
    except Exception as e:
        print(f"[Yahoo失败] ", end="")

    # ==============================
    # 🇨🇳 源 2: 东方财富 (如果Yahoo失败)
    # ==============================
    if usd_price == 0:
        try:
            # 增加 verify=False 忽略证书错误，增加 timeout=15 防止断连
            em_url = "https://push2.eastmoney.com/api/qt/stock/get?secid=113.cu00&fields=f43"
            headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://quote.eastmoney.com/"}
            
            resp = requests.get(em_url, headers=headers, timeout=15, verify=False)
            
            if resp.status_code == 200:
                data = resp.json()
                if data.get("data") and data["data"].get("f43"):
                    cny_val = float(data["data"]["f43"])
                    if cny_val > 0:
                        usd_price = cny_val / result["exchange_rate"]
                        result["CNY"]["price"] = cny_val
                        result["CNY"]["source"] = "东方财富 (EastMoney)"
                        result["USD"]["source"] = "Calculated"
                        print(f"✅ 东财成功: ¥{cny_val}", end=" ")
        except Exception as e:
            print(f"[东财超时] ", end="")

    # --- 结算与兜底 ---
    if usd_price > 0:
        # 如果是从 Yahoo 拿的美元，算回人民币
        if result["CNY"]["price"] == 0:
            result["CNY"]["price"] = round(usd_price * result["exchange_rate"], 2)
        # 如果是从东财拿的人民币，算回美元
        if result["USD"]["price"] == 0:
            result["USD"]["price"] = round(usd_price, 2)
            
        print("-> 完成")
    else:
        print("❌ 全部失败 -> 启用模拟")
        usd_price = 9400.0 + random.randint(-50, 50)
        result["USD"]["price"] = round(usd_price, 2)
        result["CNY"]["price"] = round(usd_price * result["exchange_rate"], 2)
        result["USD"]["source"] = "Simulated (Fallback)"
        result["CNY"]["source"] = "Simulated (Fallback)"

    return result

# --- 定时任务 ---
def job_fetch_copper_price():
    data = get_realtime_copper_prices()
    db = SessionLocal()
    try:
        new_record = CopperPrice(
            price_cny=data["CNY"]["price"],
            price_usd=data["USD"]["price"],
            exchange_rate=data["exchange_rate"],
            source=data["USD"]["source"] if "Yahoo" in data["USD"]["source"] else data["CNY"]["source"]
        )
        db.add(new_record)
        db.commit()
    except Exception: pass
    finally: db.close()

# --- 生命周期 ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    scheduler = BackgroundScheduler()
    scheduler.add_job(job_fetch_copper_price, 'interval', hours=1)
    scheduler.start()
    
    # 初次启动立即执行
    db = SessionLocal()
    if db.query(CopperPrice).count() == 0:
        job_fetch_copper_price()
    db.close()
    
    yield
    scheduler.shutdown()

app = FastAPI(title="WebCable API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛠️ 修复日志报错：屏蔽 /c_hello 请求
@app.get("/c_hello")
async def dummy_hello(asker: str = None):
    return {"status": "ok", "msg": "Log silencer"}

@app.get("/")
async def root():
    return {"message": "System is running"}

# --- 业务接口 ---
@app.get("/api/v1/market/copper")
async def get_copper_price_api(db: Session = Depends(get_db)):
    latest = db.query(CopperPrice).order_by(CopperPrice.timestamp.desc()).first()
    if not latest:
        # 数据库空，临时抓取
        data = get_realtime_copper_prices()
        return {
            "CNY": data["CNY"], "USD": data["USD"], 
            "trends": {"hourly_change_percent": 0, "daily_change_percent": 0},
            "updated_at": data["updated"]
        }

    now = datetime.now()
    record_1h = db.query(CopperPrice).filter(CopperPrice.timestamp <= now - timedelta(hours=1)).order_by(CopperPrice.timestamp.desc()).first()
    record_24h = db.query(CopperPrice).filter(CopperPrice.timestamp <= now - timedelta(days=1)).order_by(CopperPrice.timestamp.desc()).first()

    def calc_change(current, old_record):
        if not old_record or old_record.price_usd == 0: return 0.0
        return round(((current - old_record.price_usd) / old_record.price_usd) * 100, 2)

    return {
        "CNY": {"price": round(latest.price_cny, 2), "symbol": "¥", "source": "Calculated" if "Yahoo" in latest.source else latest.source},
        "USD": {"price": round(latest.price_usd, 2), "symbol": "$", "source": latest.source},
        "exchange_rate": latest.exchange_rate,
        "trends": {
            "hourly_change_percent": calc_change(latest.price_usd, record_1h),
            "daily_change_percent": calc_change(latest.price_usd, record_24h)
        },
        "updated_at": latest.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/api/v1/calculate/sizing", response_model=CableCalcResponse)
async def calculate_cable_sizing(request: CableCalcRequest, db: Session = Depends(get_db)):
    # 1. 计算电流 (传入 PF)
    amps = ElectricalCalculator.calculate_current(
        request.power, request.power_unit, request.voltage_type, request.power_factor
    )
    
    # 2. 智能选型 (传入所有环境参数)
    selection = ElectricalCalculator.smart_select_cable(
        db, 
        current=amps, 
        material=request.material, 
        cable_type=request.cable_type,
        distance=request.distance,
        voltage=request.voltage_type,
        max_drop=request.max_voltage_drop,
        ambient_temp=request.temperature,
        install_factor=request.installation_factor # 新参数
    )
    
    # 3. MCB 推荐
    mcb_val = math.ceil(amps * 1.2)
    standard_mcb = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400]
    final_mcb = next((x for x in standard_mcb if x >= mcb_val), mcb_val)
    
    # 安全提示
    safe_limit = selection["safe_ampacity"]
    if safe_limit > 0 and final_mcb > safe_limit:
        mcb_msg = f"{final_mcb}A (⚠️警告: 开关大于电缆载流 {safe_limit}A)"
    else:
        mcb_msg = f"{final_mcb}A"
    
    return CableCalcResponse(
        current_amps=amps,
        recommended_size=selection["size"],
        voltage_drop_percent=selection["drop"],
        mcb_rating=mcb_msg,
        selection_reason=selection["reason"],
        safe_ampacity=selection["safe_ampacity"]
    )

@app.post("/api/v1/check/fake", response_model=AntiFakeResponse)
async def check_fake_cable(request: AntiFakeRequest, db: Session = Depends(get_db)):
    result = ElectricalCalculator.check_fake(db, request.nominal_size, request.measured_weight)
    spec = db.query(CableSpec).filter(CableSpec.size == request.nominal_size, CableSpec.insulation == 'bv', CableSpec.material == 'cu').first()
    std_weight = spec.weight_per_100m if spec else 0.0
    return AntiFakeResponse(is_pass=result.get("pass", False), standard_weight=std_weight, diff_percent=round(((request.measured_weight - std_weight) / std_weight) * 100, 2) if std_weight else 0, message=result["msg"], risk_level=result["risk"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)