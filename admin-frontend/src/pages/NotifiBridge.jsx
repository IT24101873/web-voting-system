// admin-frontend/src/pages/NotifiBridge.jsx
import { useEffect } from "react";

function readAdminToken() {
  try {
    const raw = localStorage.getItem("admin_auth");
    return raw ? (JSON.parse(raw)?.token || null) : null;
  } catch {
    return null;
  }
}

export default function NotifiBridge() {
  useEffect(() => {
    const t = readAdminToken();
    const base = import.meta.env.VITE_NOTIFI_APP_URL || "http://localhost:5176"; 
    const url = new URL(base);
    if (t) url.searchParams.set("token", t);
    window.location.replace(url.toString());
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Notifications</h1>
      <p>Opening notifications… If nothing happens, start the notifications app.</p>
    </div>
  );
}
