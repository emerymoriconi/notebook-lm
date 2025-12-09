import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FilesService, SummaryService, UserService, type FileOut, type SummaryOut, type UserProfileOut } from "../../client"

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Sparkles, Upload, ArrowRight, Clock, FileType, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardHome() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [user, setUser] = useState<UserProfileOut | null>(null)
  const [recentFiles, setRecentFiles] = useState<FileOut[]>([])
  const [recentSummaries, setRecentSummaries] = useState<SummaryOut[]>([])
  const [stats, setStats] = useState({ totalFiles: 0, totalSummaries: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const baseUrl = import.meta.env.VITE_API_URL

        // 1. Dados do Usuário (Fallback manual se SDK falhar no GET)
        let userData
        try {
            const res = await fetch(`${baseUrl}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.ok) userData = await res.json()
        } catch (e) { console.error("Erro user", e) }
        
        // 2. Arquivos e Resumos
        const [files, summaries] = await Promise.all([
          FilesService.listFilesFilesGet(),
          SummaryService.listSummariesSummaryGet()
        ])

        if (userData) setUser(userData)
        
        // Processar Arquivos Recentes (Últimos 4)
        const sortedFiles = [...files].sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
        setRecentFiles(sortedFiles.slice(0, 4))

        // Processar Resumos Recentes (Últimos 3)
        const sortedSummaries = [...summaries].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
        setRecentSummaries(sortedSummaries.slice(0, 3))

        setStats({
          totalFiles: files.length,
          totalSummaries: summaries.length
        })

      } catch (error) {
        console.error(error)
        toast({ title: "Erro", description: "Falha ao carregar dashboard.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [toast])

  // Helper de data
  const formatDate = (d: string) => new Date(d.endsWith("Z") ? d : d + "Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 min-h-screen bg-slate-950">
        <Skeleton className="h-12 w-1/3 bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 bg-slate-800" /><Skeleton className="h-32 bg-slate-800" /><Skeleton className="h-32 bg-slate-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header de Boas Vindas */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.full_name?.split(" ")[0] || "Usuário"} 👋</h1>
            <p className="text-slate-400 mt-1">Aqui está o panorama dos seus estudos hoje.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/files")} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
                <Upload className="mr-2 h-4 w-4" /> Novo Upload
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total de Arquivos</CardTitle>
              <FileText className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalFiles}</div>
              <p className="text-xs text-slate-500 mt-1">Documentos PDF armazenados</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Resumos Gerados</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalSummaries}</div>
              <p className="text-xs text-slate-500 mt-1">Insights produzidos por IA</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Acesso Rápido</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
               <Button variant="link" onClick={() => navigate("/summaries")} className="p-0 h-auto text-green-400 hover:text-green-300 text-sm">
                  Ir para Base de Conhecimento <ArrowRight className="ml-1 h-3 w-3" />
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Coluna Arquivos Recentes (4/7) */}
          <Card className="col-span-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Arquivos Recentes</CardTitle>
              <CardDescription className="text-slate-500">Seus últimos uploads.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Nenhum arquivo ainda.</div>
                ) : (
                    recentFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer" onClick={() => navigate(`/files/${file.id}`)}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                                    <FileType className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200 line-clamp-1">{file.file_name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {formatDate(file.upload_date)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-400">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coluna Resumos Recentes (3/7) */}
          <Card className="col-span-3 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Últimos Insights</CardTitle>
              <CardDescription className="text-slate-500">Resumos gerados recentemente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSummaries.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Nenhum resumo gerado.</div>
                ) : (
                    recentSummaries.map((summary) => (
                        <div key={summary.id} className="p-4 rounded-lg border border-slate-800 bg-slate-950/30 hover:bg-slate-950/50 transition-colors cursor-pointer" onClick={() => navigate("/summaries")}>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-3 w-3 text-purple-400" />
                                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">IA Generated</span>
                                <span className="ml-auto text-xs text-slate-600">{formatDate(summary.created_at || "")}</span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2">
                                {summary.summary_text.replace(/[#*`]/g, "")}
                            </p>
                        </div>
                    ))
                )}
                {recentSummaries.length > 0 && (
                    <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => navigate("/summaries")}>
                        Ver todos os resumos
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}