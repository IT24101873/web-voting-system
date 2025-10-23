import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import EventManager from "./pages/EventManager.jsx";
import CategoryManager from "./pages/CategoryManager.jsx";
import NomineeManager from "./pages/NomineeManager.jsx";

export default function App() {
  return (
    <main className="app-main">
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventManager />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/nominees" element={<NomineeManager />} />
        </Routes>
      </div>
    </main>
  );
}
