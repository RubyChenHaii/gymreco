import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 偵測到新版本 SW 安裝完成時，透過瀏覽器原生的 CustomEvent 通知 App.jsx 顯示更新提示。
// 用全域事件而不是把 App 元件傳進來，是因為 register() 在 App 掛載之前就執行，
// 這樣兩邊各自獨立，之後要拔掉或替換更新提示的 UI 也不會牽動這裡的註冊邏輯。
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    window.dispatchEvent(new CustomEvent('sw-update-available', { detail: registration }));
  },
});
reportWebVitals();