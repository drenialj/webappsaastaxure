"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/navbar"
import { FileUpload } from "@/components/FileUpload"
import { DocumentList } from "@/components/DocumentList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Willkommen, {user.email}
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie hier Ihre Dokumente und Uploads.
          </p>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dokumente
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ihre Dokumente</CardTitle>
                <CardDescription>
                  Hier finden Sie eine Übersicht aller hochgeladenen Dokumente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dokument hochladen</CardTitle>
                <CardDescription>
                  Laden Sie hier neue Dokumente hoch. Unterstützte Formate: PDF, JPG, PNG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 