import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

const params = new URLSearchParams(window.location.search);
const tokenFromAdmin = params.get("token");
if (tokenFromAdmin) {
  localStorage.setItem("auth_token", tokenFromAdmin);
  const clean = window.location.origin + window.location.pathname;
  window.history.replaceState({}, "", clean);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
