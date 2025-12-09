import { useState, useEffect, useCallback } from "react"
import { FilesService, type FileOut } from "../../client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, MoreVertical, Eye, Download, Trash2, FileUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FilesPage() {
  const { toast } = useToast()
  
  const [files, setFiles] = useState<FileOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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

  // 2. Upload em Lote com Validação de Duplicados
  const handleBatchUpload = async (fileList: File[]) => {
    const existingNames = new Set(files.map(f => f.file_name));
    
    const filesToUpload: File[] = [];
    let duplicatesIgnored = 0;
    let nonPdfIgnored = 0;

    fileList.forEach(file => {
        if (file.type !== "application/pdf") {
            nonPdfIgnored++;
            return;
        }

        if (existingNames.has(file.name)) {
            duplicatesIgnored++;
        } else {
            filesToUpload.push(file);
            existingNames.add(file.name);
        }
    });

    if (duplicatesIgnored > 0 || nonPdfIgnored > 0) {
        toast({
            title: "Alguns arquivos foram ignorados",
            description: `${duplicatesIgnored} duplicados e ${nonPdfIgnored} formato inválido.`,
            variant: "destructive" 
        });
    }

    if (filesToUpload.length === 0) return;

    setIsUploading(true)

    try {
      await Promise.all(
        filesToUpload.map(file => 
          FilesService.uploadFileFilesUploadPost({ upload: file })
        )
      )

      toast({ 
        title: "Sucesso!", 
        description: `${filesToUpload.length} arquivo(s) novo(s) enviado(s).` 
      })
      
      setIsUploadDialogOpen(false)
      fetchFiles() // Atualiza a tabela
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Falha ao enviar arquivos.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  // 3. Deletar (Local)
  const handleDelete = async (fileId: number) => {
    toast({ title: "Removido", description: "Arquivo ocultado da lista." })
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // 4. Download
  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL
      
      const response = await fetch(`${baseUrl}/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Erro download")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = filename; document.body.appendChild(a); a.click()
      window.URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao baixar.", variant: "destructive" })
    }
  }

  // --- Handlers de Eventos ---

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      handleBatchUpload(fileArray)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      handleBatchUpload(fileArray)
    }
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  // Formatters
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    let dateObj: Date;
    if (typeof dateString === 'string') {
        const cleanDate = dateString.endsWith("Z") ? dateString : dateString + "Z";
        dateObj = new Date(cleanDate);
    } else {
        dateObj = dateString;
    }
    return dateObj.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2" /> Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meus Arquivos</h1>
          <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
            <Upload className="h-4 w-4 mr-2" /> Upload PDF
          </Button>
        </div>

        {files.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileUp className="h-16 w-16 text-slate-600 mb-4" />
              <p className="text-xl font-semibold text-slate-200 mb-2">Nenhum arquivo enviado</p>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Começar agora
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Documentos ({files.length})</CardTitle>
              <CardDescription className="text-slate-400">Gerencie seus arquivos PDF enviados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900">
                    <TableHead className="text-slate-400">Nome</TableHead>
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400">Tamanho</TableHead>
                    <TableHead className="text-right text-slate-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          {file.file_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{formatDate(file.upload_date)}</TableCell>
                      <TableCell className="text-slate-300">{formatFileSize(file.file_size)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuItem onClick={() => alert("Em breve")} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" /> Ver Resumo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(file.id, file.file_name)} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                              <Download className="h-4 w-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modal de Upload */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Upload de Arquivos</DialogTitle>
              <DialogDescription className="text-slate-400">
                Arraste um ou mais PDFs aqui.
              </DialogDescription>
            </DialogHeader>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FileUp className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              
              <input 
                type="file" 
                accept="application/pdf" 
                multiple 
                onChange={handleFileSelect} 
                className="hidden" 
                id="file-input" 
                disabled={isUploading} 
              />
              
              <Button asChild disabled={isUploading} variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700">
                <label htmlFor="file-input" className="cursor-pointer">
                  {isUploading ? <><Loader2 className="animate-spin mr-2 h-4 w-4"/> Enviando...</> : "Selecionar Arquivos"}
                </label>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}