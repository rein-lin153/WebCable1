import sys
import os

# 将当前目录加入 Python 路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import SessionLocal, engine, Base
from app.models.tables import CableSpec

# --- 工业级全规格数据库 (IEC Standard based) ---
# 载流量数据 (Amps) - 参考 IEC 60364-5-52
# Cu (铜): 导电率好
# Al (铝): 导电率差，一般从 10mm² 开始使用
AMPACITY_DB = {
    "cu": {
        "bv": {  # PVC 绝缘 (耐温 70°C)
            "1.5": 21, "2.5": 28, "4.0": 37, "6.0": 48, 
            "10": 66, "16": 88, "25": 117, "35": 144, 
            "50": 175, "70": 222, "95": 269, "120": 312, 
            "150": 355, "185": 409, "240": 485
        },
        "yjv": { # XLPE 绝缘 (耐温 90°C) - 载流量更大
            "1.5": 24, "2.5": 33, "4.0": 43, "6.0": 56, 
            "10": 78, "16": 104, "25": 139, "35": 171, 
            "50": 209, "70": 266, "95": 323, "120": 376, 
            "150": 430, "185": 497, "240": 593, "300": 685, "400": 810
        }
    },
    "al": {
        "bv": { # 铝 BV 线 (较少见，但支持)
            "2.5": 21, "4.0": 28, "6.0": 36, "10": 50, 
            "16": 67, "25": 88, "35": 109, "50": 131, 
            "70": 167, "95": 204, "120": 238
        },
        "yjv": { # 铝 YJV (常用工程线)
            "10": 60, "16": 80, "25": 107, "35": 132, 
            "50": 162, "70": 208, "95": 255, "120": 298, 
            "150": 340, "185": 397, "240": 475, "300": 548, "400": 653
        }
    }
}

# 估算标准重量 (kg/100m) - 用于防伪检测
WEIGHT_STD_DB = {
    "1.5": 2.1, "2.5": 3.3, "4.0": 4.9, "6.0": 7.0,
    "10": 11.5, "16": 17.8, "25": 27.5, "35": 38.0, 
    "50": 52.0, "70": 73.5, "95": 101.0, "120": 126.0,
    "150": 156.0, "185": 195.0, "240": 255.0
}

def init_db():
    print("🔄 开始扩充数据库 (工业版 V2.0)...")
    
    # 1. 建表
    Base.metadata.create_all(bind=engine)
    
    # 2. 获取会话
    db = SessionLocal()
    
    try:
        # 3. 清空旧数据
        print("🗑️ 清理旧规格数据...")
        db.query(CableSpec).delete()
        db.commit()
        
        # 4. 写入全量数据
        count = 0
        print("💾 正在写入 Cu/Al 全规格数据...")
        
        for material, ins_types in AMPACITY_DB.items():
            for insulation, sizes in ins_types.items():
                for size, ampacity in sizes.items():
                    
                    weight = WEIGHT_STD_DB.get(size) if material == 'cu' else None
                    
                    cable = CableSpec(
                        material=material,
                        insulation=insulation,
                        size=size,
                        ampacity=float(ampacity),
                        weight_per_100m=float(weight) if weight else None
                    )
                    db.add(cable)
                    count += 1
        
        db.commit()
        print(f"✅ 成功! 已写入 {count} 条工业级规格数据 (含 1.5mm² - 400mm²)。")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()