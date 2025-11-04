import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ModernDashboard from "../Components/ModernDashboard";
import Home from '../Components/Home'

export default function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ModernDashboard />} />
      </Routes>
    </Router>
  );
}
