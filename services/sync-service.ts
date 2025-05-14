import BackgroundTimer from "react-native-background-timer"
import {
  getDBConnection,
  getUnsyncedSessions,
  getUnsyncedBreaks,
  markSessionAsSynced,
  markBreakAsSynced,
} from "./database-service"
import { checkNetworkConnection, addNetworkListener } from "./network-service"
import * as apiService from "./api-service"

// Sync interval in milliseconds (10 minutes)

const SYNC_INTERVAL = 10 * 60 * 1000

let syncTimerId: number | null = null
let isSyncing = false

// Start background sync
export const startBackgroundSync = () => {
  if (syncTimerId !== null) {
    return // Already started
  }

  // Set up network listener to sync when connection is restored
  addNetworkListener(async (connected) => {
    if (connected) {
      await syncData()
    }
  })

  // Set up periodic sync
  syncTimerId = BackgroundTimer.setInterval(async () => {
    const isConnected = await checkNetworkConnection()
    if (isConnected) {
      await syncData()
    }
  }, SYNC_INTERVAL)

  // Initial sync attempt
  checkNetworkConnection().then((isConnected) => {
    if (isConnected) {
      syncData()
    }
  })
}

// Stop background sync
export const stopBackgroundSync = () => {
  if (syncTimerId !== null) {
    BackgroundTimer.clearInterval(syncTimerId)
    syncTimerId = null
  }
}

// Sync data with server
export const syncData = async (): Promise<boolean> => {
  // Prevent multiple syncs running simultaneously
  if (isSyncing) {
    return false
  }

  isSyncing = true

  try {
    const db = await getDBConnection()

    // Sync job sessions
    const unsyncedSessions = await getUnsyncedSessions(db)
    for (const session of unsyncedSessions) {
      try {
        // Only sync completed sessions
        if (session.end_time) {
          await apiService.syncJobSession({
            id: session.id,
            jobId: session.job_id,
            userId: session.user_id,
            startTime: session.start_time,
            endTime: session.end_time,
          })

          await markSessionAsSynced(db, session.id)
        }
      } catch (error) {
        console.error(`Failed to sync job session ${session.id}:`, error)
        // Continue with next session
      }
    }

    // Sync break sessions
    const unsyncedBreaks = await getUnsyncedBreaks(db)
    for (const breakSession of unsyncedBreaks) {
      try {
        // Only sync completed breaks
        if (breakSession.end_time) {
          await apiService.syncBreakSession({
            id: breakSession.id,
            jobSessionId: breakSession.job_session_id,
            userId: breakSession.user_id,
            startTime: breakSession.start_time,
            endTime: breakSession.end_time,
          })

          await markBreakAsSynced(db, breakSession.id)
        }
      } catch (error) {
        console.error(`Failed to sync break session ${breakSession.id}:`, error)
        // Continue with next break
      }
    }

    return true
  } catch (error) {
    console.error("Sync error:", error)
    return false
  } finally {
    isSyncing = false
  }
}

// Force immediate sync
export const forceSyncData = async (): Promise<boolean> => {
  const isConnected = await checkNetworkConnection()
  if (isConnected) {
    return syncData()
  }
  return false
}
