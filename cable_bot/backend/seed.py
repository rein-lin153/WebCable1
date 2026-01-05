import sys
import os

# 将当前目录加入 Python 路径，确保能导入 app 模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import SessionLocal, engine, Base
from app.models.tables import CableSpec

# --- 原始数据 (来自 calc_logic.py) ---
# 我们把数据直接复制过来，作为初始化的源数据
AMPACITY_DB = {
    "cu": {
        "bv": {  # PVC
            "1.5": 17, "2.5": 24, "4.0": 32, "6.0": 40, "10": 55, "16": 75, "25": 100
        },
        "yjv": { # XLPE
            "1.5": 20, "2.5": 28, "4.0": 38, "6.0": 49, "10": 68, "16": 91, "25": 125, 
            "35": 155, "50": 185, "70": 240, "95": 285
        }
    }
}

WEIGHT_STD_DB = {
    "1.5": 2.0,
    "2.5": 3.1,
    "4.0": 4.6,
    "6.0": 6.8
}

def init_db():
    print("🔄 开始初始化数据库...")
    
    # 1. 确保表结构存在
    Base.metadata.create_all(bind=engine)
    
    # 2. 获取数据库会话
    db = SessionLocal()
    
    try:
        # 3. 清空现有数据 (防止重复)
        print("🗑️ 清理旧数据...")
        db.query(CableSpec).delete()
        db.commit()
        
        # 4. 转换并写入新数据
        print("💾 正在写入新数据...")
        count = 0
        
        # 遍历材质 (cu)
        for material, ins_types in AMPACITY_DB.items():
            # 遍历绝缘类型 (bv, yjv)
            for insulation, sizes in ins_types.items():
                # 遍历规格 (1.5, 2.5...)
                for size, ampacity in sizes.items():
                    
                    # 尝试匹配重量数据 (如果没有则为 None)
                    weight = WEIGHT_STD_DB.get(size)
                    
                    # 创建数据库对象
                    cable = CableSpec(
                        material=material,
                        insulation=insulation,
                        size=size,
                        ampacity=float(ampacity),
                        weight_per_100m=float(weight) if weight else None
                    )
                    
                    db.add(cable)
                    count += 1
        
        # 5. 提交事务
        db.commit()
        print(f"✅ 成功! 已写入 {count} 条线缆规格数据。")
        print("🚀 数据库 cable_expert.db 已准备就绪。")
        
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()