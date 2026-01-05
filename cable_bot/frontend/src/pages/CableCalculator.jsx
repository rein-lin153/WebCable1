import React, { useState } from 'react';
import { ArrowLeft, Calculator, Zap, AlertTriangle, ShoppingCart, CheckCircle } from 'lucide-react';
import { calculateCable } from '../services/api';

const CableCalculator = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    power: '',
    power_unit: 'kw',     // kw, hp, amps
    voltage_type: '220v', // 220v, 380v
    distance: 50,         // meters
    material: 'cu',       // cu, al
    cable_type: 'yjv'     // yjv, bv
  });

  const handleCalculate = async () => {
    if (!formData.power) return alert("请输入功率/电流数值");
    
    setLoading(true);
    setResult(null);
    
    try {
      // 构造符合后端 Pydantic 模型的数据
      const payload = {
        power: parseFloat(formData.power),
        power_unit: formData.power_unit,
        voltage_type: formData.voltage_type,
        distance: parseFloat(formData.distance),
        material: formData.material,
        cable_type: formData.cable_type
      };

      const data = await calculateCable(payload);
      setResult(data);
    } catch (error) {
      alert("计算失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* 顶部导航 */}
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">电缆选型计算器</h2>
      </div>

      {/* --- 输入表单区域 --- */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        
        {/* 1. 电压选择 (Segmented Control) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">系统电压 / Voltage</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['220v', '380v'].map((v) => (
              <button
                key={v}
                onClick={() => setFormData({...formData, voltage_type: v})}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.voltage_type === v 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === '220v' ? '单相 220V' : '三相 380V'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 功率输入 (Input + Unit Toggle) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">负载功率 / Power Load</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="0.0"
              value={formData.power}
              onChange={(e) => setFormData({...formData, power: e.target.value})}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.power_unit}
              onChange={(e) => setFormData({...formData, power_unit: e.target.value})}
              className="bg-slate-100 border-none rounded-xl px-3 font-medium text-slate-700 focus:ring-0"
            >
              <option value="kw">kW (千瓦)</option>
              <option value="hp">HP (马力)</option>
              <option value="amps">Amps (电流)</option>
            </select>
          </div>
        </div>

        {/* 3. 距离 (Slider + Number) */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">线路长度 / Distance</label>
            <span className="text-xs font-bold text-blue-600">{formData.distance} 米</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            value={formData.distance}
            onChange={(e) => setFormData({...formData, distance: e.target.value})}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* 4. 电缆类型 (Dropdown) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">电缆类型 / Cable Type</label>
          <select
            value={formData.cable_type}
            onChange={(e) => setFormData({...formData, cable_type: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700"
          >
            <option value="yjv">YJV (交联聚乙烯 - 推荐)</option>
            <option value="bv">BV (聚氯乙烯 - 家装)</option>
          </select>
        </div>

        {/* 计算按钮 */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex justify-center items-center space-x-2"
        >
          {loading ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <>
              <Calculator size={20} />
              <span>开始计算 / Calculate</span>
            </>
          )}
        </button>
      </div>

      {/* --- 结果展示区域 (发票/报告单风格) --- */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300 mb-20">
          {/* 结果标题 */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculation Report</span>
            <CheckCircle size={16} className="text-green-500" />
          </div>

          <div className="p-5 space-y-6">
            
            {/* 核心结论：推荐线径 */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">推荐电缆规格 (Recommended)</p>
              <div className="text-4xl font-black text-blue-600 tracking-tight">
                {result.recommended_size} <span className="text-xl text-slate-400 font-normal">mm²</span>
              </div>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {formData.cable_type.toUpperCase()} / {formData.material === 'cu' ? 'Copper' : 'Aluminum'}
              </div>
            </div>

            {/* 详细数据网格 */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-dashed border-slate-200 py-4">
              
              <div className="space-y-1">
                <span className="text-xs text-slate-400">计算电流 (Amps)</span>
                <p className="font-mono font-bold text-slate-700">{result.current_amps} A</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">断路器 (MCB)</span>
                <p className="font-mono font-bold text-slate-700">{result.mcb_rating}</p>
              </div>

              <div className="space-y-1 col-span-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">电压降 (Voltage Drop)</span>
                  <span className={`text-xs font-bold ${result.voltage_drop_percent > 5 ? 'text-red-500' : 'text-green-600'}`}>
                    {result.voltage_drop_percent}%
                  </span>
                </div>
                {/* 进度条可视化压降 */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${result.voltage_drop_percent > 5 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min(result.voltage_drop_percent * 10, 100)}%` }}
                  ></div>
                </div>
                {result.voltage_drop_percent > 5 && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center">
                    <AlertTriangle size={10} className="mr-1" /> 压降过大，建议加大线径
                  </p>
                )}
              </div>
            </div>

            {/* 底部 CTA：引导购买 */}
            <div className="pt-2">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-green-100">
                <ShoppingCart size={18} />
                <span>联系工厂订购 (Order Now)</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                *计算结果仅供参考，请以工程师最终确认为准
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CableCalculator;