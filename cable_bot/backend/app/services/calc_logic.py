from sqlalchemy.orm import Session
from app.models.tables import CableSpec

# 温度修正系数表 (IEC 60364)
TEMP_CORRECTION_FACTORS = {
    "bv": { 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 },
    "yjv": { 30: 1.00, 35: 0.94, 40: 0.91, 45: 0.87, 50: 0.82 }
}

class ElectricalCalculator:
    
    @staticmethod
    def calculate_current(power: float, unit: str, voltage: str, pf: float = 0.85) -> float:
        """根据功率和PF计算电流"""
        if unit == "amps": return power
        
        kw_val = power * 0.746 if unit == "hp" else power
        
        # 使用传入的 pf (不再硬编码 0.85)
        if voltage == "380v":
            # I = P / (1.732 * U * PF)
            return round((kw_val * 1000) / (380 * 1.732 * pf), 2)
        else:
            # I = P / (U * PF)
            return round((kw_val * 1000) / (220 * pf), 2)

    @staticmethod
    def get_temp_factor(cable_type: str, temp: float) -> float:
        """获取温度降容系数"""
        factors = TEMP_CORRECTION_FACTORS.get(cable_type, TEMP_CORRECTION_FACTORS["bv"])
        check_temps = [30, 35, 40, 45, 50]
        selected_temp = 30
        for t in check_temps:
            if temp <= t:
                selected_temp = t
                break
            selected_temp = t
        return factors.get(selected_temp, 1.0)

    @staticmethod
    def calculate_voltage_drop_pure(current: float, distance: float, size_str: str, material: str, voltage: str) -> float:
        try:
            size = float(size_str)
        except ValueError:
            return 999.0
        
        rho = 0.0175 if material == "cu" else 0.028
        factor = 1.732 if voltage == "380v" else 2.0
        v_base = 380 if voltage == "380v" else 220
        
        return ((factor * current * distance * rho) / size / v_base) * 100

    @staticmethod
    def smart_select_cable(db: Session, current: float, material: str, cable_type: str, 
                           distance: float, voltage: str, 
                           max_drop: float, ambient_temp: float,
                           install_factor: float) -> dict:
        """
        V2.0 智能选型: 综合考虑 温度 + 敷设方式
        """
        # 1. 计算总降容系数 (温度系数 x 敷设系数)
        temp_factor = ElectricalCalculator.get_temp_factor(cable_type, ambient_temp)
        total_factor = temp_factor * install_factor
        
        # 目标载流量 = 负载电流 / 总系数
        # 例: 穿管(0.8) + 40度(0.87) = 0.696。 负载30A，则需要电缆额定值 > 43A
        target_ampacity = current / total_factor
        
        specs = db.query(CableSpec).filter(
            CableSpec.material == material,
            CableSpec.insulation == cable_type
        ).order_by(CableSpec.ampacity).all()
        
        selected_spec = None
        final_drop = 0.0
        upgrade_count = 0
        
        for spec in specs:
            # 校验 A: 载流量 (包含敷设和温度修正)
            if spec.ampacity < target_ampacity:
                continue
            
            # 校验 B: 压降
            drop = ElectricalCalculator.calculate_voltage_drop_pure(
                current, distance, spec.size, material, voltage
            )
            
            if drop <= max_drop:
                selected_spec = spec
                final_drop = drop
                break
            else:
                upgrade_count += 1
                continue
                
        if selected_spec:
            reason_parts = []
            if upgrade_count > 0:
                reason_parts.append(f"长距离压降(>{max_drop}%)")
            if install_factor < 1.0:
                reason_parts.append(f"穿管/暗敷(x{install_factor})")
            if temp_factor < 1.0:
                reason_parts.append(f"高温环境(x{temp_factor})")
                
            reason = "✅ 标准匹配"
            if reason_parts:
                reason = f"⚠️ 已自动放大规格，考虑: {' + '.join(reason_parts)}"

            return {
                "size": selected_spec.size,
                "drop": round(final_drop, 2),
                "reason": reason,
                "safe_ampacity": round(selected_spec.ampacity * total_factor, 1) # 实际现场承载力
            }
        else:
            return {
                "size": "Out of Range",
                "drop": 0.0,
                "reason": "❌ 超出数据库范围",
                "safe_ampacity": 0
            }
    
    @staticmethod
    def check_fake(db, size, measured, cable_type='bv'):
        # 保持原有的防伪逻辑
        spec = db.query(CableSpec).filter(CableSpec.size==size, CableSpec.insulation==cable_type, CableSpec.material=='cu').first()
        if not spec or not spec.weight_per_100m: return {"pass": False, "risk": "warning", "msg": "无数据"}
        ratio = measured / spec.weight_per_100m
        if ratio >= 0.95: return {"pass": True, "risk": "safe", "msg": "✅ 正品标准"}
        elif ratio >= 0.85: return {"pass": False, "risk": "warning", "msg": "⚠️ 疑似非标"}
        else: return {"pass": False, "risk": "danger", "msg": "🚫 极高风险"}