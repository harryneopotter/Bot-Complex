import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Optional: set API base via env, otherwise use same-origin or window override
if (!window.__API_BASE__ && import.meta.env.VITE_API_BASE) {
  window.__API_BASE__ = import.meta.env.VITE_API_BASE
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

