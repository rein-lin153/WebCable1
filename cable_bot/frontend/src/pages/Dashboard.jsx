import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, ShieldCheck, TrendingUp } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const Dashboard = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* 头部：极简欢迎 */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expert Cable</h1>
          <p className="text-slate-500 text-sm font-medium">{t('welcome')}</p>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
          E
        </div>
      </div>

      {/* 专业数据看板：今日铜价 */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-widest">
            <TrendingUp size={14} />
            <span>{t('copper_price')}</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-4xl font-black tracking-tight">$9,240</span>
            <span className="text-sm font-medium text-blue-200">/ Ton</span>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-md font-bold">+1.2%</span>
            <span className="text-xs text-blue-300">LME Market Price</span>
          </div>
        </div>
        {/* 背景装饰 */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-fullHC mix-blend-overlay filter blur-3xl opacity-30"></div>
      </div>

      {/* 常用工具 */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-4 px-1 flex items-center">
          <span className="w-1 h-4 bg-blue-600 rounded-full mr-2"></span>
          {t('tab_tools')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard 
            title={t('feature_calc')}
            sub="IEC 60364"
            icon={Calculator} 
            colorClass="bg-blue-600 text-blue-600"
            onClick={() => onNavigate('calculator')}
          />
          <FeatureCard 
            title={t('feature_antifake')}
            sub="Anti-Fake"
            icon={ShieldCheck} 
            colorClass="bg-green-600 text-green-600"
            onClick={() => onNavigate('antifake')}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;