import React from 'react';
import { Settings, Wifi, AlertTriangle } from 'lucide-react';

export default function ConfigPanel({ telemetry, robotId }) {
    const status = telemetry?.status ?? '—';
    const mode = telemetry?.mode ?? '—';
    
    // Simulación de valores de configuración
    const wifiRSSI = telemetry?.wifiRSSI;
    const wifiQuality = wifiRSSI ? (wifiRSSI > -60 ? 'Buena' : (wifiRSSI > -70 ? 'Aceptable' : 'Pobre')) : '—';
    const qualityClass = wifiQuality === 'Buena' ? 'ok' : (wifiQuality === 'Aceptable' ? 'warn' : 'err');

    return (
        <div className="card">
            <div className="card-title">Configuración Detallada del Robot ({robotId})</div>
            
            <div className="config-grid">
                <div>
                    <span className="muted small">ID del Robot:</span>
                    <p className="config-value">{robotId}</p>
                </div>
                <div>
                    <span className="muted small">Modo Operación:</span>
                    <p className="config-value">{mode.toUpperCase()}</p>
                </div>
                <div>
                    <span className="muted small">Estado de la Cámara:</span>
                    <p className="config-value">{telemetry?.camera || 'active'}</p>
                </div>
                <div>
                    <span className="muted small">Estado Ultrasónico:</span>
                    <p className="config-value">{telemetry?.ultrasonic || 'active'}</p>
                </div>
                <div>
                    <span className="muted small">IP/Host MQTT:</span>
                    <p className="config-value">{telemetry?.ip || '192.168.1.10'}</p>
                </div>
                <div>
                    <span className="muted small">Calidad Wi-Fi:</span>
                    <p className={`config-value ${qualityClass}`}>
                        <Wifi size={14} style={{marginRight: 4}} />{wifiQuality} ({wifiRSSI || '—'} dBm)
                    </p>
                </div>
            </div>

            <div className="card-separator"></div>

            <h4 className="config-subtitle">Acciones Críticas</h4>
            <div className="row two-col">
                <button className="btn primary">Actualizar Firmware</button>
                <button className="btn primary">Reiniciar Sistema</button>
            </div>
            
            <button className="btn err block" style={{marginTop: 10}}>
                Apagado Forzado Remoto (Power Off)
            </button>
        </div>
    );
}