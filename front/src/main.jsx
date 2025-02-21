import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContextProvider from './contexts/UserContextProvider.jsx'
import ExcursionContextProvider from './contexts/ExcursionContextProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <ExcursionContextProvider>
    <App />
      </ExcursionContextProvider>
    </UserContextProvider>
  </StrictMode>,
)
