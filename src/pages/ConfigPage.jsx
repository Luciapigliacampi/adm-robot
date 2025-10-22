import React from "react";
import { useParams } from "react-router-dom";
import useAdminSSE from "../hooks/useAdminSSE";
import ConfigPanel from "../components/ConfigPanel";
import StatusBar from "../components/StatusBar";

export default function ConfigPage() {
    const { robotId } = useParams();
    // Le pasamos el ID del robot al hook
    const { connected, latencyMs, telemetry } = useAdminSSE(robotId);

    return (
        <main className="main">
            <header className="header">
                <div className="robsel">
                    <h1 className="robot-title">Configuración: {robotId}</h1>
                </div>
                <StatusBar 
                    latencyMs={latencyMs} 
                    telemetry={telemetry} 
                    connected={connected}
                />
            </header>

            <ConfigPanel telemetry={telemetry} robotId={robotId}/>
            
            <div className="card" style={{marginTop: 20}}>
                <div className="card-title">Historial de Logs (Opcional)</div>
                <p className="muted">Aquí se mostraría el historial completo de logs si fuera necesario, excluido por consigna.</p>
            </div>
        </main>
    );
}