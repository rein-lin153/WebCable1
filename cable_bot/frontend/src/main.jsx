import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'
import WebApp from '@twa-dev/sdk'

// 初始化 Telegram WebApp
if (WebApp.initData.length > 0) {
    WebApp.ready();
    WebApp.expand(); // 自动全屏
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)