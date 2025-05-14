import AsyncStorage from "@react-native-async-storage/async-storage"
import { initDatabase, insertUser } from "./database-service"

// Key for storing the auth token
const AUTH_TOKEN_KEY = "token"

// Store the authentication token
export const storeAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)

    // Also store in SQLite for backward compatibility
    const db = await initDatabase()
    const userData = {
      isLogin: true,
      token: token,
    }
    await insertUser(db, userData)

    return true
  } catch (error) {
    console.error("Failed to store auth token:", error)
    return false
  }
}

// Get the authentication token
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to get auth token:", error)
    return null
  }
}

// Remove the authentication token (logout)
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    return true
  } catch (error) {
    console.error("Failed to remove auth token:", error)
    return false
  }
}

// Check if the user is authenticated
export const isAuthenticated = async () => {
  const token = await getAuthToken()
  return !!token
}
