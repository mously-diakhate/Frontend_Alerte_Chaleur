"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { apiService } from "../services/api"

interface User {
  id: number
  email: string
  username: string
  full_name: string
  situation: string
  region: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  adminLogin: (username: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const userData = await apiService.getProfile()
      setUser(userData)
    } catch (error) {
      console.error("Failed to load user:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const adminLogin = async (username: string, password: string) => {
    try {
      const response = await apiService.adminLogin(username, password)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  return {
    user,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
  }
}

export { AuthContext }
