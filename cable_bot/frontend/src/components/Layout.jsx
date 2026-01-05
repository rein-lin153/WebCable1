import React from 'react';
import { Home, Wrench, User } from 'lucide-react';

const Layout = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* 顶部安全区/状态栏模拟 (Telegram环境下通常由平台处理，这里留白) */}
      <div className="w-full h-2 bg-slate-50" />

      {/* 主要内容区域 */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {children}
      </main>

      {/* 底部固定导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 safe-area-bottom z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          <button 
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Home size={24} />
            <span className="text-[10px] font-medium">首页</span>
          </button>

          <button 
            onClick={() => onTabChange('tools')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'tools' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Wrench size={24} />
            <span className="text-[10px] font-medium">工具箱</span>
          </button>

          <button 
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <User size={24} />
            <span className="text-[10px] font-medium">我的</span>
          </button>

        </div>
      </nav>
    </div>
  );
};

export default Layout;