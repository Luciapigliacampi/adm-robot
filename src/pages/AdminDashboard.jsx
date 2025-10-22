import React from "react";
import { useParams } from "react-router-dom";
import useAdminSSE from "../hooks/useAdminSSE";
import { useImageAPI } from "../hooks/useImageAPI"; 
import StatusBar from "../components/StatusBar";
import KpiCard from "../components/KpiCard";
import SnapshotCard from "../components/SnapshotCard"; 
import { Battery, Zap, Globe } from 'lucide-react';

export default function AdminDashboard() {
    const { robotId } = useParams();
    // 1. Telemetría en tiempo real (SSE)
    const { connected, latencyMs, telemetry, snapshot } = useAdminSSE(robotId);
    
    // 2. Imágenes históricas (API Fetch)
    const { 
        images: storedImages, 
        isLoading: isLoadingImages, 
        error: imageError, 
        refetch: refetchImages 
    } = useImageAPI(robotId);

    // Datos extraídos de la telemetría
    const battery = telemetry?.battery ?? null; 
    const speed = telemetry?.v ?? null; 
    const dist = telemetry?.dist ?? null; 

    // Combinar la imagen en tiempo real (snapshot) con el array de storedImages
    const allImages = React.useMemo(() => {
        let list = [...storedImages];
        if (snapshot?.url && !list.some(img => img.url === snapshot.url)) {
            // Añadir la última instantánea de SSE (si es diferente y nueva)
            list.unshift({ 
                url: snapshot.url, 
                description: snapshot.description || 'Instantánea en tiempo real', 
                type: 'sse',
                ts: snapshot.ts || Date.now()
            });
        }
        return list;
    }, [snapshot, storedImages]);

    return (
        <main className="main">
            <header className="header">
                <div className="robsel">
                    <h1 className="robot-title">LiftCore | {robotId}</h1>
                </div>
                <StatusBar 
                    latencyMs={latencyMs} 
                    telemetry={telemetry} 
                    connected={connected}
                />
            </header>

            {/* KPIs con datos en tiempo real (3 columnas) */}
            <section className="grid kpis">
                <KpiCard label="Batería" value={battery} unit="%" icon={Battery} />
                <KpiCard label="Velocidad" value={speed} unit="m/s" icon={Zap} />
                <KpiCard label="Distancia Recorrida" value={dist} unit="m" icon={Globe} />
            </section>

            {/* SECCIÓN DE IMÁGENES: Ahora ocupa el ancho completo, eliminando la necesidad de la cuadrícula "mid" */}
            <section>
                <SnapshotCard 
                    images={allImages} 
                    isLoading={isLoadingImages}
                    error={imageError}
                    refetch={refetchImages}
                />
            </section>
            
            {/* ⬅️ Nota: Se eliminaron las secciones de Tareas y Gestión de Configuración. */}
        </main>
    );
}
