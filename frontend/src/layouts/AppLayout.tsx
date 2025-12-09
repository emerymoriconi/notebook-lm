import { Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Simples */}
      <aside className="w-64 border-r border-slate-800 p-4 flex flex-col">
        <div className="mb-8 px-2 text-xl font-bold">NotebookLM Clone</div>
        
        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/files" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <FileText size={20} /> Meus Arquivos
          </Link>
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <User size={20} /> Perfil
          </Link>
        </nav>

        <Button variant="ghost" className="justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={handleLogout}>
          <LogOut size={20} /> Sair
        </Button>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-auto bg-slate-950 p-8">
        <Outlet />
      </main>
    </div>
  );
}