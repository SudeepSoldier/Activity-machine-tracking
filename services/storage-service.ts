import AsyncStorage from "@react-native-async-storage/async-storage"

const PASSCODE_KEY = "user_passcode"
const USER_ID_KEY = "user_id"
const CURRENT_JOB_KEY = "current_job"
const IS_ON_BREAK_KEY = "is_on_break"

export const savePasscode = async (passcode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PASSCODE_KEY, passcode)
  } catch (error) {
    console.error("Error saving passcode:", error)
  }
}

export const getPasscode = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PASSCODE_KEY)
  } catch (error) {
    console.error("Error getting passcode:", error)
    return null
  }
}

export const saveUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId)
  } catch (error) {
    console.error("Error saving user ID:", error)
  }
}

export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY)
  } catch (error) {
    console.error("Error getting user ID:", error)
    return null
  }
}

export const saveCurrentJob = async (jobId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_JOB_KEY, jobId)
  } catch (error) {
    console.error("Error saving current job:", error)
  }
}

export const getCurrentJob = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CURRENT_JOB_KEY)
  } catch (error) {
    console.error("Error getting current job:", error)
    return null
  }
}

export const setBreakStatus = async (isOnBreak: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(IS_ON_BREAK_KEY, isOnBreak.toString())
  } catch (error) {
    console.error("Error saving break status:", error)
  }
}

export const getBreakStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(IS_ON_BREAK_KEY)
    return status === "true"
  } catch (error) {
    console.error("Error getting break status:", error)
    return false
  }
}

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([PASSCODE_KEY, USER_ID_KEY, CURRENT_JOB_KEY, IS_ON_BREAK_KEY])
  } catch (error) {
    console.error("Error clearing user data:", error)
  }
}
