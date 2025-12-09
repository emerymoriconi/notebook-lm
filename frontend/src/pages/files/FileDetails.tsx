import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown' 
import { FilesService, SummaryService, type FileOut, type SummaryOut } from "../../client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Sparkles, Copy, FileText, Calendar, HardDrive, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FileDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  

  const fileId = Number(id)

  const [fileMetadata, setFileMetadata] = useState<FileOut | null>(null)
  const [summary, setSummary] = useState<SummaryOut | null>(null)
  
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // 1. Buscar Metadados do Arquivo
  const fetchFileMetadata = useCallback(async () => {
    if (!fileId) return
    try {

      const data = await FilesService.getFileMetadataFilesFileIdGet(fileId)
      setFileMetadata(data)
    } catch (error) {
      toast({ title: "Erro", description: "Arquivo não encontrado.", variant: "destructive" })
      navigate("/files")
    } finally {
      setIsLoadingMetadata(false)
    }
  }, [fileId, navigate, toast])


  const checkExistingSummary = useCallback(async () => {
    if (!fileId) return
    setIsLoadingSummary(true)
    try {
      const allSummaries = await SummaryService.listSummariesSummaryGet()

      const existing = allSummaries.find(s => s.file_ids === String(fileId))
      
      if (existing) {
        setSummary(existing)
      }
    } catch (error) {
      console.log("Nenhum resumo encontrado ou erro na busca")
    } finally {
      setIsLoadingSummary(false)
    }
  }, [fileId])

  useEffect(() => {
    fetchFileMetadata()
    checkExistingSummary()
  }, [fetchFileMetadata, checkExistingSummary])

  // 3. Gerar Resumo com IA
  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      const newSummary = await SummaryService.summarizeSingleFileSummarySinglePost(fileId)
      
      setSummary(newSummary)
      toast({ title: "Pronto!", description: "Resumo gerado com sucesso." })
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar resumo.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  // 4. Download PDF
  const handleDownload = async () => {
    if (!fileMetadata) return
    try {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL
      
      const response = await fetch(`${baseUrl}/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Falha no download")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Usa file_name vindo do FileOut
      a.download = fileMetadata.file_name 
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível baixar o arquivo.", variant: "destructive" })
    }
  }

  const handleCopySummary = () => {
    if (summary?.summary_text) {
      navigator.clipboard.writeText(summary.summary_text)
      toast({ title: "Copiado!", description: "Texto copiado." })
    }
  }

  // Formatters
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    const cleanDate = dateString.endsWith("Z") ? dateString : dateString + "Z"
    return new Date(cleanDate).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  if (isLoadingMetadata) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center">
        <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
      </div>
    )
  }

  if (!fileMetadata) return null

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/files")} className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">{fileMetadata.file_name}</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Coluna Esquerda: Metadados */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800 sticky top-6">
                <CardHeader>
                <CardTitle className="text-slate-200">Detalhes</CardTitle>
                <CardDescription className="text-slate-400">Metadados do arquivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-slate-500 uppercase">Nome</span>
                        <p className="text-sm text-slate-200 break-all">{fileMetadata.file_name}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-slate-500 uppercase">Data</span>
                        <div className="flex items-center gap-2 text-slate-200">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{formatDate(fileMetadata.upload_date)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-slate-500 uppercase">Tamanho</span>
                        <div className="flex items-center gap-2 text-slate-200">
                            <HardDrive className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{formatFileSize(fileMetadata.file_size)}</span>
                        </div>
                    </div>
                </div>

                <Button onClick={handleDownload} variant="outline" className="w-full gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Download className="h-4 w-4" /> Baixar PDF
                </Button>
                </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Resumo */}
          <div className="lg:col-span-2 space-y-6">
            {isLoadingSummary ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 space-y-4">
                  <Skeleton className="h-8 w-1/3 bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-2/3 bg-slate-800" />
                </CardContent>
              </Card>
            ) : !summary ? (
              <Card className="bg-slate-900 border-slate-800 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-blue-500/10 p-6 mb-6">
                    <Sparkles className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Gerar Resumo com IA</h3>
                  <p className="text-slate-400 max-w-md mb-8">
                    Extraia os pontos principais automaticamente.
                  </p>
                  <Button 
                    onClick={handleGenerateSummary} 
                    disabled={isGenerating} 
                    size="lg" 
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGenerating ? <><Sparkles className="animate-pulse" /> Gerando...</> : <><Sparkles /> Gerar Resumo</>}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-slate-100">Resumo do Documento</CardTitle>
                      <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-400 border-0">
                        <CheckCircle2 className="h-3 w-3" /> IA
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopySummary} className="text-slate-400 hover:text-white">
                      <Copy className="h-4 w-4" /> Copiar
                    </Button>
                  </div>
                  {summary.created_at && (
                    <CardDescription className="text-slate-500">
                        Gerado em {formatDate(summary.created_at)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Markdown Render */}
                  <div className="prose prose-invert prose-slate max-w-none prose-headings:text-slate-200 prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
                    <ReactMarkdown>{summary.summary_text}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}