import { useState } from "react"
import { UserService, type UserProfileOut } from "../../client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Interface para garantir compatibilidade caso o UserProfileOut varie
interface EditProfileDialogProps {
  user: UserProfileOut | any 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditProfileDialog({ user, open, onOpenChange, onSuccess }: EditProfileDialogProps) {
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState(user.full_name || "")
  const [description, setDescription] = useState(user.description || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Lidar com a seleção de arquivo de imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Cria um preview local da imagem
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await UserService.updateProfileUserProfilePut(
        fullName, 
        description, 
      )

      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." })
      onSuccess() 
      onOpenChange(false)
      
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Falha ao atualizar perfil.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Helper para mostrar imagem atual ou preview
  const getImageUrl = () => {
    if (preview) return preview
    if (user.profile_image) {
        if (user.profile_image.startsWith("http")) return user.profile_image
        return `${import.meta.env.VITE_API_URL}/${user.profile_image}`
    }
    return ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription className="text-slate-400">
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                {getImageUrl() ? (
                    <img src={getImageUrl()} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {user.full_name?.[0] || "U"}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Input 
                    id="picture" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
                <Button asChild variant="secondary" size="sm" className="cursor-pointer bg-slate-800 text-slate-300 hover:bg-slate-700">
                    <label htmlFor="picture">
                        <Upload className="mr-2 h-4 w-4" /> Alterar Foto
                    </label>
                </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
            <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="bg-slate-950 border-slate-700 text-white" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-slate-300">Bio / Descrição</Label>
            <Textarea 
                id="bio" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-slate-950 border-slate-700 text-white" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}