"use client"

import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState, useRef } from "react"
import useTimer from "../hooks/useTimer"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getActiveJob } from "../services/job-service"
import { AppState } from "react-native"
import axios from "axios"
import colors from "../utils/Colors"

export default function OnBreak({ route }) {
  const routeParams = route?.params || {}
  const [jobData, setJobData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const appStateRef = useRef(AppState.currentState)


  const storeData = async (key, value) => {
    try {
      console.log("data is saved succssfully................................")
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Saving error', e);
    }
  };
  
  // Get data
  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      const parsedData = JSON.parse(value)
      return parsedData;
    } catch (e) {
      console.error('Reading error', e);
      return null;
    }
  };

  // console.log("getDataAsync",getData("asyncApiData"))

  // Use a separate timer for break with its own name
  const breakTimer = useTimer(0, false, "break") // Don't auto-start

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(`[OnBreak] App state changed from ${appStateRef.current} to ${nextAppState}`)

      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("[OnBreak] App has come to the foreground, forcing timer update")
        breakTimer.forceUpdate()
      }

      appStateRef.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Load job data and start break timer
  useEffect(() => {
    const initializeBreak = async () => {
      try {
        setIsLoading(true)

        // Get job data from route params or storage
        let currentJobData = null

        if (routeParams.jobId) {
          console.log("[OnBreak] Using job data from route params:", routeParams)
          currentJobData = routeParams
        } else {
          console.log("[OnBreak] No job data from route params, checking storage")
          // No job data from navigation, try to get it from storage
          const storedJobData = await getActiveJob()
          if (storedJobData) {
            console.log("[OnBreak] Using job data from storage:", storedJobData)
            currentJobData = storedJobData
          } else {
            console.log("[OnBreak] No job data available, navigating to ChangeJob")
            Alert.alert("Error", "No active job found. Please select a job.", [
              { text: "OK", onPress: () => navigation.replace("ChangeJob") },
            ])
            return
          }
        }

        setJobData(currentJobData)

        // Check if we're already on break (app might have restarted)
        const onBreak = await AsyncStorage.getItem("onBreak")
        if (onBreak === "true") {
          console.log("[OnBreak] Already on break, checking timer state")

          // Check if break timer is already running
          const isRunning = await AsyncStorage.getItem("timer_running_break")
          if (isRunning === "true") {
            console.log("[OnBreak] Break timer was already running, updating display")
            await breakTimer.forceUpdate()
          } else {
            console.log("[OnBreak] Starting new break timer")
            await AsyncStorage.setItem("onBreak", "true")
            breakTimer.start()
          }
        } else {
          console.log("[OnBreak] Starting new break")
          await AsyncStorage.setItem("onBreak", "true")
          breakTimer.start()
        }
      } catch (error) {
        console.error("[OnBreak] Error initializing break:", error)
        Alert.alert("Error", "Failed to initialize break. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    initializeBreak()
  }, [])

  const handleEndBreak = async () => {
    try {
      setIsLoading(true)

      // Get break duration before stopping the timer
      const breakDuration = breakTimer.time

      // Get authentication token
      const token = await AsyncStorage.getItem("token")
      if (token) {
        // Get the current break ID if available
        const breakId = await AsyncStorage.getItem("currentBreakId")

        // Call the breaks API to end the break
        const breaksApiUrl =
          "https://v0-machine-tracking-z9-6fvoblp1l-agms-projects-dc96b51f.vercel.app/api/operator/breaks"
        console.log(`[OnBreak] Calling breaks API to end break: ${breaksApiUrl}`)

        const body = {
          action: "end",
          jobId: jobData?.id || jobData?.jobId,
          breakId: breakId || "",
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
            "Cookie" : "_vercel_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ5eFE2aVBVbTdzajBCYTBKT29JdjFnZ1oiLCJpYXQiOjE3NDY1MzY2MzEsIm93bmVySWQiOiJ0ZWFtX1RUQW04eTFBV0JPNFBsRXhLSkxtVHRuaiIsImF1ZCI6InYwLW1hY2hpbmUtdHJhY2tpbmctejktanBxcTVoNWQ0LWFnbXMtcHJvamVjdHMtZGM5NmI1MWYudmVyY2VsLmFwcCIsInVzZXJuYW1lIjoibXVydHV6YWthcGFkaWExMjEtZ21haWxjb20iLCJzdWIiOiJzc28tcHJvdGVjdGlvbiJ9.SViuUYgGVOvKFgM1ddfssHZDRqnoow_JWu1SyeiXmW0; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTc4NDg1My0zZmY4LTQwODItYWIwYS04ODc2ODhkZTYzYmQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQ2NTM3MTYzLCJleHAiOjE3NDY2MjM1NjN9.vFl3_Z4uEf68grZYpgbQJYLGrwcagxvMbxhAY2YVz1U"

        }

        console.log("[OnBreak] End break API request:", body)

        // Make the API call to end the break
        const response = await axios.post(breaksApiUrl, body, { headers })

        console.log("[OnBreak] End break API response:", response.status, response.data)

        // Clear the break ID
        await AsyncStorage.removeItem("currentBreakId")
      }

      // Store total break time for job duration calculations
      const existingBreakTimeStr = await AsyncStorage.getItem("totalBreakTime")
      const existingBreakTime = existingBreakTimeStr ? Number.parseInt(existingBreakTimeStr, 10) : 0
      const newTotalBreakTime = existingBreakTime + breakDuration
      await AsyncStorage.setItem("totalBreakTime", newTotalBreakTime.toString())

      console.log(
        `[OnBreak] Break ended. Duration: ${Math.floor(breakDuration / 1000)}s, Total break time: ${Math.floor(
          newTotalBreakTime / 1000,
        )}s`,
      )

      // Stop break timer
      await breakTimer.pause()
      await breakTimer.reset()

      // Clear break flag
      await AsyncStorage.removeItem("onBreak")

      // Set flag to resume job timer when returning to NameOperations
      await AsyncStorage.setItem("breakEnded", "true")

      // Navigate back to NameOperations
      navigation.navigate("nameOperation")
      console.log("Break Ended succefully");
    } catch (error) {
      console.error("[OnBreak] Error ending break:", error)

      if (error.response) {
        console.error("[OnBreak] API error response:", error.response.status, error.response.data)
      }

      Alert.alert("Error", "Failed to end break via API. Would you like to try again or continue anyway?", [
        {
          text: "Try Again",
          onPress: handleEndBreak,
        },
        {
          text: "Continue Anyway",
          onPress: async () => {
            // Proceed with local break functionality even if API call failed
            const breakDuration = breakTimer.time
            const existingBreakTimeStr = await AsyncStorage.getItem("totalBreakTime")
            const existingBreakTime = existingBreakTimeStr ? Number.parseInt(existingBreakTimeStr, 10) : 0
            const newTotalBreakTime = existingBreakTime + breakDuration
            await AsyncStorage.setItem("totalBreakTime", newTotalBreakTime.toString())

            await breakTimer.pause()
            await breakTimer.reset()
            await AsyncStorage.removeItem("onBreak")
            await AsyncStorage.setItem("breakEnded", "true")
            navigation.navigate("nameOperation")
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const { hours, minutes, seconds } = breakTimer.formatTime()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Card */}
      <View style={styles.mainCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="cafe-outline" size={32} color={colors.blue} />
        </View>
        <Text style={styles.mainTitle}>On Break</Text>
        <Text style={styles.mainSubtitle}>Your job is currently paused</Text>
      </View>

      {/* Job Card */}
      <View style={styles.jobCard}>
        <Text style={styles.cardLabel}>Current Job</Text>
        <Text style={styles.jobNumber}>{jobData?.jobNumber || jobData?.number || "JOB-2023-001"}</Text>
      </View>

      {/* Break Duration Card */}
      <View style={styles.durationCard}>
        <Text style={styles.durationTitle}>Break Duration</Text>

        <View style={styles.timerContainer}>
          <View style={styles.timerBlock}>
            <Text style={styles.timerDigit}>{hours.toString().padStart(2, "0")}</Text>
            <Text style={styles.timerLabel}>Hour</Text>
          </View>

          <Text style={styles.timerSeparator}>:</Text>

          <View style={styles.timerBlock}>
            <Text style={styles.timerDigit}>{minutes.toString().padStart(2, "0")}</Text>
            <Text style={styles.timerLabel}>Minute</Text>
          </View>

          <Text style={styles.timerSeparator}>:</Text>

          <View style={styles.timerBlock}>
            <Text style={styles.timerDigit}>{seconds.toString().padStart(2, "0")}</Text>
            <Text style={styles.timerLabel}>Second</Text>
          </View>
        </View>
      </View>

      {/* End Break Button */}
      <TouchableOpacity style={styles.endBreakButton} onPress={handleEndBreak} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.endBreakText}>End Break & Return to Work</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Machine is paused during break time</Text>
        <Text style={styles.footerText}>Break time will be recorded in your activity log</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  mainCard: {
    backgroundColor: "#F4F4F4",
    borderColor:"#D9D9D9",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    marginTop:100,
    marginHorizontal:25,
     borderWidth: 2,
    borderColor: "#E2E8F0",
  
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    borderColor:"#e2e8f0",
    alignItems: "center",
    marginBottom: 16,

  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  jobCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
     marginHorizontal:25,
     borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cardLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  jobNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  durationCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 24,
    marginBottom: 32,
    marginHorizontal:25,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  durationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  timerBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: 80,
  },
  timerDigit: {
    fontSize: 32,
    fontWeight: "600",
    color: "#148CB8",
    fontFamily: "monospace",
  },
  timerLabel: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  timerSeparator: {
    fontSize: 32,
    fontWeight: "600",
    color: "#000000",
    marginHorizontal: 8,
  },
  endBreakButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#148CB8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    marginHorizontal:120,
    marginTop: 100
  },
  buttonIcon: {
    marginRight: 8,
  },
  endBreakText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footer: {
    marginTop: 4,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
})
