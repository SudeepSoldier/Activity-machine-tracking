"use client"

import NetInfo from "@react-native-community/netinfo"
import { useEffect, useState } from "react"

// Singleton to track network state across the app
let isConnected = false
let listeners: Array<(connected: boolean) => void> = []

// Initialize network monitoring
export const initNetworkMonitoring = () => {
  // Subscribe to network state updates
  const unsubscribe = NetInfo.addEventListener((state) => {
    const connected = state.isConnected === true && state.isInternetReachable === true

    // Only notify if state changed
    if (connected !== isConnected) {
      isConnected = connected

      // Notify all listeners
      listeners.forEach((listener) => listener(isConnected))
    }
  })

  return unsubscribe
}

// Add a listener for network state changes
export const addNetworkListener = (listener: (connected: boolean) => void) => {
  listeners.push(listener)

  // Return function to remove listener
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Get current network state
export const checkNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  isConnected = state.isConnected === true && state.isInternetReachable === true
  return isConnected
}

// Hook to use network state in components
export const useNetworkStatus = () => {
  const [isNetworkConnected, setIsNetworkConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkNetworkConnection()
      setIsNetworkConnected(connected)
    }

    // Check connection immediately
    checkConnection()

    // Subscribe to changes
    const unsubscribe = addNetworkListener((connected) => {
      setIsNetworkConnected(connected)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return isNetworkConnected
}
