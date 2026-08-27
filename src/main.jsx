import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { loadAndApplySavedAccentColor } from '@/lib/theme-accent'

loadAndApplySavedAccentColor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
