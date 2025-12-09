import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FilesService, SummaryService, type FileOut } from "../../client"

// Componentes UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, MoreVertical, Eye, Download, Trash2, FileUp, Loader2, Sparkles, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FilesPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [files, setFiles] = useState<FileOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados de Upload
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Estados de Seleção Múltipla e Resumo
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isMultiSummaryOpen, setIsMultiSummaryOpen] = useState(false)
  const [multiSummaryTopic, setMultiSummaryTopic] = useState("")
  const [isGeneratingMulti, setIsGeneratingMulti] = useState(false)

  // 1. Busca os arquivos
  const fetchFiles = useCallback(async () => {
    try {
      const data = await FilesService.listFilesFilesGet()
      setFiles(data)
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao listar arquivos.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // --- Lógica de Seleção ---
  
  const toggleSelectAll = () => {
    if (selectedIds.size === files.length && files.length > 0) {
      setSelectedIds(new Set()) // Desmarcar tudo
    } else {
      setSelectedIds(new Set(files.map(f => f.id))) // Marcar tudo
    }
  }

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  // --- Lógica de Resumo Múltiplo ---

  const handleMultiSummarize = () => {
    if (selectedIds.size < 2) {
      toast({ title: "Atenção", description: "Selecione pelo menos 2 arquivos para consolidar.", variant: "default" })
      return
    }
    // Abre o modal para pedir o tópico
    setMultiSummaryTopic("")
    setIsMultiSummaryOpen(true)
  }

  const submitMultiSummary = async () => {
    setIsGeneratingMulti(true)
    try {
      const fileIdsArray = Array.from(selectedIds)
      
      // Chama o endpoint de Multi Resumo
      await SummaryService.summarizeMultiFilesSummaryMultiPost({
        file_ids: fileIdsArray,
        content: multiSummaryTopic || "Gere um resumo consolidado destacando os pontos principais de todos os arquivos." 
      })

      toast({ title: "Sucesso!", description: "Resumo consolidado criado com sucesso." })
      setIsMultiSummaryOpen(false)
      setSelectedIds(new Set()) // Limpa seleção após sucesso
      
      // Aqui poderíamos redirecionar para a lista de resumos (Task #19)
      
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar resumo consolidado.", variant: "destructive" })
    } finally {
      setIsGeneratingMulti(false)
    }
  }

  // --- Lógica de Upload ---
  const handleBatchUpload = async (fileList: File[]) => {
    const existingNames = new Set(files.map(f => f.file_name));
    const filesToUpload: File[] = [];
    
    fileList.forEach(file => {
        if (file.type === "application/pdf" && !existingNames.has(file.name)) {
            filesToUpload.push(file);
            existingNames.add(file.name);
        }
    });

    if (filesToUpload.length === 0) {
        toast({ title: "Aviso", description: "Nenhum arquivo novo ou válido para enviar." })
        return;
    }

    setIsUploading(true)
    try {
      await Promise.all(
        filesToUpload.map(file => FilesService.uploadFileFilesUploadPost({ upload: file }))
      )
      toast({ title: "Sucesso!", description: `${filesToUpload.length} arquivos enviados.` })
      setIsUploadDialogOpen(false)
      fetchFiles()
    } catch (error) {
      toast({ title: "Erro", description: "Falha no upload.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  // Handlers de Upload (Drop, Select)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.length) handleBatchUpload(Array.from(e.dataTransfer.files))
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleBatchUpload(Array.from(e.target.files))
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  // --- Ações Individuais ---
  const handleDelete = async (fileId: number) => {
     // Simulação local pois API não tem DELETE
     setFiles(prev => prev.filter(f => f.id !== fileId))
     toast({ title: "Removido", description: "Arquivo ocultado da lista." })
  }
  
  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${baseUrl}/files/${fileId}/download`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error()
      const blob = await response.blob(); 
      const url = window.URL.createObjectURL(blob); 
      const a = document.createElement("a"); 
      a.href = url; a.download = filename; 
      document.body.appendChild(a); a.click(); 
      window.URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch { 
      toast({ title: "Erro", description: "Erro ao baixar arquivo", variant: "destructive" }) 
    }
  }

  // Formatters
  const formatFileSize = (bytes: number | undefined) => { 
    if (!bytes) return "0 B"
    if (bytes < 1024) return `${bytes} B`; 
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(2)} KB`; 
    return `${(bytes/(1024*1024)).toFixed(2)} MB` 
  }
  const formatDate = (d: string | undefined) => {
      if(!d) return "-"
      const cleanDate = d.endsWith("Z") ? d : d+"Z"
      return new Date(cleanDate).toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"})
  }

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando...</div>

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header com Ações em Massa */}
        <div className="flex items-center justify-between h-10">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-4 bg-blue-900/30 border border-blue-800 px-4 py-2 rounded-lg w-full animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium text-blue-200">{selectedIds.size} selecionado(s)</span>
              <div className="h-4 w-px bg-blue-800 mx-2"></div>
              <Button size="sm" onClick={handleMultiSummarize} className="gap-2 bg-blue-600 hover:bg-blue-500 text-white border-0">
                <Sparkles className="h-4 w-4" /> Gerar Resumo Consolidado
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="ml-auto text-slate-400 hover:text-white">
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Meus Arquivos</h1>
              <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                <Upload className="h-4 w-4 mr-2" /> Upload PDF
              </Button>
            </>
          )}
        </div>

        {/* Tabela */}
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900">
                    <TableHead className="w-[50px] pl-4">
                      <Checkbox 
                        checked={files.length > 0 && selectedIds.size === files.length} 
                        onCheckedChange={toggleSelectAll}
                        className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableHead>
                    <TableHead className="text-slate-400">Nome</TableHead>
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400">Tamanho</TableHead>
                    <TableHead className="text-right text-slate-400 pr-4">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">Nenhum arquivo encontrado.</TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                    <TableRow key={file.id} className={`border-slate-800 hover:bg-slate-800/50 ${selectedIds.has(file.id) ? "bg-blue-900/10" : ""}`}>
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedIds.has(file.id)}
                          onCheckedChange={() => toggleSelect(file.id)}
                          className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/files/${file.id}`)}>
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="hover:underline">{file.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{formatDate(file.upload_date)}</TableCell>
                      <TableCell className="text-slate-300">{formatFileSize(file.file_size)}</TableCell>
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuItem onClick={() => navigate(`/files/${file.id}`)} className="cursor-pointer focus:bg-slate-800">
                              <Eye className="h-4 w-4 mr-2" /> Detalhes / Resumo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(file.id, file.file_name)} className="cursor-pointer focus:bg-slate-800">
                              <Download className="h-4 w-4 mr-2" /> Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-red-400 focus:bg-red-950/30 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        {/* Modal Upload */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
             <DialogHeader><DialogTitle>Upload</DialogTitle><DialogDescription>Selecione seus PDFs</DialogDescription></DialogHeader>
             <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging?"border-blue-500":"border-slate-700"}`}
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
             >
                <input type="file" multiple accept="application/pdf" className="hidden" id="upl" onChange={handleFileSelect} disabled={isUploading}/>
                <Button asChild variant="secondary" disabled={isUploading}><label htmlFor="upl" className="cursor-pointer">{isUploading?"Enviando...":"Selecionar Arquivos"}</label></Button>
             </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Resumo Múltiplo */}
        <Dialog open={isMultiSummaryOpen} onOpenChange={setIsMultiSummaryOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" /> Resumo Consolidado
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                A IA vai ler os {selectedIds.size} arquivos selecionados e criar um único resumo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-slate-200">Foco do Resumo (Opcional)</Label>
                <Input 
                  id="topic" 
                  placeholder="Ex: Identifique os pontos em comum entre os documentos..." 
                  className="bg-slate-950 border-slate-700 text-white"
                  value={multiSummaryTopic}
                  onChange={(e) => setMultiSummaryTopic(e.target.value)}
                />
                <p className="text-xs text-slate-500">Isso ajuda a IA a saber o que procurar nos documentos.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsMultiSummaryOpen(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
              <Button onClick={submitMultiSummary} disabled={isGeneratingMulti} className="bg-blue-600 hover:bg-blue-500 text-white">
                {isGeneratingMulti ? <><Loader2 className="animate-spin mr-2 h-4 w-4"/> Gerando...</> : "Gerar Resumo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}