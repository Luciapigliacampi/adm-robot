import { Link, useParams, useLocation } from "react-router-dom";
import { Settings, Zap, Globe, Activity, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import BottypeLogo from "../assets/logo.png"; // Asegúrate de que esta ruta sea correcta

export default function Sidebar() {
const { robotId: paramRobotId } = useParams(); // ID de la URL actual
  const location = useLocation();
  const { logout: auth0Logout } = useAuth0();

  // 💡 LÓGICA CLAVE: Intentamos extraer el robotId de la URL, ya que useParams()
  // sólo funciona si la ruta actual es una ruta con :robotId.
  // Buscamos si el patrón /dashboard/ALGO/ está en la URL
  let currentRobotId = paramRobotId;

  // Si no tenemos robotId del useParams (estamos en /images o /logs), 
  // lo extraemos del pathname si la URL actual lo contiene.
  if (!currentRobotId) {
    const match = location.pathname.match(/\/dashboard\/([^\/]+)/);
    if (match && match[1]) {
      currentRobotId = match[1];
    }
  }

  // Usamos el ID más reciente
  const robotId = currentRobotId;
  
  // Base y rutas dependientes del robot.
  // AHORA ESTA LÓGICA DEBERÍA FUNCIONAR MEJOR:
  const basePath   = robotId ? `/dashboard/${robotId}` : "/";
  const imagesPath = robotId ? `/dashboard/${robotId}/images` : "/images"; 
  const logsPath   = robotId ? `/dashboard/${robotId}/logs`   : "/logs";   
  const configPath = robotId ? `/dashboard/${robotId}/config` : "/config"; 

  // ... (El resto del código de Activos, isDisabled, navClass y handleLogout es el mismo)
  const isConfigActive    = location.pathname.includes("/config");
  const isImagesActive    = location.pathname.includes("/images");
  const isLogsActive      = location.pathname.includes("/logs");
  const isDashboardActive = robotId
    ? location.pathname === basePath || (location.pathname.startsWith(basePath) && !isConfigActive && !isImagesActive && !isLogsActive)
    : location.pathname === "/";

  // Indicador visual: Deshabilitar solo si no hay robot seleccionado
  const isDisabled = !robotId;


  // Helper para clase
  // Mantenemos la clase "disabled" para indicar visualmente que no hay robot
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
          className={navClass(isImagesActive, isDisabled)}
          tabIndex={0}
          aria-disabled={false}
        >
          <Globe size={16} /> Imágenes
        </Link>

        {/* Registros */}
        <Link
          to={logsPath}
          className={navClass(isLogsActive, isDisabled)}
          tabIndex={0}
          aria-disabled={false}
        >
          <Activity size={16} /> Registros
        </Link>

        {/* Configuración */}
        <Link
          to={configPath}
          className={navClass(isConfigActive, isDisabled)}
          tabIndex={0}
          aria-disabled={false}
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