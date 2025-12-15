import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { checkVersionAndClearCache, handleError } from './utils/version'

// Check version and clear cache if needed
checkVersionAndClearCache()

// Global error handling
window.addEventListener('error', (event) => {
  handleError(event.error, { componentStack: event.error?.stack })
})

window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, {})
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

