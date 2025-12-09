import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OpenAPI } from './client'

if (import.meta.env.DEV) {
  OpenAPI.BASE = '/api'; 
} else {
  OpenAPI.BASE = import.meta.env.VITE_API_URL || 'https://apiaws';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)