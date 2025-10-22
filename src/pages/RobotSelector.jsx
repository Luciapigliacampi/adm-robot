import React from 'react';
import { Zap, CornerDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Robots de ejemplo (simulados)
const ROBOTS = [
    { id: "R1", name: "LiftCore-R1 (Fábrica A)", status: "En espera", battery: 92 },
    { id: "R2", name: "LiftCore-R2 (Almacén B)", status: "En ruta", battery: 65 },
    { id: "R3", name: "ForkBot-3 (Taller)", status: "Inactivo", battery: 40 },
];

export default function RobotSelector() {
    const navigate = useNavigate();

    const handleRobotSelect = (id) => {
        // Redirigir al dashboard del robot
        navigate(`/dashboard/${id}`);
    };

    return (
        <main className="main selector-page">
            <div className="card title-card">
                <h1>Selección de Robot</h1>
                <p className="muted">Selecciona el robot para acceder al panel de administración y telemetría.</p>
            </div>
            
            <div className="grid robot-grid">
                {ROBOTS.map(robot => (
                    <div 
                        key={robot.id} 
                        className="card robot-card" 
                        onClick={() => handleRobotSelect(robot.id)}
                    >
                        <Zap size={36} color="var(--accent)" />
                        <h2>{robot.name}</h2>
                        <div className="status-row">
                            <span className={`status-badge ${robot.status.includes('En ruta') ? 'ok' : robot.status.includes('Inactivo') ? 'err' : 'warn'}`}>
                                {robot.status.toUpperCase()}
                            </span>
                            <span className="battery-info">Batería: {robot.battery}%</span>
                        </div>
                        <CornerDownRight size={24} color="var(--accent)" className="select-icon" />
                    </div>
                ))}
            </div>
        </main>
    );
}