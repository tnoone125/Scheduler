import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/index.css'
import SchedulerApp from './SchedulerApp.jsx'
import { AppProvider } from "../context/AppContext";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AppProvider>
                <SchedulerApp />
            </AppProvider>
        </BrowserRouter>
  </StrictMode>,
)
