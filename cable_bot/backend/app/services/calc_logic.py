# backend/app/services/calc_logic.py
from sqlalchemy.orm import Session
from app.models.tables import CableSpec

class ElectricalCalculator:
    
    @staticmethod
    def calculate_current(power: float, unit: str, voltage: str) -> float:
        """根据功率计算电流 (纯数学逻辑，无需查库)"""
        # 1. 统一转换为 Amps
        if unit == "amps":
            return power
            
        # 转换 HP -> kW
        kw_val = power * 0.746 if unit == "hp" else power
        
        # 计算电流 I = P / (V * PF * 1.732)
        pf = 0.85 # 功率因数假设
        
        if voltage == "380v":
            return round((kw_val * 1000) / (380 * 1.732 * pf), 2)
        else: # 220v
            return round((kw_val * 1000) / (220 * pf), 2)

    @staticmethod
    def select_cable(db: Session, current: float, material: str, cable_type: str) -> str:
        """查数据库选择线径"""
        # 查询符合材料和型号的所有规格，按载流量升序排列
        specs = db.query(CableSpec).filter(
            CableSpec.material == material,
            CableSpec.insulation == cable_type
        ).order_by(CableSpec.ampacity).all()

        # 找到第一个大于计算电流的规格
        for spec in specs:
            if spec.ampacity >= current:
                return spec.size
        
        return "Over Limit (>Max)"

    @staticmethod
    def calculate_voltage_drop(current: float, distance: float, size_str: str, material: str, voltage: str) -> float:
        """计算压降百分比 (纯数学逻辑)"""
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
    def check_fake(db: Session, size: str, measured: float, cable_type: str = 'bv') -> dict:
        """防伪检测逻辑 (查数据库标准重量)"""
        # 从数据库获取标准重量
        # 目前主要针对 BV线 (单芯) 和 铜线 (Cu) 做防伪检测
        spec = db.query(CableSpec).filter(
            CableSpec.size == size, 
            CableSpec.insulation == cable_type, 
            CableSpec.material == 'cu'          
        ).first()

        if not spec or not spec.weight_per_100m:
            return {"pass": False, "risk": "warning", "msg": "规格库缺失或无标准数据"}

        std = spec.weight_per_100m
        
        # 允许误差范围
        ratio = measured / std
        
        if ratio >= 0.95:
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
