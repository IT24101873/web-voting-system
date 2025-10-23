import { useEffect } from "react";

function readAdminToken() {
  try {
    const raw = localStorage.getItem("admin_auth"); // should contain { token: "..." }
    return raw ? (JSON.parse(raw)?.token || null) : null;
  } catch { return null; }
}

export default function DashboardBridge() {
  useEffect(() => {
    const t = readAdminToken();
    if (t) {
      // open the separate dashboard app on 5177 and pass token once
      window.location.replace(`http://localhost:5177/?token=${encodeURIComponent(t)}`);
    }
  }, []);
  return (
    <div className="page" style={{padding:24}}>
      <h1 className="page-title">Dashboard</h1>
      <p>Opening dashboard… If nothing happens, make sure the app on port 5177 is running.</p>
    </div>
  );
}
