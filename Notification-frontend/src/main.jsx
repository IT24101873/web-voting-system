import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// --- bootstrap token passed via ?token=... from Admin's NotifiBridge ---
(function bootstrapTokenFromQuery() {
  try {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) {
      // store for this origin (5176)
      localStorage.setItem("auth_token", t);
      // optional mirror shape if some code expects admin_auth
      localStorage.setItem("admin_auth", JSON.stringify({ token: t }));

      // clean URL so the token isn't left visible
      url.searchParams.delete("token");
      const clean = url.pathname + (url.search ? "?" + url.search : "") + url.hash;
      window.history.replaceState({}, "", clean);
    }
  } catch (err) {
    console.warn("Token bootstrap skipped:", err);
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
