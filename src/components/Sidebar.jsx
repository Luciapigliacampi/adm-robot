import { Link, useParams, useLocation } from "react-router-dom";
import { Settings, Zap, Cpu, Globe, Activity, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
    const { robotId } = useParams();
    const location = useLocation();

    // Define la base de las rutas (si estamos en un robot, usamos su ID)
    const basePath = robotId ? `/dashboard/${robotId}` : '/';

    // Función para determinar si la ruta está activa
    const isConfigActive = location.pathname.includes('/config');
    const isDashboardActive = location.pathname.startsWith(`/dashboard/${robotId}`) && !isConfigActive;
    
    // Deshabilitar navegación si no hay robot seleccionado
    const isDisabled = !robotId;

    return (
        <aside className="sidebar">
            <Link to="/" className="logo-link">
                <div className="logo"><Zap size={24} color="#8b5cf6" /> LiftCore Admin</div>
            </Link>
            <nav>
                {/* Botón Dashboard */}
                <Link to={basePath} className={`navbtn ${isDashboardActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`} tabIndex={isDisabled ? -1 : 0}>
                    <LayoutDashboard size={16} /> Dashboard
                </Link>
                {/* Botón Imágenes */}
                <button className="navbtn" disabled={isDisabled}>
                    <Globe size={16} /> Imágenes
                </button>
                {/* Botón Registros (Opcional) */}
                <button className="navbtn" disabled={isDisabled}>
                    <Activity size={16} /> Registros
                </button>
                {/* Botón Configuración */}
                <Link to={`/dashboard/${robotId}/config`} className={`navbtn ${isConfigActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`} tabIndex={isDisabled ? -1 : 0}>
                    <Settings size={16} /> Configuración
                </Link>
            </nav>
        </aside>
    );
}