import React from 'react';
import { Routes, Route } from "react-router-dom";
import RobotSelector from "./pages/RobotSelector";
import AdminDashboard from "./pages/AdminDashboard";
import ConfigPage from "./pages/ConfigPage";
import Sidebar from "./components/Sidebar";

export default function AppRouter() {
    
    return (
        <div className="app">
            <Sidebar />
            <Routes>
                {/* Página de Inicio: Selección de Robot */}
                <Route 
                    path="/" 
                    element={<RobotSelector />} 
                />
                
                {/* Dashboard Principal del Robot */}
                <Route 
                    path="/dashboard/:robotId" 
                    element={<AdminDashboard />} 
                />

                {/* Página Específica de Configuración */}
                <Route 
                    path="/dashboard/:robotId/config" 
                    element={<ConfigPage />} 
                />
                
                {/* Ruta de fallback/Error */}
                <Route path="*" element={<main className="main"><h1 style={{padding: 20}}>404 - No Encontrado</h1></main>} />
            </Routes>
        </div>
    );
}