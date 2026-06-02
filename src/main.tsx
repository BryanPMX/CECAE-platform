import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { GoogleAnalytics } from './components/layout/GoogleAnalytics';
import './i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
      <GoogleAnalytics />
    </BrowserRouter>
  </React.StrictMode>,
);
