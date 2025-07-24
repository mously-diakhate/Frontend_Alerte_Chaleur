"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { apiService } from "../services/api"

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const useAuthProvider = () => {
  const [user, setUser] = useState(null)
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

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

 const adminLogin = async (email, password) => {
  try {
    const response = await apiService.adminLogin(email, password);
    setUser(response.user);

    // Stocker dans localStorage que c'est un admin connecté
    localStorage.setItem("admin", "true");

    // Si le backend renvoie un token, le stocker aussi
    if (response.access_token) {
      localStorage.setItem("access_token", response.access_token);
    }

    return response;
  } catch (error) {
    throw error;
  }
};


  const register = async (userData) => {
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
