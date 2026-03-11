import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/shards-dashboards.min.css';
import '@/styles/shards-extras.min.css';
import '@/styles/granja.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
