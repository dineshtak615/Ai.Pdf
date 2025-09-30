import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// ✅ Import matches file name exactly (App.tsx)
import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
