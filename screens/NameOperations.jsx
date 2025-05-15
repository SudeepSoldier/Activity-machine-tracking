"use client"

import { useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import useTimer from "../hooks/useTimer"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { getActiveJob, getCompleteActiveJob, saveActiveJob, clearActiveJob } from "../services/job-service"
import { useCallback } from "react"
import { AppState } from "react-native"
import axios from "axios"
import { saveLastActiveScreen } from "../services/navigation-service"
import NetInfo from '@react-native-community/netinfo';

export default function NameOperations({ route }) {
  // Get job data from route params or use null if not available
  const routeParams = route?.params || {}

  const [jobData, setJobData] = useState(null)
  const [completeJobData, setCompleteJobData] = useState(null)
  const [machineData, setMachineData] = useState(null)
  const [tabletData, setTabletData] = useState(null)
  const [userName, setUserName] = useState("Operator")
  const [isLoading, setIsLoading] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)
  const timer = useTimer(0, false, "job") // Use "job" as timer name, don't 
  // auto-start
  const navigation = useNavigation()
  const appStateRef = useRef(AppState.currentState)
  // const [machineName,setMachineName] = useState('')
  // const [machineCode,setMachineCode] = useState('')
  
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  useEffect(()=>{

    if(isConnected===false){

      async function getmachineData(){
        const data = await AsyncStorage.getItem("machineData")

        const parseData = JSON.parse(data)

        setMachineData(parseData)

      } 

      getmachineData()
    }

  })


  const addingSyncBody = async (data) => {
    try {
      const jsonValue = await AsyncStorage.getItem('syncData');
  
      // Make sure you parse and fallback to an empty array if null
      const array = jsonValue != null ? JSON.parse(jsonValue) : [];
  
      // ✅ Now safe to spread
      const modifiedArray = [...array, data];
      

      console.log("modifiedArray----------->",modifiedArray)

      await AsyncStorage.setItem('syncData', JSON.stringify(modifiedArray));
      console.log('Modified array saved to key2');

      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(`[NameOperations] App state changed from ${appStateRef.current} to ${nextAppState}`)

      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("[NameOperations] App has come to the foreground, forcing timer update")
        timer.forceUpdate()
      }

      appStateRef.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Fetch active job data from API
  const fetchActiveJobData = async () => {
    try {
      setApiLoading(true)
      console.log("[NameOperations] Fetching active job data from API")

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        console.error("[NameOperations] No authentication token found for API call")
        throw new Error("Authentication token not found")
      }

      // Set up headers with token
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cookie": "_vercel_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ5eFE2aVBVbTdzajBCYTBKT29JdjFnZ1oiLCJpYXQiOjE3NDY1MzY2MzEsIm93bmVySWQiOiJ0ZWFtX1RUQW04eTFBV0JPNFBsRXhLSkxtVHRuaiIsImF1ZCI6InYwLW1hY2hpbmUtdHJhY2tpbmctejktanBxcTVoNWQ0LWFnbXMtcHJvamVjdHMtZGM5NmI1MWYudmVyY2VsLmFwcCIsInVzZXJuYW1lIjoibXVydHV6YWthcGFkaWExMjEtZ21haWxjb20iLCJzdWIiOiJzc28tcHJvdGVjdGlvbiJ9.SViuUYgGVOvKFgM1ddfssHZDRqnoow_JWu1SyeiXmW0; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTc4NDg1My0zZmY4LTQwODItYWIwYS04ODc2ODhkZTYzYmQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQ2NTM3MTYzLCJleHAiOjE3NDY2MjM1NjN9.vFl3_Z4uEf68grZYpgbQJYLGrwcagxvMbxhAY2YVz1U"
      }

      // Call the active job API
      const activeJobUrl =
        "https://v0-machine-tracking-z9-lkc6nrahd-agms-projects-dc96b51f.vercel.app/api/operator/jobs/active"
      console.log(`[NameOperations] Calling active job API: ${activeJobUrl}`)

      // Make the API call
      const response = await axios.get(activeJobUrl, { headers })
      console.log("[NameOperations] Active job API response status:", response.status)

      if (response.data) {
        console.log("[NameOperations] Active job data received:", JSON.stringify(response.data).substring(0, 200))

        // Save the complete active job data
        await saveActiveJob(response.data)
        console.log("[NameOperations] Complete job data saved to AsyncStorage")

        // Store the complete job data
        setCompleteJobData(response.data)

        // Update state with the received data
        if (response.data.activeJob) {
          setJobData(response.data.activeJob)
        }
        if (response.data.machine) {


          
          setMachineData(response.data.machine)


        }
        if (response.data.tablet) {
          setTabletData(response.data.tablet)
        }

        // start job data storing for async api
        
        
        

        return response.data
      } else {
        throw new Error("No data received from active job API")
      }
    } catch (error) {
      console.error("[NameOperations] Error fetching active job data:", error)

      // Don't throw the error, just return null to allow fallback
      return null
    } finally {
      setApiLoading(false)
    }
  }

  // Load job data and start the timer
  useEffect(() => {
    const initializeJob = async () => {
      try {
        console.log("[NameOperations] Initializing job with route params:", routeParams)

        setIsLoading(true)

        // Get user data from AsyncStorage
        const userData = await AsyncStorage.getItem("userData")
        if (userData) {
          const parsedUserData = JSON.parse(userData)
          setUserName(parsedUserData.name || parsedUserData.fullName || "Operator")
        }

        // Always fetch active job data from API first
        const activeJobData = await fetchActiveJobData()

        // If we couldn't get data from the API, use fallback methods
        if (!activeJobData) {
          console.log("[NameOperations] No data from active job API, using fallback methods")

          // Try to get complete job data from storage
          const storedCompleteJobData = await getCompleteActiveJob()
          if (storedCompleteJobData) {
            console.log("[NameOperations] Found complete job data in storage")
            setCompleteJobData(storedCompleteJobData)

            // Set job data from the activeJob property
            if (storedCompleteJobData.activeJob) {
              setJobData(storedCompleteJobData.activeJob)
            }

            // Set machine and tablet data
            if (storedCompleteJobData.machine) {

              await AsyncStorage.setItem("machineData",JSON.stringify(storedCompleteJobData.machine))
              setMachineData(storedCompleteJobData.machine)
            }
            if (storedCompleteJobData.tablet) {
              setTabletData(storedCompleteJobData.tablet)
            }
          } else {
            // Set initial job data from route params if available
            if (routeParams.jobId) {
              console.log("[NameOperations] Setting initial job data from route params")
              setJobData(routeParams)
            } else {
              console.log("[NameOperations] No job data from route params, checking storage")
              // No job data from navigation, try to get it from storage
              const storedJobData = await getActiveJob()
              if (storedJobData) {
                console.log("[NameOperations] Using job data from storage:", storedJobData)
                setJobData(storedJobData)
              } else {
                console.log("[NameOperations] No job data available, navigating to ChangeJob")
                // No job data available, navigate to ChangeJob
                navigation.replace("ChangeJob")
                return
              }
            }

            // If we have route params but haven't saved them yet, save them
            if (routeParams.jobId && !(await getActiveJob())) {
              await saveActiveJob({
                activeJob: routeParams,
              })
            }
          }
        }

        // Check if we're on break
        const onBreak = await AsyncStorage.getItem("onBreak")
        if (onBreak === "true") {
          console.log("[NameOperations] User is on break, not starting job timer")
          // If on break, don't start the timer
          // The timer will be resumed when the user returns from break
        } else {
          // Check if timer was already running
          const isRunning = await AsyncStorage.getItem("timer_running_job")
          if (isRunning === "true") {
            console.log("[NameOperations] Timer was already running, updating display")
            // Timer was already running, update the display
            await timer.forceUpdate()
          } else {
            // No timer running, start a new timer
            console.log("[NameOperations] Starting new job timer")
            timer.start()
          }
        }
      } catch (error) {
        console.error("[NameOperations] Error initializing job:", error)
        Alert.alert("Initialization Error", "There was an error initializing the job. Please try again.", [
          { text: "OK", onPress: () => navigation.replace("ChangeJob") },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initializeJob()
  }, [])

  // Save nameOperation as the last active screen when this component mounts
  useEffect(() => {
    saveLastActiveScreen("nameOperation")
  }, [])

  // Resume timer when returning from break
  useFocusEffect(
    useCallback(() => {
      const checkBreakStatus = async () => {
        try {
          const breakEnded = await AsyncStorage.getItem("breakEnded")
          if (breakEnded === "true") {
            console.log("[NameOperations] Break ended, resuming job timer")
            // Clear the flag
            await AsyncStorage.removeItem("breakEnded")
            // Resume the timer
            timer.start()
          }
        } catch (error) {
          console.error("[NameOperations] Error checking break status:", error)
        }
      }

      checkBreakStatus()
    }, []),
  )

  // Update the handleTakeBreak function to call the breaks API
  const handleTakeBreak = async () => {
    try {
      setIsLoading(true)

      // Get authentication token
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        console.error("[NameOperations] No authentication token found for API call")
        Alert.alert("Authentication Error", "Please log in again to continue.")
        return
      }

      // Get the job ID
      const jobIdToUse = jobData?.id || jobData?.jobId
      if (!jobIdToUse) {
        console.error("[NameOperations] No job ID found")
        Alert.alert("Error", "No job ID found. Please try again.")
        return
      }

      // Call the breaks API with the correct body
      const breaksApiUrl =
        "https://v0-machine-tracking-z9-6fvoblp1l-agms-projects-dc96b51f.vercel.app/api/operator/breaks"
      console.log(`[NameOperations] Calling breaks API: ${breaksApiUrl}`)

      const body = {
        action: "start",
        jobId: jobIdToUse,
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      console.log("[NameOperations] API request:", body)

      
      // Make the API call to start a break
      const response = await axios.post(breaksApiUrl, body, { headers })
      
      console.log("[NameOperations] Break API response:", response.status, response.data)
      
      const data = {
        action:"start_break",
        timestamp:response.data.activity.timestamp,
        payload:{
          jobId:response.data.activity.jobId
        }
      }

      addingSyncBody(data)

      // Pause the job timer
      await timer.pause()

      // Set a flag to indicate we're on break
      await AsyncStorage.setItem("onBreak", "true")

      // Store break ID if returned from API
      if (response.data && response.data.breakId) {
        await AsyncStorage.setItem("currentBreakId", response.data.breakId)
      }

      // Store break start time
      await AsyncStorage.setItem("breakStartTime", Date.now().toString())

      // Navigate to TakeBreak with job data
      navigation.navigate("TakeBreak", {
        jobId: jobIdToUse,
        jobNumber: jobData?.number || jobData?.jobNumber,
        description: jobData?.description,
      })
    } catch (error) {
      console.error("[NameOperations] Error taking break:", error)

      if (error.response) {
        console.error("[NameOperations] API error response:", error.response.status, error.response.data)
      }

      Alert.alert("Error", "Failed to start break. Please try again.", [
        {
          text: "Try Again",
          onPress: handleTakeBreak,
        },
        {
          text: "Continue Anyway",
          onPress: async () => {
            // Proceed with local break functionality even if API call failed
            await timer.pause()
            await AsyncStorage.setItem("onBreak", "true")
            await AsyncStorage.setItem("breakStartTime", Date.now().toString())
            navigation.navigate("TakeBreak", {
              jobId: jobData?.id || jobData?.jobId,
              jobNumber: jobData?.number || jobData?.jobNumber,
              description: jobData?.description,
            })
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndJob = async () => {
    try {
      setIsLoading(true)

      // Get the job and assignment IDs
      const jobIdToUse = jobData?.id || jobData?.jobId
      const assignmentIdToUse = jobData?.assignmentId
      const jobNumberToUse = jobData?.number || jobData?.jobNumber

      if (!jobIdToUse) {
        Alert.alert("Error", "Job ID not found. Please try again.")
        return
      }

      // Navigate to EndJob screen with all necessary data
      navigation.navigate("EndJob", {
        jobId: jobIdToUse,
        jobNumber: jobNumberToUse,
        description: jobData?.description,
        assignmentId: assignmentIdToUse,
        completeJobData: completeJobData, // Pass the complete job data
      })
    } catch (error) {
      console.error("[NameOperations] Error ending job:", error)
      Alert.alert("Error", "Failed to end job. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeJob = () => {
    navigation.navigate("ChangeJob")
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      // Clear the active job
      await clearActiveJob()

      // Navigate to Logout screen
      navigation.navigate("Logout", {
        jobId: jobData?.id || jobData?.jobId,
        jobNumber: jobData?.number || jobData?.jobNumber,
      })
    } catch (error) {
      console.error("[NameOperations] Error navigating to logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // // Debug function to check timer state
  // const handleDebug = async () => {
  //   try {
  //     console.log("[DEBUG] Debug button pressed")

  //     // Check timer state
  //     const startTime = await AsyncStorage.getItem("timer_start_job")
  //     const pausedTime = await AsyncStorage.getItem("timer_paused_job")
  //     const isRunning = await AsyncStorage.getItem("timer_running_job")

  //     console.log("[DEBUG] Timer state:")
  //     console.log(
  //       `[DEBUG] Start time: ${startTime ? new Date(Number.parseInt(startTime, 10)).toISOString() : "Not set"}`,
  //     )
  //     console.log(
  //       `[DEBUG] Paused time: ${pausedTime ? Math.floor(Number.parseInt(pausedTime, 10) / 1000) + "s" : "Not set"}`,
  //     )
  //     console.log(`[DEBUG] Is running: ${isRunning}`)

  //     // Force timer update
  //     await timer.forceUpdate()
  //     console.log("[DEBUG] Timer updated")
  //   } catch (error) {
  //     console.error("[DEBUG] Error in debug function:", error)
  //   }
  // }

  const { hours, minutes, seconds } = timer.formatTime()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Ionicons name="warning" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileRole}>OPERATOR</Text>
        </View>
      </View>

      {/* Info Cards Section */}
      <View style={styles.cardsContainer}>
        {/* Machine Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Machine</Text>
          <Text style={styles.cardSubtitle}>Currently operating</Text>

          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardMainText}>{machineData?.name || "CNC Mill 1"}</Text>
              <Text style={styles.cardSecondaryText}>Code: {machineData?.code || "CNC-001"}</Text>
            </View>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Active Job Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Job</Text>
          <Text style={styles.cardSubtitle}>Currently in progress</Text>

          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardMainText}>{jobData?.number || jobData?.jobNumber || "JOB-2023-001"}</Text>
              <Text style={styles.cardSecondaryText}>
                {jobData?.description || "Manufacturing of aerospace components"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Timer Section */}
      <View style={styles.timerCard}>
        <Text style={styles.timerTitle}>Current Session</Text>
        <Text style={styles.timerSubtitle}>Time elapsed since login</Text>

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

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakeBreak} disabled={isLoading}>
            <Ionicons name="pause" size={24} color="#0891B2" />
            <Text style={styles.actionText}>Take Break</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleChangeJob} disabled={isLoading}>
            <Ionicons name="create-outline" size={24} color="#0891B2" />
            <Text style={styles.actionText}>Change Job</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEndJob} disabled={isLoading}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#0891B2" />
            <Text style={styles.actionText}>End Job</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout} disabled={isLoading}>
            <Ionicons name="log-out-outline" size={24} color="#E11D48" />
            <Text style={[styles.actionText, { color: "#64748B" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading overlay */}
      {(isLoading || apiLoading) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0891B2" />
            <Text style={styles.loadingText}>{apiLoading ? "Loading job data..." : "Processing..."}</Text>
          </View>
        </View>
      )}

      {/* Debug button - always visible for now to help troubleshoot */}
      {/* <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          backgroundColor: "#FF0000",
          padding: 10,
          borderRadius: 5,
        }}
        onPress={handleDebug}
      >
        <Text style={{ color: "#FFFFFF" }}>Debug</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
    marginTop:30
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0891B2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    justifyContent: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  profileRole: {
    fontSize: 16,
    color: "#64748B",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginHorizontal:20
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMainText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  cardSecondaryText: {
    fontSize: 14,
    color: "#64748B",
  },
  activeTag: {
    backgroundColor: "#0891B2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeTagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal:20
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  timerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  timerBlock: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: 80,
  },
  timerDigit: {
    fontSize: 32,
    fontWeight: "600",
    color: "#0891B2",
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
  actionsContainer: {
    marginTop: "auto",
    marginHorizontal:20,
    marginBottom:50
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    height:96,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor:"#E2E8F0",
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: "#0891B2",
    fontSize: 16,
  },
})
