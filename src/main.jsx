import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import '@fontsource/cinzel/700.css'
// Latin subsets only. The bare 400.css pulls Cyrillic, Greek and Vietnamese
// too, which the service worker would then precache for no reason - latin-ext
// is still needed for the ligature in "coeur".
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/eb-garamond/latin-ext-400.css'
import '@fontsource/eb-garamond/latin-ext-400-italic.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
