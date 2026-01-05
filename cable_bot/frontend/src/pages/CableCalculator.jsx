import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calculator, Zap, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { calculateCable } from '../services/api';

const CableCalculator = ({ onBack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    power: '',
    power_unit: 'kw',     
    voltage_type: '220v', 
    distance: 50,         
    material: 'cu',       
    cable_type: 'yjv'     
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
        cable_type: formData.cable_type
      };
      const data = await calculateCable(payload);
      setResult(data);
      // 平滑滚动到底部
      setTimeout(() => {
        document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      alert("Error: Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ ...formData, power: '' });
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
        
        {/* 材质与类型 */}
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

        {/* 电压选择 */}
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

        {/* 功率输入 - 加大 */}
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

        {/* 距离滑块 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('input_distance')}</span>
            <div className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-700">
              {formData.distance} m
            </div>
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
            <div className={`h-2 w-full ${result.voltage_drop_percent > 5 ? 'bg-red-500' : 'bg-green-500'}`} />
            
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Result Report</span>
                        <h3 className={`text-lg font-bold mt-1 ${result.voltage_drop_percent > 5 ? 'text-red-600' : 'text-slate-800'}`}>
                            {result.voltage_drop_percent > 5 ? '⚠️ Voltage Drop Issue' : '✅ Standard Compliant'}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-full ${result.voltage_drop_percent > 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {result.voltage_drop_percent > 5 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 mb-6">
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

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Current</span>
                        <p className="text-lg font-bold text-slate-700">{result.current_amps} A</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Breaker</span>
                        <p className="text-lg font-bold text-slate-700">{result.mcb_rating}</p>
                    </div>
                    <div className="col-span-2 p-3 bg-white border border-slate-100 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Voltage Drop</span>
                            <span className={`text-xs font-bold ${result.voltage_drop_percent > 5 ? 'text-red-500' : 'text-green-600'}`}>
                                {result.voltage_drop_percent}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full ${result.voltage_drop_percent > 5 ? 'bg-red-500' : 'bg-green-500'}`} 
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