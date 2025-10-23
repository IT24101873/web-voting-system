// admin-frontend/src/pages/NomineeBridge.jsx
import { useEffect } from "react";

function readAdminToken() {
  try {
    const raw = localStorage.getItem("admin_auth");
    return raw ? (JSON.parse(raw)?.token || null) : null;
  } catch { return null; }
}

export default function NomineeBridge() {
  useEffect(() => {
    const t = readAdminToken();
    // Set your nominee app URL here (or via VITE_NOMINEE_URL)
    const base = import.meta.env.VITE_NOMINEE_URL || "http://localhost:5176";
    const url = new URL(base);
    if (t) url.searchParams.set("token", t);
    window.location.replace(url.toString());
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Nominees</h1>
      <p>Opening nominees… If nothing happens, start the nominee app.</p>
    </div>
  );
}
