import { useEffect } from "react";

function readAdminToken() {
  try {
    const raw = localStorage.getItem("admin_auth");
    return raw ? (JSON.parse(raw)?.token || null) : null;
  } catch { return null; }
}

export default function ResultsBridge() {
  useEffect(() => {
    const t = readAdminToken();
    if (t) window.location.replace(`http://localhost:5178/?token=${encodeURIComponent(t)}`);
  }, []);
  return (
    <div className="page" style={{padding:24}}>
      <h1 className="page-title">Results & Reports</h1>
      <p>Opening results app… Make sure port 5178 is running.</p>
    </div>
  );
}
