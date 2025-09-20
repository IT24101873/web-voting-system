// src/main.jsx (or src/index.jsx)
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import EditNotification from "./EditNotification.jsx"; // <-- new file
import "./App.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home = your existing Compose + History UI */}
        <Route path="/" element={<App />} />
        {/* New page for editing */}
        <Route path="/edit/:id" element={<EditNotification />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
