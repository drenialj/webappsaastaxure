"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useMandants } from "@/hooks/useMandants"
import { Navbar } from "@/components/navbar"
import { MandantDocuments } from "@/components/MandantDocuments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Users, FileText } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { mandants, loading, error } = useMandants()
  const [selectedMandantId, setSelectedMandantId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "Kanzlei") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || user.role !== "Kanzlei") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Kanzlei-Dashboard
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie hier Ihre Mandanten und deren Dokumente.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Ihre Mandanten</CardTitle>
            </div>
            <CardDescription>
              Eine Übersicht aller Ihrer Mandanten und deren Dokumente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                {error}
              </div>
            )}
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Mandanten werden geladen...
              </div>
            ) : mandants.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Noch keine Mandanten vorhanden.
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-4 p-4 font-medium text-sm text-muted-foreground">
                  <div>E-Mail</div>
                  <div>Status</div>
                  <div className="text-right">Aktionen</div>
                </div>
                <div className="divide-y">
                  {mandants.map((mandant) => (
                    <div
                      key={mandant.id}
                      className="grid grid-cols-3 gap-4 p-4 items-center text-sm"
                    >
                      <div>{mandant.email}</div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10">
                          Aktiv
                        </span>
                      </div>
                      <div className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setSelectedMandantId(mandant.id)}
                        >
                          <FileText className="h-4 w-4" />
                          Dokumente anzeigen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Sheet
          open={!!selectedMandantId}
          onOpenChange={() => setSelectedMandantId(null)}
        >
          <SheetContent side="right" className="w-full sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>
                Dokumente von{" "}
                {mandants.find((m) => m.id === selectedMandantId)?.email}
              </SheetTitle>
            </SheetHeader>
            {selectedMandantId && (
              <div className="mt-6">
                <MandantDocuments
                  mandantId={selectedMandantId}
                  onClose={() => setSelectedMandantId(null)}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  )
} 