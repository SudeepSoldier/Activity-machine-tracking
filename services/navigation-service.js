import AsyncStorage from "@react-native-async-storage/async-storage"

// Key for storing the last active screen
const LAST_ACTIVE_SCREEN_KEY = "lastActiveScreen"

// Save the last active screen
export const saveLastActiveScreen = async (screenName) => {
  try {
    console.log(`[navigation-service] Saving last active screen: ${screenName}`)
    await AsyncStorage.setItem(LAST_ACTIVE_SCREEN_KEY, screenName)
    return true
  } catch (error) {
    console.error("[navigation-service] Error saving last active screen:", error)
    return false
  }
}

// Get the last active screen
export const getLastActiveScreen = async () => {
  try {
    const screenName = await AsyncStorage.getItem(LAST_ACTIVE_SCREEN_KEY)
    console.log(`[navigation-service] Retrieved last active screen: ${screenName || "none"}`)
    return screenName
  } catch (error) {
    console.error("[navigation-service] Error getting last active screen:", error)
    return null
  }
}

// Clear the last active screen
export const clearLastActiveScreen = async () => {
  try {
    await AsyncStorage.removeItem(LAST_ACTIVE_SCREEN_KEY)
    console.log("[navigation-service] Cleared last active screen")
    return true
  } catch (error) {
    console.error("[navigation-service] Error clearing last active screen:", error)
    return false
  }
}
