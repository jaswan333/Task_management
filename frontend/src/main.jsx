import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { PMSProvider } from './pms/PMSProvider.jsx'
import TaskFlow from './TaskFlow.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PMSProvider>
          <TaskFlow />
        </PMSProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
