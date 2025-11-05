// src/components/Sidebar.jsx
import { Link, useParams, useLocation } from "react-router-dom";
import { Settings, Globe, Activity, LayoutDashboard, LogOut, Zap } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Sidebar() {
  const { robotId } = useParams();
  const location = useLocation();
  const { logout: auth0Logout } = useAuth0();

  const basePath   = robotId ? `/dashboard/${robotId}`         : "/";
  const imagesPath = robotId ? `/dashboard/${robotId}/images`  : "/images";
  const logsPath   = robotId ? `/dashboard/${robotId}/logs`    : "/logs";
  const configPath = robotId ? `/dashboard/${robotId}/config`  : "/config";

  const isConfigActive    = location.pathname.includes("/config");
  const isImagesActive    = location.pathname.includes("/images");
  const isLogsActive      = location.pathname.includes("/logs");
  const isDashboardActive = robotId
    ? (location.pathname === basePath) ||
      (location.pathname.startsWith(`/dashboard/${robotId}`) && !isConfigActive && !isImagesActive && !isLogsActive)
    : location.pathname === "/";

  const isDisabled = !robotId; // en selector quedan deshabilitados

  const navClass = (active, disabled) =>
    `navbtn ${active ? "active" : ""} ${disabled ? "disabled" : ""}`;

  const handleLogout = () => {
    auth0Logout({ returnTo: window.location.origin });
    localStorage.removeItem("dashboardToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("auth0Id");
    localStorage.removeItem("email");
  };

  return (
    <aside className="sidebar" style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Link to="/" className="logo-link">
        <div className="logo"><Zap size={24} color="#8b5cf6" /> LiftCore Admin</div>
      </Link>

      <nav className="nav">
        <Link to={isDisabled ? "/" : basePath} className={navClass(isDashboardActive, false)}>
          <LayoutDashboard size={16}/> Dashboard
        </Link>

        {/* Imágenes */}
        <Link to={isDisabled ? "#" : imagesPath}
              className={navClass(isImagesActive, isDisabled)}
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}>
          <Globe size={16}/> Imágenes
        </Link>

        {/* Registros */}
        <Link to={isDisabled ? "#" : logsPath}
              className={navClass(isLogsActive, isDisabled)}
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}>
          <Activity size={16}/> Registros
        </Link>

        {/* Configuración */}
        <Link to={isDisabled ? "#" : configPath}
              className={navClass(isConfigActive, isDisabled)}
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled}>
          <Settings size={16}/> Configuración
        </Link>

        <button className="navbtn logout-btn" onClick={handleLogout}>
          <LogOut size={16}/> Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}
