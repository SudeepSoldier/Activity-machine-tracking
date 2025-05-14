import AsyncStorage from "@react-native-async-storage/async-storage"

// Function to log the current timer state
export const logTimerState = async (timerKey = "jobTimer") => {
  try {
    const timerData = await AsyncStorage.getItem(timerKey)
    console.log(`[DEBUG] Timer state for ${timerKey}:`, timerData)

    if (timerData) {
      const parsedData = JSON.parse(timerData)
      const now = Date.now()

      if (parsedData.isRunning) {
        const elapsed = now - parsedData.startTime
        console.log(`[DEBUG] Timer is running. Start time: ${new Date(parsedData.startTime).toISOString()}`)
        console.log(`[DEBUG] Elapsed time: ${Math.floor(elapsed / 1000)}s (${elapsed}ms)`)
      } else if (parsedData.pausedTime) {
        console.log(
          `[DEBUG] Timer is paused. Paused time: ${Math.floor(parsedData.pausedTime / 1000)}s (${parsedData.pausedTime}ms)`,
        )
      }
    } else {
      console.log(`[DEBUG] No timer data found for ${timerKey}`)
    }
  } catch (error) {
    console.error(`[DEBUG] Error logging timer state:`, error)
  }
}

// Function to manually set the timer state (for testing)
export const setTimerState = async (timerKey = "jobTimer", isRunning = true, startTimeOffset = 0) => {
  try {
    const now = Date.now()
    const startTime = now - startTimeOffset

    const timerState = {
      isRunning,
      startTime,
      pausedTime: isRunning ? null : startTimeOffset,
      lastUpdated: now,
    }

    console.log(`[DEBUG] Setting timer state for ${timerKey}:`, timerState)
    await AsyncStorage.setItem(timerKey, JSON.stringify(timerState))

    return true
  } catch (error) {
    console.error(`[DEBUG] Error setting timer state:`, error)
    return false
  }
}
