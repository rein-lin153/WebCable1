import math

# --- 模拟数据库 (实际项目中可移至JSON文件或真实DB) ---
# 简化版 IEC 60364 参考载流量 (Amps) - 30°C 空气敷设
# Key: Size (mm2), Value: Amps
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

# 常见电缆标准重量 (Kg/100m) - 参考国标/IEC
# 这里的阈值很关键，要能识别出“铜包铝”或“亏方”
WEIGHT_STD_DB = {
    "1.5": 2.0,   # 1.5平方大概重量
    "2.5": 3.1,   # 2.5平方大概重量
    "4.0": 4.6,
    "6.0": 6.8
}

class ElectricalCalculator:
    
    @staticmethod
    def calculate_current(power: float, unit: str, voltage: str) -> float:
        """根据功率计算电流"""
        # 1. 统一转换为 Amps
        current = 0.0
        
        if unit == "amps":
            return power
            
        # 转换 HP -> kW
        kw_val = power * 0.746 if unit == "hp" else power
        
        # 计算电流 I = P / (V * PF * 1.732)
        pf = 0.85 # 功率因数假设
        
        if voltage == "380v":
            current = (kw_val * 1000) / (380 * 1.732 * pf)
        else: # 220v
            current = (kw_val * 1000) / (220 * pf)
            
        return round(current, 2)

    @staticmethod
    def select_cable(current: float, material: str, cable_type: str) -> str:
        """查表选择线径"""
        table = AMPACITY_DB.get(material, {}).get(cable_type, {})
        
        # 简单的查表逻辑：找到第一个大于计算电流的规格
        for size, capacity in table.items():
            if capacity >= current:
                return size
        
        return "Over Limit (>95mm²)"

    @staticmethod
    def calculate_voltage_drop(current: float, distance: float, size_str: str, material: str, voltage: str) -> float:
        """计算压降百分比"""
        # 简化电阻率 (Ohm/m/mm2): 铜 0.0175, 铝 0.028
        rho = 0.0175 if material == "cu" else 0.028
        
        try:
            size = float(size_str)
        except ValueError:
            return 0.0 # 无法计算
            
        # V_drop = (Root3 * I * L * rho) / A  (3-phase)
        # V_drop = (2 * I * L * rho) / A      (1-phase)
        
        factor = 1.732 if voltage == "380v" else 2.0
        v_base = 380 if voltage == "380v" else 220
        
        v_drop_val = (factor * current * distance * rho) / size
        percent = (v_drop_val / v_base) * 100
        
        return round(percent, 2)

    @staticmethod
    def check_fake(size: str, measured: float) -> dict:
        """防伪检测逻辑"""
        std = WEIGHT_STD_DB.get(size)
        if not std:
            return {"status": "unknown", "msg": "规格不在数据库中"}
            
        # 允许误差范围 (例如 -5% 以内算合格，超过就是非标)
        threshold = 0.95 
        ratio = measured / std
        
        if ratio >= threshold:
            return {
                "pass": True, 
                "risk": "safe", 
                "msg": "✅ 正品标准 (IEC Standard Compliance)"
            }
        elif ratio >= 0.85:
            return {
                "pass": False, 
                "risk": "warning", 
                "msg": "⚠️ 疑似非标线 (Underweight Risk)"
            }
        else:
            return {
                "pass": False, 
                "risk": "danger", 
                "msg": "🚫 极高风险：铜包铝或严重亏方 (Fake/CCA Detected)"
            }