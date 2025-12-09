import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom" 
import { AuthService } from "../../client"
import { ApiError } from "../../client/core/ApiError"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, UserCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast" 

export default function Login() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation() 


  const [activeTab, setActiveTab] = useState<string>("login")

  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveTab("register")
    } else {
      setActiveTab("login")
    }
  }, [location.pathname])

  const onTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/${value}`)
  }

  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [registerFullName, setRegisterFullName] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    try {
      const response = await AuthService.loginAuthLoginPost({
        username: loginUsername,
        password: loginPassword,
      })
      localStorage.setItem("access_token", response.access_token)
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." })
      navigate("/dashboard")
    } catch (error) {
      toast({ title: "Erro", description: "Credenciais inválidas.", variant: "destructive" })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    try {
      await AuthService.registerAuthRegisterPost({
            full_name: registerFullName,
            username: registerUsername,
            email: registerEmail,
            password: registerPassword,
      })
      toast({ title: "Conta criada!", description: "Faça login para continuar." })
      
      onTabChange("login")
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
         ? (error.body?.detail || "Erro desconhecido")
         : "Falha ao criar conta."
      
      const displayMsg = Array.isArray(errorMessage) ? errorMessage[0].msg : errorMessage
         
      toast({ title: "Erro no cadastro", description: displayMsg, variant: "destructive" })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">NotebookLM</CardTitle>
          <CardDescription className="text-center text-slate-400">
            {activeTab === "login" ? "Acesse sua conta" : "Crie sua conta gratuitamente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Tabs Controladas pelo Estado activeTab */}
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="login-username"
                      placeholder="user"
                      className="pl-9 bg-slate-950 border-slate-700"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 bg-slate-950 border-slate-700"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input placeholder="Seu nome" value={registerFullName} onChange={e => setRegisterFullName(e.target.value)} required className="pl-9 bg-slate-950 border-slate-700"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input placeholder="usuario" value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} required className="pl-9 bg-slate-950 border-slate-700"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input type="email" placeholder="email@exemplo.com" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required className="pl-9 bg-slate-950 border-slate-700"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Senha</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input type="password" placeholder="••••••••" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required className="pl-9 bg-slate-950 border-slate-700"/>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isRegistering}>
                  {isRegistering ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}