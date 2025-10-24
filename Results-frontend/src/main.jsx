import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

const qs = new URLSearchParams(window.location.search);
const t = qs.get("token");
if (t) {
  sessionStorage.setItem("admin_jwt", t);
  const clean = window.location.pathname + window.location.hash;
  window.history.replaceState({}, "", clean);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
