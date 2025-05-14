"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create the context
export const Context = createContext({
  authenticated: false,
  isLogin: () => {},
  logout: () => {},
})

// Create the context provider
const ContextProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        console.log("Initial auth check - Token exists:", !!token)
        setAuthenticated(!!token)
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const isLogin = () => {
    console.log("Setting authenticated to true")
    setAuthenticated(true)
  }

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token")
      console.log("Token removed from AsyncStorage")
      // IMPORTANT: Make sure this line is present to update the authentication state
      setAuthenticated(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Context value
  const contextValue = {
    authenticated,
    isLogin,
    logout,
  }

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export default ContextProvider