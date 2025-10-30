import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx' 
import './App.css' // Usamos App.css para los estilos del dashboard

createRoot(document.getElementById('root')).render(
<StrictMode>
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
</StrictMode>,
)