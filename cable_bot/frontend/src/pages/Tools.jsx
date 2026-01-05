import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, ShieldCheck, Zap, DollarSign, Ruler, FileText, BookOpen } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const Tools = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      <div className="pt-2 px-1">
        <h2 className="text-2xl font-black text-slate-900">{t('tab_tools')}</h2>
        <p className="text-slate-500 text-sm mt-1">Professional Electrical Utilities</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 核心功能 */}
        <FeatureCard 
          title={t('feature_calc')}
          sub="IEC Standard"
          icon={Calculator} 
          colorClass="bg-blue-600 text-blue-600"
          onClick={() => onNavigate('calculator')}
        />

        <FeatureCard 
          title={t('feature_antifake')}
          sub="Weight Check"
          icon={ShieldCheck} 
          colorClass="bg-green-600 text-green-600"
          onClick={() => onNavigate('antifake')}
        />

        {/* 规划中的功能 - 展示给用户看 */}
        <FeatureCard 
          title="压降计算" 
          sub="Voltage Drop"
          icon={Zap} 
          colorClass="bg-amber-500 text-amber-500"
          disabled={true} 
        />

        <FeatureCard 
          title="成本估算" 
          sub="Cost Estimator"
          icon={DollarSign} 
          colorClass="bg-purple-600 text-purple-600"
          disabled={true}
        />
        
        <FeatureCard 
          title="电工手册" 
          sub="Handbook"
          icon={BookOpen} 
          colorClass="bg-rose-500 text-rose-500"
          disabled={true}
        />
        
        <FeatureCard 
          title="单位换算" 
          sub="Converter"
          icon={Ruler} 
          colorClass="bg-teal-600 text-teal-600"
          disabled={true}
        />
      </div>
    </div>
  );
};

export default Tools;