import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Settings from './pages/settings';
import Registre from "./pages/registre";
import ForgotPassword from "./pages/ForgotPassword";
import ModifierCompte from './pages/ModifierCompte';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/registre" element={<Registre />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/modifier-compte" element={<ModifierCompte />} />
        {/* Route par défaut pour les chemins non trouvés */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;