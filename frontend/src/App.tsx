import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";


import Login from "./pages/auth/Login"; 
import AppLayout from "./layouts/AppLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import FilesList from "./pages/files/FilesList";
import FileDetails from "./pages/files/FileDetails";
import SummaryList from "./pages/summaries/SummaryList";
import UserProfile from "./pages/profile/UserProfile";

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
            <Route path="/files" element={<FilesList />} />
            <Route path="/files/:id" element={<FileDetails />} />
            <Route path="/summaries" element={<SummaryList />} />
            <Route path="/profile" element={<UserProfile />} />
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