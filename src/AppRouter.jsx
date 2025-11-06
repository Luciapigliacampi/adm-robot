import React from 'react';
import { Routes, Route } from "react-router-dom";
import RobotSelector from "./pages/RobotSelector";
import AdminDashboard from "./pages/AdminDashboard";
import ConfigPage from "./pages/ConfigPage";
import Sidebar from "./components/Sidebar";
import Gallery from "./pages/Gallery.jsx";  // Imágenes
import Logs from "./pages/Logs.jsx";        // Registros
import RequireAuth from "./components/RequireAuth.jsx";


export default function AppRouter() {
    
    return (
    <RequireAuth>
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

        {/* NUEVO: Imágenes por robot */}
        <Route path="/dashboard/:robotId/images" element={<Gallery />} />
        <Route path="/images" element={<Gallery />} />

        {/* NUEVO: Registros por robot */}
        <Route path="/dashboard/:robotId/logs" element={<Logs />} />
        <Route path="/logs" element={<Logs />} />

                {/* Página Específica de Configuración */}
                <Route 
                    path="/dashboard/:robotId/config" 
                    element={<ConfigPage />} 
                />

                <Route path="/config" element={<ConfigPage />} />
                
                {/* Ruta de fallback/Error */}
                <Route path="*" element={<main className="main"><h1 style={{padding: 20}}>404 - No Encontrado</h1></main>} />
            </Routes>
        </div>
    </RequireAuth>
    );
}