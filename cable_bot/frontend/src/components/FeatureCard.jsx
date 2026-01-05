import React from 'react';

const FeatureCard = ({ title, sub, icon: Icon, colorClass, onClick, disabled }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 transition-all relative overflow-hidden h-32 ${
      disabled 
        ? 'opacity-50 cursor-not-allowed grayscale' 
        : 'active:scale-95 cursor-pointer hover:shadow-md'
    }`}
  >
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
      <Icon className={colorClass.replace('bg-', 'text-')} size={28} />
    </div>
    <div className="text-center z-10">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
    {/* 待开发标记 */}
    {disabled && (
      <div className="absolute top-2 right-2">
        <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">Soon</span>
      </div>
    )}
  </div>
);

export default FeatureCard;