import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMemo, useCallback } from "react";
import AdminHome from "./pages/AdminHome.jsx";
import Students from "./pages/Students.jsx";
import NotifiBridge from "./pages/NotifiBridge.jsx";
import DashboardBridge from "./pages/DashboardBridge.jsx";
import ResultsBridge from "./pages/ResultsBridge";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import NomineeBridge from "./pages/NomineeBridge.jsx";
import ResultsAnalyticsBridge from "./pages/ResultsAnalyticsBridge.jsx";

export default function App() {
  const loc = useLocation();
  const isAdminPath = loc.pathname.startsWith("/admin"); 

  const isAuthed = useMemo(() => {
    try {
      const v = JSON.parse(localStorage.getItem("admin_auth") || "null");
      return !!(v && v.token);
    } catch {
      return false;
    }
  }, []);

  const handleLogout = useCallback(() => {
    ["admin_auth", "token", "accessToken", "refreshToken", "role", "user"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    try {
      sessionStorage.setItem(
        "nav_toast",
        JSON.stringify({ ts: Date.now(), kind: "success", message: "Logged out successfully." })
      );
    } catch {}
    const dest = new URL("/", window.location.origin);
    dest.searchParams.set("toast", "logout");
    dest.searchParams.set("msg", "Logged out successfully.");
    window.location.replace(dest.toString());
  }, []);

  if (isAdminPath && !isAuthed) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`}
        replace
      />
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        <div className="app-main__container">
          <Routes>
            <Route index element={<AdminHome onLogout={handleLogout} />} />
            <Route path="students" element={<Students onLogout={handleLogout} />} />
            <Route path="nominees" element={<NomineeBridge />} />
            <Route path="notifications" element={<NotifiBridge />} />
            <Route path="dashboard" element={<DashboardBridge />} />
            <Route path="results-analytics" element={<ResultsAnalyticsBridge />} />
            <Route path="results" element={<ResultsBridge />} />

            {/* Absolute paths kept */}
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />

            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
