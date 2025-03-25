"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"Mandant" | "Kanzlei">("Mandant")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const kanzleiCode = formData.get("kanzleiCode") as string

    try {
      await register({
        email,
        password,
        role,
        ...(role === "Mandant" && { kanzleiCode })
      })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Konto erstellen
          </CardTitle>
          <CardDescription className="text-center">
            Registrieren Sie sich für Ihren Zugang
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm border rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-Mail-Adresse
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@beispiel.de"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium leading-none">
                Rolle
              </label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "Mandant" | "Kanzlei")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie Ihre Rolle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mandant">Mandant</SelectItem>
                  <SelectItem value="Kanzlei">Kanzlei</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role === "Mandant" && (
              <div className="space-y-2">
                <label htmlFor="kanzleiCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Kanzlei-Code
                </label>
                <Input
                  id="kanzleiCode"
                  name="kanzleiCode"
                  type="text"
                  placeholder="E-Mail oder ID der Kanzlei"
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Wird registriert..." : "Registrieren"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Bereits registriert?{" "}
              <Link 
                href="/login" 
                className="text-primary underline-offset-4 hover:underline"
              >
                Jetzt anmelden
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 