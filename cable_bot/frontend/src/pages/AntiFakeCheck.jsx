import React, { useState } from 'react';
import { ArrowLeft, Scale, ShieldCheck, AlertOctagon, Info, ArrowRight } from 'lucide-react';
import { checkFakeCable } from '../services/api';

const AntiFakeCheck = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Size, 2: Input Weight, 3: Result
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    nominal_size: '', // 1.5, 2.5 etc.
    measured_weight: '',
    cable_type: 'bv'
  });

  // 常见规格列表 (Chips)
  const sizes = ['1.5', '2.5', '4.0', '6.0', '10', '16'];

  const handleVerify = async () => {
    if (!formData.measured_weight) return;
    setLoading(true);
    
    try {
      const data = await checkFakeCable({
        nominal_size: formData.nominal_size,
        measured_weight: parseFloat(formData.measured_weight),
        cable_type: 'bv' // 默认为单芯线检测
      });
      setResult(data);
      setStep(3); // 显示结果
    } catch (error) {
      alert("检测服务连接失败");
    } finally {
      setLoading(false);
    }
  };

  const resetCheck = () => {
    setStep(1);
    setResult(null);
    setFormData({ ...formData, measured_weight: '' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      
      {/* 顶部导航 */}
      <div className="flex items-center space-x-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">真伪/非标检测</h2>
      </div>

      {/* 进度指示器 */}
      {step < 3 && (
        <div className="flex items-center space-x-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>
      )}

      {/* --- 第一步：选择规格 --- */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-slate-800">选择电缆规格</h3>
            <p className="text-slate-500 text-sm">Select Nominal Size (mm²)</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setFormData({ ...formData, nominal_size: size });
                  setStep(2);
                }}
                className="p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <span className="text-2xl font-bold text-slate-700 group-hover:text-blue-600">{size}</span>
                <span className="text-xs text-slate-400">mm²</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- 第二步：输入重量 --- */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-slate-800">输入整卷重量</h3>
            <p className="text-slate-500 text-sm">Input Weight per 100m Roll</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl flex flex-col items-center border border-slate-200">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              实测重量 / Measured
            </label>
            <div className="flex items-baseline space-x-2">
              <input
                type="number"
                autoFocus
                placeholder="0.0"
                value={formData.measured_weight}
                onChange={(e) => setFormData({...formData, measured_weight: e.target.value})}
                className="bg-transparent text-center text-5xl font-black text-slate-800 w-40 focus:outline-none border-b-2 border-slate-300 focus:border-blue-500 transition-colors"
              />
              <span className="text-xl font-medium text-slate-400">KG</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center">
              <Info size={12} className="mr-1" /> 请去除外包装塑料膜后称重
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !formData.measured_weight}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center space-x-2"
          >
            {loading ? <span className="animate-spin">⏳</span> : (
              <>
                <Scale size={20} />
                <span>立即验证 / Verify Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* --- 第三步：检测结果 (核心视觉部分) --- */}
      {step === 3 && result && (
        <div className="animate-in zoom-in duration-300">
          
          {/* 状态卡片：根据 risk_level 变换颜色 */}
          <div className={`rounded-3xl p-6 text-center shadow-xl border-4 ${
            result.risk_level === 'safe' 
              ? 'bg-green-600 border-green-200 shadow-green-200' 
              : result.risk_level === 'warning'
                ? 'bg-amber-500 border-amber-200 shadow-amber-200'
                : 'bg-red-600 border-red-200 shadow-red-200'
          }`}>
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                {result.risk_level === 'safe' ? (
                  <ShieldCheck size={48} className="text-white" />
                ) : (
                  <AlertOctagon size={48} className="text-white" />
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {result.risk_level === 'safe' ? 'IEC 标准合格' : '检测不合格'}
            </h2>
            <p className="text-white text-opacity-90 font-medium">
              {result.message}
            </p>
          </div>

          {/* 数据对比详情 */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">数据分析 / Analysis</h4>
            
            <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4 mb-4">
              <div className="text-left">
                <span className="block text-xs text-slate-500">标准重量 (Standard)</span>
                <span className="text-lg font-bold text-slate-700">{result.standard_weight} KG</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-slate-500">实测重量 (Measured)</span>
                <span className={`text-xl font-bold ${result.is_pass ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.measured_weight} KG
                </span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400">偏差值 / Deviation</span>
              <div className={`text-2xl font-black ${result.diff_percent >= -5 ? 'text-green-600' : 'text-red-600'}`}>
                {result.diff_percent > 0 ? '+' : ''}{result.diff_percent}%
              </div>
            </div>
          </div>

          {/* 杀手锏 CTA：如果不合格，引导购买正品 */}
          {!result.is_pass && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertOctagon className="text-red-600 shrink-0" size={20} />
                <div>
                  <h5 className="text-sm font-bold text-red-800">安全警报</h5>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    使用非标/亏方电缆可能导致线路过热甚至火灾。为了您的工程安全，建议立即更换为国标正品。
                  </p>
                </div>
              </div>
              <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center space-x-2">
                <span>购买正品电缆 (Buy Genuine)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* 重新检测按钮 */}
          <button 
            onClick={resetCheck}
            className="w-full mt-4 py-3 text-slate-400 text-sm font-medium hover:text-slate-600"
          >
            重新检测另一个规格
          </button>

        </div>
      )}
    </div>
  );
};

export default AntiFakeCheck;