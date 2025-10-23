export default function ResultsAnalyticsBridge() {
  const BASE = (import.meta.env.VITE_RESULTS_APP_URL || "http://localhost:5178").replace(/\/+$/,"");
  let token = "";
  try { token = JSON.parse(localStorage.getItem("admin_auth") || "null")?.token || ""; } catch { /* empty */ }
  const url = `${BASE}/analytics${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  window.location.replace(url);
  return (
    <div className="page" style={{padding:24}}>
      <h1 className="page-title">Results Analytics</h1>
      <p>Opening analytics… ensure the Results app is running.</p>
    </div>
  );
}
