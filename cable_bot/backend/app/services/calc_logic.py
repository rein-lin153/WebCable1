# backend/app/services/calc_logic.py
from sqlalchemy.orm import Session
from app.models.tables import CableSpec

# 温度修正系数表 (参考 IEC 60364-5-52)
# 基准温度: 空气中 30°C
TEMP_CORRECTION_FACTORS = {
    "bv": {  # PVC 绝缘
        30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71
    },
    "yjv": { # XLPE 绝缘 (耐热更好)
        30: 1.00, 35: 0.94, 40: 0.91, 45: 0.87, 50: 0.82
    }
}

class ElectricalCalculator:
    
    @staticmethod
    def calculate_current(power: float, unit: str, voltage: str) -> float:
        """根据功率计算电流"""
        if unit == "amps": return power
        
        # 1. 转换 HP -> kW
        kw_val = power * 0.746 if unit == "hp" else power
        
        # 2. 计算电流
        # 380V 三相: I = P / (1.732 * U * PF)
        # 220V 单相: I = P / (U * PF)
        pf = 0.85 
        if voltage == "380v":
            return round((kw_val * 1000) / (380 * 1.732 * pf), 2)
        else:
            return round((kw_val * 1000) / (220 * pf), 2)

    @staticmethod
    def get_temp_factor(cable_type: str, temp: float) -> float:
        """获取温度降容系数"""
        # 找到最接近的温度档位 (向上取整，安全起见)
        factors = TEMP_CORRECTION_FACTORS.get(cable_type, TEMP_CORRECTION_FACTORS["bv"])
        
        # 简单的档位匹配逻辑
        check_temps = [30, 35, 40, 45, 50]
        selected_temp = 30
        for t in check_temps:
            if temp <= t:
                selected_temp = t
                break
            selected_temp = t # 超过50度按50度算，或后续扩展
            
        return factors.get(selected_temp, 1.0)

    @staticmethod
    def calculate_voltage_drop_pure(current: float, distance: float, size_str: str, material: str, voltage: str) -> float:
        """纯数学计算压降 (独立出来供循环调用)"""
        try:
            size = float(size_str)
        except ValueError:
            return 999.0 
            
        rho = 0.0175 if material == "cu" else 0.028
        factor = 1.732 if voltage == "380v" else 2.0
        v_base = 380 if voltage == "380v" else 220
        
        v_drop_val = (factor * current * distance * rho) / size
        return (v_drop_val / v_base) * 100

    @staticmethod
    def smart_select_cable(db: Session, current: float, material: str, cable_type: str, 
                           distance: float, voltage: str, 
                           max_drop: float = 5.0, ambient_temp: float = 40.0) -> dict:
        """
        智能选型核心逻辑:
        1. 获取温度系数，计算所需最小载流量。
        2. 初选：满足载流量的最小电缆。
        3. 校验：计算压降。
        4. 迭代：如果压降超标，自动尝试大一号的电缆，直到合格。
        """
        
        # 1. 计算温度修正后的目标载流量
        # 例如: 负载 40A, 40度环境(系数0.87) -> 电缆额定载流量至少要 40 / 0.87 = 46A
        derating_factor = ElectricalCalculator.get_temp_factor(cable_type, ambient_temp)
        target_ampacity = current / derating_factor
        
        # 2. 从数据库获取所有规格 (按载流量从小到大排序)
        specs = db.query(CableSpec).filter(
            CableSpec.material == material,
            CableSpec.insulation == cable_type
        ).order_by(CableSpec.ampacity).all()
        
        selected_spec = None
        final_drop = 0.0
        upgrade_count = 0 # 记录升规次数
        
        # 3. 遍历规格进行“双重校验”
        for spec in specs:
            # 校验 A: 载流量是否足够 (热稳定)
            if spec.ampacity < target_ampacity:
                continue # 太细了，烧线风险，跳过
            
            # 校验 B: 压降是否合格
            drop = ElectricalCalculator.calculate_voltage_drop_pure(
                current, distance, spec.size, material, voltage
            )
            
            if drop <= max_drop:
                # 找到既满足载流量，又满足压降的线了！
                selected_spec = spec
                final_drop = drop
                break
            else:
                # 载流量够，但压降太大，继续看下一条更大的线
                upgrade_count += 1
                continue
                
        # 4. 构造返回结果
        if selected_spec:
            # 生成选型理由
            reason = "✅ 规格合适"
            if upgrade_count > 0:
                reason = f"⚠️ 因长距离压降(>{max_drop}%)，已自动放大 {upgrade_count} 档规格"
            elif derating_factor < 1.0:
                reason = f"🌡️ 已包含高温修正 ({ambient_temp}°C, 系数{derating_factor})"
            
            return {
                "size": selected_spec.size,
                "drop": round(final_drop, 2),
                "reason": reason,
                "safe_ampacity": round(selected_spec.ampacity * derating_factor, 1) # 修正后的实际承载力
            }
        else:
            return {
                "size": "Out of Range",
                "drop": 0.0,
                "reason": "❌ 负载过大或距离过长，超出数据库范围",
                "safe_ampacity": 0
            }

    @staticmethod
    def check_fake(db: Session, size: str, measured: float, cable_type: str = 'bv') -> dict:
        """防伪检测逻辑 (保持不变)"""
        spec = db.query(CableSpec).filter(
            CableSpec.size == size, 
            CableSpec.insulation == cable_type, 
            CableSpec.material == 'cu'          
        ).first()

        if not spec or not spec.weight_per_100m:
            return {"pass": False, "risk": "warning", "msg": "规格库缺失"}

        std = spec.weight_per_100m
        ratio = measured / std
        
        if ratio >= 0.95:
            return {"pass": True, "risk": "safe", "msg": "✅ 正品标准"}
        elif ratio >= 0.85:
            return {"pass": False, "risk": "warning", "msg": "⚠️ 疑似非标线"}
        else:
            return {"pass": False, "risk": "danger", "msg": "🚫 极高风险：铜包铝/亏方"}