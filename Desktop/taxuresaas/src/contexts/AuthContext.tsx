'use client';

import * as React from "react"
import { createContext, useContext, useState } from "react"

interface AuthContextType {
  user: any | null
  register: (email: string, password: string, role: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)

  const register = async (email: string, password: string, role: string) => {
    // Implementiere Register-Logik hier
    setUser({ email, role })
  }

  const login = async (email: string, password: string) => {
    // Implementiere Login-Logik hier
    setUser({ email })
  }

  const logout = async () => {
    // Implementiere Logout-Logik hier
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 