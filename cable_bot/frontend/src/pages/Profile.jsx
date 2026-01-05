import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, User, Phone, MapPin, ChevronRight } from 'lucide-react';

const Profile = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const menuItems = [
    { icon: Phone, label: "Contact Support", val: "+855 12 345 678" },
    { icon: MapPin, label: "Factory Location", val: "Phnom Penh SEZ" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900 px-2">{t('tab_me')}</h2>

      {/* 用户信息卡片 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <User size={32} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Electrician User</h3>
          <p className="text-slate-500 text-sm">ID: KH-8829</p>
        </div>
      </div>

      {/* 语言切换器 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50 flex items-center space-x-2">
          <Globe size={18} className="text-slate-500" />
          <span className="font-bold text-slate-700 text-sm">Language / ភាសា</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          <button 
            onClick={() => changeLanguage('en')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50"
          >
            <span className="text-sm font-medium">English</span>
            {i18n.language === 'en' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
          </button>
          
          <button 
            onClick={() => changeLanguage('zh')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50"
          >
            <span className="text-sm font-medium">中文 (Chinese)</span>
            {i18n.language === 'zh' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
          </button>

          <button 
            onClick={() => changeLanguage('km')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 font-['Noto_Sans_Khmer']"
          >
            <span className="text-sm font-medium">ខ្មែរ (Khmer)</span>
            {i18n.language === 'km' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
          </button>
        </div>
      </div>

      {/* 其他菜单 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {menuItems.map((item, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <item.icon size={18} className="text-slate-400" />
              <span className="text-sm text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">{item.val}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;