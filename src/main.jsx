import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initializeAnalytics } from '@/firebase'
import { ensureProductsCollectionSeeded } from '@/lib/firestore-products'
import { loadAndApplySavedAccentColor } from '@/lib/theme-accent'

void initializeAnalytics()
void ensureProductsCollectionSeeded()
loadAndApplySavedAccentColor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
