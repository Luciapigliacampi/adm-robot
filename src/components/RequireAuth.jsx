import React, { useEffect, useState } from "react";

const AUTH_API = import.meta.env.VITE_AUTH_API || "http://localhost:3000";

// Decodifica JWT
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    console.error("Error decodificando token:", err);
    return null;
  }
}

function readLocalRoles() {
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const ud = JSON.parse(raw);
      if (ud?.role) return Array.isArray(ud.role) ? ud.role : [ud.role];
      if (ud?.roles) return Array.isArray(ud.roles) ? ud.roles : [ud.roles];
    }
  } catch {}
  const single = localStorage.getItem("userRole");
  return single ? [single] : [];
}

function uniqLower(arr) {
  return [...new Set((arr || []).filter(Boolean).map((x) => String(x).toLowerCase()))];
}

export default function RequireAuth({ children }) {

  if (import.meta.env.VITE_BYPASS_AUTH === "true") {
    return <>{children}</>;
  }

  const [accessGranted, setAccessGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let refreshTimeout;

    const onLogout = () => {
      try {
        localStorage.removeItem("dashboardToken");
        localStorage.removeItem("auth0Id");
        localStorage.removeItem("email");
        localStorage.removeItem("userRole");
        // por si guardás un objeto completo del usuario:
        localStorage.removeItem("userData");
      } catch {}
      const returnTo = `${window.location.origin}/?ts=${Date.now()}`;
      window.location.replace(returnTo);
    };

    const scheduleRefresh = (token) => {
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.exp) return;

      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;

      // chequea si quedan 30 segundos o menos ahce el refresh
      if (timeLeft <= 30) {
        refreshToken();
      } else {
        
        refreshTimeout = setTimeout(refreshToken, (timeLeft - 30) * 1000);
      }
    };

    const refreshToken = async () => {
      const auth0Id = localStorage.getItem("auth0Id");
      if (!auth0Id) return;

      try {
        const res = await fetch(`${AUTH_API}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth0Id }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("dashboardToken", data.token);

          const decoded = decodeJWT(data.token);
          if (decoded) {
            localStorage.setItem("userRole", decoded.role);
            localStorage.setItem("email", decoded.email);
          }

          scheduleRefresh(data.token); //programa refrewsh
        } else {
            console.warn("Refresh token inválido", data);
            setAccessGranted(false);
          }
      } catch (err) {
        console.error("Error refrescando token:", err);
        setAccessGranted(false);
      }
    };

    const verifyToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      let token = urlToken || localStorage.getItem("dashboardToken");

      if (!token) {
        setChecking(false);
        setAccessGranted(false);
        return;
      }

      if (urlToken) {
        localStorage.setItem("dashboardToken", urlToken);

        const decoded = decodeJWT(urlToken);
        if (decoded) {
          if (decoded.role) localStorage.setItem("userRole", decoded.role);
          if (decoded.auth0Id) localStorage.setItem("auth0Id", decoded.auth0Id);
          if (decoded.email) localStorage.setItem("email", decoded.email);
        }

        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        token = urlToken;
      }

      try {
        const res = await fetch(`${AUTH_API}/api/auth/validate-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        const rolesFromApi = uniqLower([
          data?.user?.role,
          ...(Array.isArray(data?.user?.roles) ? data.user.roles : []),
          data?.role,
        ]);
        const rolesLocal = uniqLower(readLocalRoles());
        const rolesTmp = uniqLower(window.__roles || []);
        const roles = uniqLower([...rolesFromApi, ...rolesLocal, ...rolesTmp]);

        const isAdmin = roles.includes("admin");
        if (res.ok && data?.valid && isAdmin) {
          setAccessGranted(true);
          scheduleRefresh(token); // programar refresh
        } else {
          console.warn("Acceso denegado - roles:", { rolesFromApi, rolesLocal, rolesTmp, roles });
          setAccessGranted(false);
        }
      } catch (err) {
        console.error("Error validando token:", err);
        setAccessGranted(false);
      } finally {
        setChecking(false);
      }
    };

    verifyToken();

    return () => clearTimeout(refreshTimeout);
  }, []);

  if (checking) {
    return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>Verificando acceso...</div>;
  }

  // if (!accessGranted) {
  //   return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>Acceso denegado</div>;
  //   //logout
   

  // }
  if (!accessGranted) {
    const email = localStorage.getItem("email") || "";
    const onLogout = () => {
      try {
        localStorage.romeveItem("dahshboardToken");
        localStorage.romeveItem("auth0Id");
        localStorage.romeveItem("email");
        localStorage.romeveItem("userRole");
        localStorage.romeveItem("userData");
      } catch {}
      window.location.replace(`${window.location.origin}/?ts=${Date.now()}`);
    };

    return (
      <div style={{ textAlign: "center", marginTop: 56 }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>Acceso denegado</div>
        {email && (
          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>
            Sesión actual: {email}
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
