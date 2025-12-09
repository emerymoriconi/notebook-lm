import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FilesService, SummaryService, type UserProfileOut } from "../../client"
import { EditProfileDialog } from "./EditProfileDialog"

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, User, Mail, FileText, Sparkles, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UserProfile() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [user, setUser] = useState<UserProfileOut | null>(null)
  const [stats, setStats] = useState({ files: 0, summaries: 0 })
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado para controlar o Modal de Edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL

      // 1. Buscamos dados do perfil na nova rota GET /user/profile
      const userResponse = await fetch(`${baseUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!userResponse.ok) {
         throw new Error("Falha ao buscar perfil")
      }

      const userData = await userResponse.json()
      setUser(userData)

      // 2. Arquivos e resumos para as estatísticas
      const [filesData, summariesData] = await Promise.all([
        FilesService.listFilesFilesGet(),
        SummaryService.listSummariesSummaryGet()
      ])

      setStats({
        files: filesData.length,
        summaries: summariesData.length
      })

    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar perfil.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    toast({ title: "Até logo!", description: "Você saiu da conta." })
    navigate("/login")
  }

  // Helper iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Montar a URL da imagem
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    const baseUrl = import.meta.env.VITE_API_URL
    return `${baseUrl}/${path}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Carregando perfil...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-100">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-slate-800 shadow-lg">
              {/* Usa a função helper para montar a URL correta da imagem */}
              <AvatarImage src={getImageUrl(user.profile_image)} className="object-cover" />
              <AvatarFallback className="bg-blue-600 text-xl font-bold text-white">
                {getInitials(user.full_name || user.username || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-slate-900"></div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">{user.full_name}</CardTitle>
          <CardDescription className="text-slate-400">@{user.username}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 flex flex-col items-center justify-center hover:border-blue-500/50 transition-colors">
              <FileText className="h-6 w-6 text-blue-400 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.files}</span>
              <span className="text-xs text-slate-500 uppercase font-medium">Arquivos</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 flex flex-col items-center justify-center hover:border-purple-500/50 transition-colors">
              <Sparkles className="h-6 w-6 text-purple-400 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.summaries}</span>
              <span className="text-xs text-slate-500 uppercase font-medium">Resumos Gerados</span>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Dados do Usuário (Read Only) */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-slate-400">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input readOnly value={user.full_name || ""} className="pl-9 bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-0 cursor-default" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input readOnly value={user.email} className="pl-9 bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-0 cursor-default" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-400">Descrição / Bio</Label>
              <Input readOnly value={user.description || "Sem descrição definida."} className="bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-0 cursor-default" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800 pt-6">
          <Button 
            variant="outline" 
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
          
          <Button variant="destructive" onClick={handleLogout} className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50">
            <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de Edição Conectado */}
      {user && (
        <EditProfileDialog 
            user={user} 
            open={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            onSuccess={fetchProfileData} 
        />
      )}
    </div>
  )
}