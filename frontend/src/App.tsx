import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Importações
import Login from "./pages/auth/Login"; // Esse arquivo agora cuida dos dois
import AppLayout from "./layouts/AppLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";

// ... (PrivateRoute mantém igual)
const PrivateRoute = () => {
  const token = localStorage.getItem('access_token');
  return token ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        
        {/* ROTAS PRIVADAS */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/files" element={<div className="text-white p-4">Lista de Arquivos (Em breve)</div>} />
            <Route path="/profile" element={<div className="text-white p-4">Perfil (Em breve)</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;