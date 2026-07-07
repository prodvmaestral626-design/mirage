import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }
  body { overflow: hidden; background: #0a0008; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0008; }
  ::-webkit-scrollbar-thumb { background: #3d0a20; border-radius: 2px; }
  * { scrollbar-width: thin; scrollbar-color: #3d0a20 #0a0008; }
  input::placeholder { color: #4a3a55; }
  textarea::placeholder { color: #4a3a55; }
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
`

const styleEl = document.createElement('style')
styleEl.textContent = globalStyles
document.head.appendChild(styleEl)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
