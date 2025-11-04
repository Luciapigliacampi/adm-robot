import { Link, useParams, useLocation } from "react-router-dom";
import { Settings, Zap, Globe, Activity, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Sidebar() {
  const { robotId } = useParams();
  const location = useLocation();
const { logout: auth0Logout } = useAuth0();

  // Base y rutas dependientes del robot
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

  // Deshabilitar si no hay robot seleccionado
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
    <aside className="sidebar" style={{display:'flex', flexDirection:'column', height:'100vh'}}>

      <Link to="/" className="logo-link">
        <div className="logo">
          <Zap size={24} color="#8b5cf6" /> LiftCore Admin
        </div>
      </Link>

      <nav>
        {/* Dashboard */}
        <Link
          to={basePath}
          className={navClass(isDashboardActive, isDisabled)}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>

        {/* Imágenes */}
        <Link
          to={isDisabled ? "#" : imagesPath}
          className={navClass(isImagesActive, isDisabled)}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
        >
          <Globe size={16} /> Imágenes
        </Link>

        {/* Registros */}
        <Link
          to={isDisabled ? "#" : logsPath}
          className={navClass(isLogsActive, isDisabled)}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
        >
          <Activity size={16} /> Registros
        </Link>

        {/* Configuración */}
        <Link
          to={isDisabled ? "#" : configPath}
          className={navClass(isConfigActive, isDisabled)}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled}
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
      {/* Footer: botón Cerrar sesión al pie */}
      <div style={{ marginTop:'auto', padding:12, borderTop:'1px solid rgba(255,255,255,.06)' }}>
         <button
    className="navbtn"
    style={{ width:'100%', textAlign:'center' }}
    onClick={() => auth0Logout({ logoutParams: { returnTo: window.location.origin } })}
  >
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}
