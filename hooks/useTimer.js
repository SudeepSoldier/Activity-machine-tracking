"use client"

import { useState, useEffect, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Constants for AsyncStorage keys
const TIMER_START_KEY_PREFIX = "timer_start_"
const TIMER_PAUSED_KEY_PREFIX = "timer_paused_"
const TIMER_RUNNING_KEY_PREFIX = "timer_running_"

export default function useTimer(initialTime = 0, autoStart = false, timerName = "default") {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  // Keys for this specific timer
  const startTimeKey = `${TIMER_START_KEY_PREFIX}${timerName}`
  const pausedTimeKey = `${TIMER_PAUSED_KEY_PREFIX}${timerName}`
  const isRunningKey = `${TIMER_RUNNING_KEY_PREFIX}${timerName}`

  // Function to update the timer display
  const updateTimerDisplay = async () => {
    try {
      // Check if timer is running
      const runningStr = await AsyncStorage.getItem(isRunningKey)
      const isTimerRunning = runningStr === "true"

      if (isTimerRunning) {
        // Get the start time
        const startTimeStr = await AsyncStorage.getItem(startTimeKey)
        if (startTimeStr) {
          const startTime = Number.parseInt(startTimeStr, 10)
          const now = Date.now()
          const elapsed = now - startTime

          console.log(
            `[Timer] Updating display. Start time: ${new Date(startTime).toISOString()}, Elapsed: ${Math.floor(elapsed / 1000)}s`,
          )

          // Update the time state
          setTime(elapsed)
          setIsRunning(true)

          // Start the interval if it's not already running
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              const now = Date.now()
              const elapsed = now - startTime
              setTime(elapsed)
            }, 1000)
          }
        }
      } else {
        // Timer is paused, get the paused time
        const pausedTimeStr = await AsyncStorage.getItem(pausedTimeKey)
        if (pausedTimeStr) {
          const pausedTime = Number.parseInt(pausedTimeStr, 10)
          console.log(`[Timer] Timer is paused. Paused time: ${Math.floor(pausedTime / 1000)}s`)
          setTime(pausedTime)
        }
        setIsRunning(false)

        // Clear the interval if it's running
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } catch (error) {
      console.error(`[Timer] Error updating timer display:`, error)
    }
  }

  // Initialize the timer
  useEffect(() => {
    const initTimer = async () => {
      try {
        console.log(`[Timer] Initializing timer: ${timerName}`)

        // Update the timer display
        await updateTimerDisplay()

        // Auto-start if needed
        if (autoStart) {
          start()
        }
      } catch (error) {
        console.error(`[Timer] Error initializing timer:`, error)
      }
    }

    initTimer()

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerName, autoStart])

  // Start the timer
  const start = async () => {
    try {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Calculate the start time
      let startTime
      const pausedTimeStr = await AsyncStorage.getItem(pausedTimeKey)

      if (pausedTimeStr) {
        // If we have a paused time, adjust the start time accordingly
        const pausedTime = Number.parseInt(pausedTimeStr, 10)
        startTime = Date.now() - pausedTime
        await AsyncStorage.removeItem(pausedTimeKey)
      } else {
        // Otherwise, start from the current time
        startTime = Date.now() - time
      }

      console.log(`[Timer] Starting timer. Start time: ${new Date(startTime).toISOString()}`)

      // Save the start time and running state
      await AsyncStorage.setItem(startTimeKey, startTime.toString())
      await AsyncStorage.setItem(isRunningKey, "true")

      // Update state
      setIsRunning(true)

      // Start the interval
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startTime
        setTime(elapsed)
      }, 1000)
    } catch (error) {
      console.error(`[Timer] Error starting timer:`, error)
    }
  }

  // Pause the timer
  const pause = async () => {
    try {
      if (!isRunning) return

      // Clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      console.log(`[Timer] Pausing timer. Elapsed time: ${Math.floor(time / 1000)}s`)

      // Save the paused time and update running state
      await AsyncStorage.setItem(pausedTimeKey, time.toString())
      await AsyncStorage.setItem(isRunningKey, "false")

      // Update state
      setIsRunning(false)
    } catch (error) {
      console.error(`[Timer] Error pausing timer:`, error)
    }
  }

  // Reset the timer
  const reset = async () => {
    try {
      // Clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      console.log(`[Timer] Resetting timer`)

      // Clear all timer data
      await AsyncStorage.removeItem(startTimeKey)
      await AsyncStorage.removeItem(pausedTimeKey)
      await AsyncStorage.removeItem(isRunningKey)

      // Update state
      setTime(0)
      setIsRunning(false)
    } catch (error) {
      console.error(`[Timer] Error resetting timer:`, error)
    }
  }

  // Format the time for display
  const formatTime = () => {
    const totalSeconds = Math.floor(time / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    }
  }

  // Force an update of the timer display
  const forceUpdate = async () => {
    await updateTimerDisplay()
  }

  return { time, isRunning, start, pause, reset, formatTime, forceUpdate }
}
