// frontend/src/App.jsx
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CableCalculator from './pages/CableCalculator';
import AntiFakeCheck from './pages/AntiFakeCheck';
import Tools from './pages/Tools';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentFeature, setCurrentFeature] = useState(null);

  // 路由渲染逻辑
  const renderContent = () => {
    // 1. 全局功能路由 (覆盖 Tab)
    if (currentFeature) {
      if (currentFeature === 'calculator') {
        return <CableCalculator onBack={() => setCurrentFeature(null)} />;
      }
      if (currentFeature === 'antifake') {
        return <AntiFakeCheck onBack={() => setCurrentFeature(null)} />;
      }
    }

    // 2. 底部 Tab 路由
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setCurrentFeature} />;
      case 'tools':
        return <Tools onNavigate={setCurrentFeature} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentFeature} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => {
      setActiveTab(tab);
      setCurrentFeature(null); // 切换 Tab 时重置子功能
      window.scrollTo(0, 0);   // 切换时滚回顶部
    }}>
      {renderContent()}
    </Layout>
  );
}

export default App;
