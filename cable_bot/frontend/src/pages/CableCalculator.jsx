import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap, AlertTriangle, CheckCircle, RotateCcw, Thermometer, Settings2, Info } from 'lucide-react';
import { calculateCable } from '../services/api'; //

const CableCalculator = ({ onBack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false); // 控制高级选项折叠
  
  const [formData, setFormData] = useState({
    power: '',
    power_unit: 'kw',     
    voltage_type: '220v', 
    distance: 50,         
    material: 'cu',       
    cable_type: 'yjv',
    // 新增高级参数 (默认匹配后端)
    temperature: 40,
    max_voltage_drop: 5
  });

  const handleCalculate = async () => {
    if (!formData.power) return;
    setLoading(true);
    
    try {
      const payload = {
        power: parseFloat(formData.power),
        power_unit: formData.power_unit,
        voltage_type: formData.voltage_type,
        distance: parseFloat(formData.distance),
        material: formData.material,
        cable_type: formData.cable_type,
        // 传递新参数
        temperature: parseFloat(formData.temperature),
        max_voltage_drop: parseFloat(formData.max_voltage_drop)
      };
      
      const data = await calculateCable(payload);
      setResult(data);
      
      // 平滑滚动到底部
      setTimeout(() => {
        document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      alert("Error: Cannot connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ 
      ...formData, 
      power: '', 
      distance: 50, // 重置距离
      temperature: 40, 
      max_voltage_drop: 5 
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      
      {/* 顶部导航 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200">
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">{t('calc_title')}</h2>
        </div>
        <button onClick={handleReset} className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-50">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* 表单区域 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        
        {/* 1. 材质与类型 */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conductor</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['cu', 'al'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setFormData({...formData, material: m})}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                formData.material === m 
                                ? m === 'cu' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'bg-slate-300 text-slate-800 shadow-sm'
                                : 'text-slate-400'
                            }`}
                        >
                            {m === 'cu' ? 'Cu' : 'Al'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insulation</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['yjv', 'bv'].map((type) => (
                     <button
                        key={type}
                        onClick={() => setFormData({...formData, cable_type: type})}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all uppercase ${
                            formData.cable_type === type 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-400'
                        }`}
                    >
                        {type}
                    </button>
                  ))}
                </div>
            </div>
        </div>

        {/* 2. 电压选择 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voltage System</span>
          <div className="grid grid-cols-2 gap-3">
            {['220v', '380v'].map((v) => (
              <button
                key={v}
                onClick={() => setFormData({...formData, voltage_type: v})}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                  formData.voltage_type === v 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                <Zap size={16} className={formData.voltage_type === v ? 'fill-current' : ''} />
                <span>{v === '220v' ? '1-Phase' : '3-Phase'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 功率输入 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('input_power')}</span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={formData.power}
              onChange={(e) => setFormData({...formData, power: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-24 py-4 text-3xl font-black text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
            />
            <div className="absolute right-2 top-2 bottom-2 bg-white rounded-xl border border-slate-100 flex items-center px-1">
              <select
                value={formData.power_unit}
                onChange={(e) => setFormData({...formData, power_unit: e.target.value})}
                className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 py-0 pl-2 pr-6 cursor-pointer outline-none"
              >
                <option value="kw">kW</option>
                <option value="hp">HP</option>
                <option value="amps">A</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. 距离输入 (已修改: 替换滑块为直接输入框) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('input_distance')} (Meters)</span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Length"
              value={formData.distance}
              onChange={(e) => setFormData({...formData, distance: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-16 py-4 text-3xl font-black text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                m
            </div>
          </div>
        </div>

        {/* 5. 高级参数 (可折叠) */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center space-x-2 text-slate-600">
                    <Settings2 size={16} />
                    <span className="text-xs font-bold uppercase">Advanced Settings</span>
                </div>
                <span className="text-xs text-blue-600 font-bold">{showAdvanced ? 'Hide' : 'Show'}</span>
            </button>
            
            {showAdvanced && (
                <div className="p-4 grid grid-cols-2 gap-4 bg-white animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Temperature (°C)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formData.temperature}
                                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 font-bold text-slate-700 text-sm"
                            />
                            <Thermometer size={14} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Max Drop (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formData.max_voltage_drop}
                                onChange={(e) => setFormData({...formData, max_voltage_drop: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 font-bold text-slate-700 text-sm"
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                        </div>
                    </div>
                    <p className="col-span-2 text-[10px] text-slate-400 flex items-center">
                        <Info size={12} className="mr-1" />
                        柬埔寨夏季高温建议设为 40°C，长距离允许压降建议 5-7%
                    </p>
                </div>
            )}
        </div>

        {/* 计算按钮 */}
        <button
          onClick={handleCalculate}
          disabled={loading || !formData.power}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 flex justify-center items-center space-x-2 transition-all active:scale-95 ${
            loading || !formData.power 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? <span className="animate-spin text-xl">⏳</span> : t('btn_calculate')}
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div id="result-card" className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 顶部状态条 */}
            <div className={`h-2 w-full ${result.voltage_drop_percent > formData.max_voltage_drop ? 'bg-red-500' : 'bg-green-500'}`} />
            
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Result Report</span>
                        <h3 className={`text-lg font-bold mt-1 ${result.voltage_drop_percent > formData.max_voltage_drop ? 'text-red-600' : 'text-slate-800'}`}>
                            {result.voltage_drop_percent > formData.max_voltage_drop ? '⚠️ Drop Limit Exceeded' : '✅ Standard Compliant'}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-full ${result.voltage_drop_percent > formData.max_voltage_drop ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {result.voltage_drop_percent > formData.max_voltage_drop ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                    </div>
                </div>

                {/* 选型理由 (新功能) */}
                {result.selection_reason && (
                   <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start space-x-2">
                      <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-800 font-medium leading-relaxed">
                        {result.selection_reason}
                      </p>
                   </div>
                )}

                {/* 核心推荐结果 */}
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 mb-6 relative">
                    {/* 温度标签 */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                        <Thermometer size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-600">{formData.temperature}°C</span>
                    </div>

                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">{t('result_recommend')}</p>
                    <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">
                            {result.recommended_size}
                        </span>
                        <span className="text-xl text-slate-400 font-bold">mm²</span>
                    </div>
                    
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-500">
                       {formData.cable_type.toUpperCase()} / {formData.material === 'cu' ? 'Copper' : 'Alum'}
                    </div>
                </div>

                {/* 详细数据网格 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Load Current</span>
                        <p className="text-lg font-bold text-slate-700">{result.current_amps} A</p>
                    </div>
                    {/* 新增: 安全载流量 */}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Safe Cap. (@{formData.temperature}°C)</span>
                        <p className="text-lg font-bold text-green-600">{result.safe_ampacity} A</p>
                    </div>

                    <div className="col-span-2 p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended Breaker (MCB)</span>
                        <div className="flex items-center justify-between">
                             <p className="text-lg font-bold text-slate-700">{result.mcb_rating}</p>
                             <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">Rule: IB &lt; In &lt; Iz</span>
                        </div>
                    </div>

                    <div className="col-span-2 p-3 bg-white border border-slate-100 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Voltage Drop</span>
                            <span className={`text-xs font-bold ${result.voltage_drop_percent > formData.max_voltage_drop ? 'text-red-500' : 'text-green-600'}`}>
                                {result.voltage_drop_percent}% (Limit: {formData.max_voltage_drop}%)
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full ${result.voltage_drop_percent > formData.max_voltage_drop ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(result.voltage_drop_percent * 10, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CableCalculator;