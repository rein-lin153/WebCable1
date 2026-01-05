// src/pages/Dashboard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 引入钩子
import { Calculator, ShieldCheck, Zap, DollarSign, TrendingUp } from 'lucide-react';

const FeatureCard = ({ title, sub, icon: Icon, colorClass, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-transform cursor-pointer h-32"
  >
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
      <Icon className={colorClass.replace('bg-', 'text-')} size={28} />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  </div>
);

const Dashboard = ({ onNavigate }) => {
  const { t } = useTranslation(); // 获取 t 函数

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 头部：品牌与欢迎语 */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('app_title') || "Expert Cable"}</h1>
          <p className="text-slate-500 text-sm">{t('welcome')}</p>
        </div>
        {/* 模拟头像 */}
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
          E
        </div>
      </div>

      {/* 核心卡片：今日铜价 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-medium uppercase tracking-wider">
            <TrendingUp size={14} />
            <span>{t('copper_price')}</span> {/* 替换静态文本 */}
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-bold">$9,240</span>
            <span className="text-sm opacity-80">/ Ton</span>
          </div>
          <p className="text-xs text-blue-200 mt-2">较昨日上涨 +1.2% 📈</p>
        </div>
        {/* 装饰背景圆圈 */}
        <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* 功能网格 (2列布局) */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">{t('tab_tools')}</h2>
        <div className="grid grid-cols-2 gap-4">
          
          <FeatureCard 
            title={t('feature_calc')}
            sub={t('feature_calc_sub')}
            icon={Calculator} 
            colorClass="bg-blue-600 text-blue-600"
            onClick={() => onNavigate('calculator')}
          />

          <FeatureCard 
            title={t('feature_antifake')}
            sub={t('feature_antifake_sub')}
            icon={ShieldCheck} 
            colorClass="bg-green-600 text-green-600"
            onClick={() => onNavigate('antifake')}
          />

          <FeatureCard 
            title={t('feature_voltage_drop') || "压降计算"} 
            sub="Voltage Drop"
            icon={Zap} 
            colorClass="bg-amber-500 text-amber-500"
            onClick={() => console.log("To be implemented")}
          />

          <FeatureCard 
            title={t('feature_cost') || "成本估算"} 
            sub="Cost Estimator"
            icon={DollarSign} 
            colorClass="bg-purple-600 text-purple-600"
            onClick={() => console.log("To be implemented")}
          />

        </div>
      </div>

      {/* 底部Banner：工厂直销广告 */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 mt-4">
        <p className="text-xs text-slate-500 text-center">
          需要采购正品电缆？<br/>
          <span className="font-bold text-blue-600">工厂直销，金边市内免费送货</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
