import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap, AlertTriangle, CheckCircle, RotateCcw, Thermometer, Settings2, Info, Cable, Fan, Lightbulb, Box } from 'lucide-react';
import { calculateCable } from '../services/api';

const CableCalculator = ({ onBack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 预设配置
  const LOAD_TYPES = {
    motor: { label: "Motor/Inductive", pf: 0.8, icon: <Fan size={16}/> },
    general: { label: "General/Lighting", pf: 1.0, icon: <Lightbulb size={16}/> },
    mixed: { label: "Mixed Load", pf: 0.85, icon: <Zap size={16}/> }
  };

  const INSTALL_METHODS = {
    tray: { label: "Tray/Air (明装)", factor: 1.0 },
    conduit: { label: "Conduit (穿管/暗敷)", factor: 0.8 },
    buried: { label: "Direct Buried (直埋)", factor: 0.9 }
  };

  const [formData, setFormData] = useState({
    // 负载
    power: '',
    power_unit: 'kw',     
    voltage_type: '220v',
    load_type: 'mixed', // 默认混合
    power_factor: 0.85,
    
    // 环境
    distance: 50,
    install_method: 'tray', // 默认明装
    installation_factor: 1.0,
    temperature: 40,
    max_voltage_drop: 5,
    
    // 线缆
    material: 'cu',       
    cable_type: 'yjv',
  });

  // 当负载类型改变时，自动更新 PF
  const handleLoadTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      load_type: type,
      power_factor: LOAD_TYPES[type].pf
    }));
  };

  // 当敷设方式改变时，自动更新系数
  const handleInstallChange = (method) => {
    setFormData(prev => ({
      ...prev,
      install_method: method,
      installation_factor: INSTALL_METHODS[method].factor
    }));
  };

  const handleCalculate = async () => {
    if (!formData.power) return;
    setLoading(true);
    
    try {
      const payload = {
        power: parseFloat(formData.power),
        power_unit: formData.power_unit,
        voltage_type: formData.voltage_type,
        power_factor: parseFloat(formData.power_factor),
        
        distance: parseFloat(formData.distance),
        temperature: parseFloat(formData.temperature),
        installation_factor: parseFloat(formData.installation_factor),
        max_voltage_drop: parseFloat(formData.max_voltage_drop),
        
        material: formData.material,
        cable_type: formData.cable_type,
      };
      
      const data = await calculateCable(payload);
      setResult(data);
      setTimeout(() => {
        document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      alert("Backend Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      
      {/* 顶部 */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Pro Cable Selector</h2>
        </div>
        <button onClick={() => setResult(null)} className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-50">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="space-y-4">
        
        {/* === 板块 1: 负载特性 (Load) === */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center mb-4">
                <Zap size={16} className="mr-2 text-blue-600" /> 1. Load Characteristics
            </h3>
            
            <div className="space-y-4">
                {/* 功率输入 */}
                <div className="relative">
                    <input
                        type="number" inputMode="decimal" placeholder="0"
                        value={formData.power}
                        onChange={(e) => setFormData({...formData, power: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-24 py-3 text-2xl font-black text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <div className="absolute right-2 top-2 bottom-2 bg-white rounded-xl border border-slate-100 flex items-center px-1">
                        <select
                            value={formData.power_unit}
                            onChange={(e) => setFormData({...formData, power_unit: e.target.value})}
                            className="bg-transparent border-none text-sm font-bold text-slate-600 outline-none pr-6"
                        >
                            <option value="kw">kW</option>
                            <option value="hp">HP</option>
                            <option value="amps">A</option>
                        </select>
                    </div>
                </div>

                {/* 负载类型 & PF */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Load Type (Sets P.F.)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(LOAD_TYPES).map(([key, conf]) => (
                                <button
                                    key={key}
                                    onClick={() => handleLoadTypeChange(key)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                        formData.load_type === key 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                        : 'bg-slate-50 border-transparent text-slate-500'
                                    }`}
                                >
                                    {conf.icon}
                                    <span className="text-[10px] font-bold mt-1">{conf.label.split('/')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* 电压 */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['220v', '380v'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setFormData({...formData, voltage_type: v})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                formData.voltage_type === v ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
                            }`}
                        >
                            {v === '220v' ? '1-Phase (220V)' : '3-Phase (380V)'}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* === 板块 2: 敷设环境 (Environment) === */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center mb-4">
                <Box size={16} className="mr-2 text-amber-600" /> 2. Installation & Env
            </h3>
            
            <div className="space-y-4">
                {/* 距离 */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase absolute top-2 left-4">Route Length</label>
                    <input
                        type="number" inputMode="decimal"
                        value={formData.distance}
                        onChange={(e) => setFormData({...formData, distance: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pt-6 pb-2 px-4 font-bold text-slate-800 text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Meters</span>
                </div>

                {/* 敷设方式 */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                         <label className="text-xs font-bold text-slate-400 uppercase">Laying Method</label>
                         <span className="text-[10px] bg-amber-100 text-amber-800 px-2 rounded-full">
                            Factor: {formData.installation_factor}
                         </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(INSTALL_METHODS).map(([key, conf]) => (
                            <button
                                key={key}
                                onClick={() => handleInstallChange(key)}
                                className={`px-4 py-3 rounded-xl border text-left text-xs font-bold flex justify-between items-center transition-all ${
                                    formData.install_method === key 
                                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                                    : 'bg-slate-50 border-transparent text-slate-500'
                                }`}
                            >
                                <span>{conf.label}</span>
                                {formData.install_method === key && <CheckCircle size={14}/>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 温度 */}
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Thermometer size={18} className="text-slate-400" />
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Ambient Temp</label>
                        <input 
                            type="number" 
                            value={formData.temperature}
                            onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                            className="bg-transparent font-bold text-slate-700 w-full outline-none"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400">°C</span>
                </div>
            </div>
        </div>

        {/* === 板块 3: 线缆规格 (Spec) === */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center mb-4">
                <Cable size={16} className="mr-2 text-green-600" /> 3. Cable Spec
            </h3>
            <div className="flex space-x-3">
                 <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Material</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['cu', 'al'].map((m) => (
                            <button key={m} onClick={() => setFormData({...formData, material: m})}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md ${formData.material === m ? 'bg-white shadow-sm' : 'text-slate-400'}`}>
                                {m === 'cu' ? 'Copper' : 'Alum'}
                            </button>
                        ))}
                    </div>
                 </div>
                 <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Insulation</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['yjv', 'bv'].map((t) => (
                            <button key={t} onClick={() => setFormData({...formData, cable_type: t})}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md ${formData.cable_type === t ? 'bg-white shadow-sm' : 'text-slate-400'}`}>
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
        </div>

        {/* 计算按钮 */}
        <button
          onClick={handleCalculate}
          disabled={loading || !formData.power}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 flex justify-center items-center space-x-2 transition-all active:scale-95 ${
            loading || !formData.power ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white'
          }`}
        >
          {loading ? <span>Calculating...</span> : <span>Calculate Selection</span>}
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div id="result-card" className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className={`h-2 w-full ${result.voltage_drop_percent > formData.max_voltage_drop ? 'bg-red-500' : 'bg-green-500'}`} />
            <div className="p-6 space-y-6">
                
                {/* 推荐大字 */}
                <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Recommended Size</p>
                    <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-5xl font-black text-slate-900">{result.recommended_size}</span>
                        <span className="text-lg text-slate-500 font-bold">mm²</span>
                    </div>
                </div>

                {/* 选型理由 (关键User Thinking展示) */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex items-start space-x-2">
                        <Info size={16} className="text-blue-600 mt-0.5 shrink-0"/>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {result.selection_reason}
                        </p>
                    </div>
                </div>

                {/* 参数网格 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Design Current</span>
                        <div className="flex items-baseline space-x-1">
                             <span className="text-lg font-bold text-slate-800">{result.current_amps}</span>
                             <span className="text-xs text-slate-500">A</span>
                        </div>
                        <span className="text-[10px] text-slate-400">PF={formData.power_factor}</span>
                    </div>
                    <div className="p-3 border rounded-xl bg-green-50 border-green-100">
                        <span className="text-[10px] text-green-600 uppercase font-bold">Safe Capacity</span>
                        <div className="flex items-baseline space-x-1">
                             <span className="text-lg font-bold text-green-700">{result.safe_ampacity}</span>
                             <span className="text-xs text-green-600">A</span>
                        </div>
                        <span className="text-[10px] text-green-600">Corrected</span>
                    </div>
                    <div className="col-span-2 p-3 border rounded-xl flex justify-between items-center">
                        <div>
                             <span className="text-[10px] text-slate-400 uppercase font-bold block">Voltage Drop</span>
                             <span className={`text-sm font-bold ${result.voltage_drop_percent > 5 ? 'text-red-500' : 'text-slate-700'}`}>
                                {result.voltage_drop_percent}%
                             </span>
                        </div>
                        <div className="text-right">
                             <span className="text-[10px] text-slate-400 uppercase font-bold block">Breaker</span>
                             <span className="text-sm font-bold text-slate-700">{result.mcb_rating}</span>
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