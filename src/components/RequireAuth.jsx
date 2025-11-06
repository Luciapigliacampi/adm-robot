import React, { useEffect, useState } from "react";

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

export default function RequireAuth({ children }) {
  const [accessGranted, setAccessGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let refreshTimeout;

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
        const res = await fetch("http://localhost:3000/api/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth0Id }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("dashboardToken", data.token);

          const decoded = decodeJWT(data.token);
          if (decoded) {
            localStorage.setItem("userRole", decoded.role || "");
            localStorage.setItem("email", decoded.email || "");
          }

          scheduleRefresh(data.token); //programa refrewsh
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
          localStorage.setItem("userRole", decoded.role || "");
          localStorage.setItem("auth0Id", decoded.auth0Id || "");
          localStorage.setItem("email", decoded.email || "");
        }

        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }

      try {
        const res = await fetch("http://localhost:3000/api/auth/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data.valid && data.user?.role === "admin") {
          setAccessGranted(true);
          scheduleRefresh(token); // programar refresh
        } else {
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

  if (!accessGranted) {
    return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>Acceso denegado</div>;
  }

  return <>{children}</>;
}