import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import { SummaryService, FilesService, type SummaryOut } from "../../client"

// Componentes UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Copy, BookOpen, Sparkles, Layers, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SummaryList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [summaries, setSummaries] = useState<SummaryOut[]>([])
  const [fileNames, setFileNames] = useState<Record<string, string>>({}) 
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado do Drawer de Leitura
  const [selectedSummary, setSelectedSummary] = useState<SummaryOut | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [summariesData, filesData] = await Promise.all([
        SummaryService.listSummariesSummaryGet(),
        FilesService.listFilesFilesGet()
      ])

      // 2.{ id: "nome_do_arquivo.pdf" }
      const nameMap: Record<string, string> = {}
      filesData.forEach(f => {
        nameMap[String(f.id)] = f.file_name
      })
      setFileNames(nameMap)

      // 3. Ordenar por data 
      const sorted = summariesData.sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      })
      
      setSummaries(sorted)
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Helpers ---
  
  const isMulti = (s: SummaryOut) => s.file_ids?.includes(",") || false

  const getSummaryTitle = (s: SummaryOut) => {
    if (isMulti(s)) return "Resumo Consolidado"
    return fileNames[s.file_ids] || `Arquivo #${s.file_ids}`
  }

  const formatDate = (d: string | undefined) => {
    if (!d) return "-"
    const cleanDate = d.endsWith("Z") ? d : d + "Z"
    return new Date(cleanDate).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric"
    })
  }

  const handleReadFull = (summary: SummaryOut) => {
    setSelectedSummary(summary)
    setIsSheetOpen(true)
  }

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado!", description: "Texto na área de transferência." })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Carregando base de conhecimento...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="text-blue-400" /> Meus Resumos
            </h1>
            <p className="text-slate-400">Base de conhecimento gerada pela IA</p>
          </div>
          <Button onClick={() => navigate("/files")} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <FileText className="mr-2 h-4 w-4"/> Gerar Novo
          </Button>
        </div>

        {/* Lista de Cards */}
        {summaries.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-slate-800 p-6 mb-6">
                <Sparkles className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Nenhum resumo encontrado</h3>
              <p className="text-slate-400 text-center mb-8 max-w-md">
                Seus resumos gerados aparecerão aqui. Vá para a aba de arquivos para começar.
              </p>
              <Button onClick={() => navigate("/files")} className="bg-blue-600 hover:bg-blue-500 text-white">
                Ir para Arquivos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {summaries.map((summary) => (
              <Card key={summary.id} className="bg-slate-900 border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`rounded-lg p-2 ${isMulti(summary) ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                      {isMulti(summary) ? <Layers className="h-5 w-5 text-purple-400" /> : <FileText className="h-5 w-5 text-blue-400" />}
                    </div>
                    <Badge variant="secondary" className="gap-1 bg-slate-800 text-slate-300 border-0">
                      <Sparkles className="h-3 w-3" />
                      {isMulti(summary) ? "Consolidado" : "Único"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-slate-100 line-clamp-1">
                    {getSummaryTitle(summary)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3 w-3" /> {formatDate(summary.created_at)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  {/* Preview do texto sem formatação markdown */}
                  <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed">
                    {summary.summary_text?.replace(/[#*`]/g, "") || "Sem conteúdo..."}
                  </p>
                </CardContent>
                
                <CardFooter className="flex gap-2 pt-4 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    className="flex-1 gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={() => handleReadFull(summary)}
                  >
                    <BookOpen className="h-4 w-4" /> Ler
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => handleCopySummary(summary.summary_text)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Sheet (Gaveta Lateral) para Leitura Completa */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-slate-950 border-l border-slate-800 text-slate-100 p-0">
            {selectedSummary && (
              <>
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
                    <SheetHeader>
                        <SheetTitle className="text-xl text-slate-100 flex items-center gap-2">
                            {isMulti(selectedSummary) ? <Layers className="text-purple-400"/> : <FileText className="text-blue-400"/>}
                            {getSummaryTitle(selectedSummary)}
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Gerado em {formatDate(selectedSummary.created_at)}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <ScrollArea className="h-[calc(100vh-180px)] p-6">
                  {/* Renderização do Markdown com tipografia ajustada */}
                  <div className="prose prose-invert prose-slate max-w-none 
                        prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 
                        prose-strong:text-white prose-a:text-blue-400">
                    <ReactMarkdown>{selectedSummary.summary_text}</ReactMarkdown>
                  </div>
                </ScrollArea>
                
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 absolute bottom-0 w-full flex gap-3">
                    <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white" variant="secondary" onClick={() => handleCopySummary(selectedSummary.summary_text)}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar Texto
                    </Button>
                    {!isMulti(selectedSummary) && (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white" onClick={() => navigate(`/files/${selectedSummary.file_ids}`)}>
                            Ver Arquivo Original
                        </Button>
                    )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </div>
  )
}