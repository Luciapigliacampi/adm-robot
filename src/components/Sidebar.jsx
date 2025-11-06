import { Link, useParams, useLocation } from "react-router-dom";
import { Settings, Zap, Globe, Activity, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import BottypeLogo from "../assets/logo.png";

export default function Sidebar() {
  const { robotId } = useParams();
  const location = useLocation();
  const { logout: auth0Logout } = useAuth0();

  // Base y rutas dependientes del robot.
  // Si no hay robotId, la ruta es '/' para forzar al usuario al selector.
  const basePath   = robotId ? `/dashboard/${robotId}` : "/";
  const imagesPath = robotId ? `/dashboard/${robotId}/images` : "/images"; 
  const logsPath   = robotId ? `/dashboard/${robotId}/logs`   : "/logs";   
  const configPath = robotId ? `/dashboard/${robotId}/config` : "/config";

  // Activos
  const isConfigActive    = location.pathname.includes("/config");
  const isImagesActive    = location.pathname.includes("/images");
  const isLogsActive      = location.pathname.includes("/logs");
  const isDashboardActive = robotId
    ? location.pathname === basePath || (location.pathname.startsWith(basePath) && !isConfigActive && !isImagesActive && !isLogsActive)
    : location.pathname === "/";

  // Indicador visual: Deshabilitar solo si no hay robot seleccionado
  const isDisabled = !robotId;

  // Helper para clase
  const navClass = (active, disabled) =>
    `navbtn ${active ? "active" : ""} ${disabled ? "disabled" : ""}`;

   const handleLogout = () => {
    auth0Logout({ returnTo: window.location.origin });
    // limpiar localStorage
    localStorage.removeItem("dashboardToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("auth0Id");
    localStorage.removeItem("email");
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="logo-link">
        <div className="logo">
          {/* Implementación del logo PNG */}
          <img src={BottypeLogo} alt="Bottype Admin Logo" className="bottype-logo" /> 
        </div>
      </Link>

      <nav>
        {/* Dashboard */}
        <Link
          to={basePath}
          className={navClass(isDashboardActive, false)}
          tabIndex={0}
          aria-disabled={false}
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>

        {/* Imágenes */}
        <Link
          to={imagesPath}
          className={navClass(isImagesActive, isDisabled)} // Mantiene el estilo visual de 'disabled' si no hay robot
          tabIndex={0} // Siempre navegable
          aria-disabled={false} // Siempre accesible
        >
          <Globe size={16} /> Imágenes
        </Link>

        {/* Registros */}
        <Link
          to={logsPath}
          className={navClass(isLogsActive, isDisabled)} // Mantiene el estilo visual de 'disabled' si no hay robot
          tabIndex={0} // Siempre navegable
          aria-disabled={false} // Siempre accesible
        >
          <Activity size={16} /> Registros
        </Link>

        {/* Configuración */}
        <Link
          to={configPath}
          className={navClass(isConfigActive, isDisabled)} // Mantiene el estilo visual de 'disabled' si no hay robot
          tabIndex={0} // Siempre navegable
          aria-disabled={false} // Siempre accesible
        >
          <Settings size={16} /> Configuración
        </Link>
         <button
          className="navbtn logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}