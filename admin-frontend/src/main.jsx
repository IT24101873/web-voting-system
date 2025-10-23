import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicHome from "./pages/PublicHome.jsx";
import Landing from "./pages/Landing.jsx"
import PublicEvent from "./pages/PublicEvent.jsx";
import Login from "./pages/Login.jsx";
import App from "./App.jsx"; 
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<PublicHome />} />
        <Route path="/e/:eventId" element={<PublicEvent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login?tab=signup" replace />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* Admin app */}
        <Route path="/admin/*" element={<App />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
