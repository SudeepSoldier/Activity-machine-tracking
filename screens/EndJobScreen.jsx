"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { clearActiveJob, getActiveJob, getCompleteActiveJob } from "../services/job-service"
import axios from "axios"
import Ionicons from "react-native-vector-icons/Ionicons"
import { saveLastActiveScreen } from "../services/navigation-service"

export default function EndJobScreen({ route }) {
  const { jobId, jobNumber, assignmentId } = route.params || {}
  const [capsulesMade, setCapsulesMade] = useState("")
  const [completionNote, setCompletionNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [jobData, setJobData] = useState(null)
  const [completeJobData, setCompleteJobData] = useState(null)
  const navigation = useNavigation()

  // Save EndJob as the last active screen when this component mounts
  useEffect(() => {
    saveLastActiveScreen("EndJob")

    // Also save the route params to AsyncStorage for recovery
    const saveRouteParams = async () => {
      if (route.params) {
        try {
          await AsyncStorage.setItem("endJobParams", JSON.stringify(route.params))
          console.log("[EndJobScreen] Route params saved to AsyncStorage")
        } catch (error) {
          console.error("[EndJobScreen] Error saving route params:", error)
        }
      }
    }

    saveRouteParams()
  }, [route.params])

  // Load job data if not provided in route params
  useEffect(() => {
    const loadJobData = async () => {
      try {
        setIsLoading(true)

        // First, try to get the complete job data
        const storedCompleteJobData = await getCompleteActiveJob()
        if (storedCompleteJobData) {
          console.log(
            "[EndJobScreen] Found complete job data:",
            JSON.stringify(storedCompleteJobData).substring(0, 200) + "...",
          )
          setCompleteJobData(storedCompleteJobData)

          // Set job data from the activeJob property
          if (storedCompleteJobData.activeJob) {
            setJobData(storedCompleteJobData.activeJob)
          }
        }

        // If we don't have job data yet, try to get it from route params or storage
        if (!jobData) {
          if (jobId) {
            setJobData({
              id: jobId,
              number: jobNumber,
              assignmentId: assignmentId,
            })
          } else {
            // Try to get from saved route params
            const savedParams = await AsyncStorage.getItem("endJobParams")
            if (savedParams) {
              const params = JSON.parse(savedParams)
              console.log("[EndJobScreen] Using saved route params:", params)
              setJobData({
                id: params.jobId,
                number: params.jobNumber,
                assignmentId: params.assignmentId,
              })
            } else {
              // Fall back to active job data
              const storedJobData = await getActiveJob()
              if (storedJobData) {
                setJobData(storedJobData)
              }
            }
          }
        }
      } catch (error) {
        console.error("[EndJobScreen] Error loading job data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadJobData()
  }, [jobId, jobNumber, assignmentId])

  const handleCompleteJob = async () => {
    if (!capsulesMade) {
      Alert.alert("Error", "Please enter the number of capsules produced.")
      return
    }

    try {
      setIsLoading(true)

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token")

      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.")
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
        return
      }

      // Get the full job data if not already loaded
      const currentJobData = jobData || completeJobData?.activeJob || (await getActiveJob())

      if (!currentJobData) {
        Alert.alert("Error", "Job data not found. Please try again.")
        return
      }

      // Log the job data we're using
      console.log("[EndJobScreen] Completing job with data:", JSON.stringify(currentJobData))

      // Set up headers with token
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      // Get the correct IDs
      const jobIdToUse = currentJobData.id || currentJobData.jobId
      const assignmentIdToUse = currentJobData.assignmentId

      if (!jobIdToUse) {
        Alert.alert("Error", "Job ID not found. Please try again.")
        return
      }

      if (!assignmentIdToUse) {
        console.warn("[EndJobScreen] Assignment ID not found, proceeding with job ID only")
      }

      // Set up request body
      const body = {
        jobId: jobIdToUse,
        assignmentId: assignmentIdToUse,
        capsulesMade: Number.parseInt(capsulesMade, 10),
        completionNote: completionNote || "Job completed successfully",
      }

      console.log("[EndJobScreen] API request body:", JSON.stringify(body))

      try {
        // Make the API call
        console.log("[EndJobScreen] Completing job via API")
        const response = await axios.post(
          "https://v0-machine-tracking-z9-lkc6nrahd-agms-projects-dc96b51f.vercel.app/api/operator/jobs/complete",
          body,
          { headers },
        )
        console.log("[EndJobScreen] Job completed successfully:", response.status, response.data)

        // Clear the active job
        await clearActiveJob()

        // Clear the saved EndJob params
        await AsyncStorage.removeItem("endJobParams")

        // Navigate to ChangeJob screen
        Alert.alert("Success", "Job completed successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("ChangeJob"),
          },
        ])
      } catch (apiError) {
        console.error("[EndJobScreen] API error:", apiError)

        if (apiError.response) {
          console.error(
            "[EndJobScreen] API error response:",
            apiError.response.status,
            JSON.stringify(apiError.response.data),
          )

          // Show specific error message if available
          const errorMessage =
            apiError.response.data?.message ||
            apiError.response.data?.error ||
            "Failed to complete job via API. Please try again."

          Alert.alert("API Error", errorMessage, [{ text: "OK" }])
        } else {
          Alert.alert("API Error", "Failed to complete job. Please check your connection and try again.", [
            { text: "OK" },
          ])
        }
      }
    } catch (error) {
      console.error("[EndJobScreen] Error completing job:", error)
      Alert.alert("Error", "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Modified handleCancel function to always navigate to nameOperation
  const handleCancel = () => {
    // Instead of using goBack(), explicitly navigate to nameOperation
    console.log("[EndJobScreen] Cancel button pressed, navigating to nameOperation")
    navigation.navigate("nameOperation")
  }

  // Use job data from state or route params
  const displayJobNumber = jobData?.number || jobData?.jobNumber || jobNumber || "JOB-2023-001"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <Text style={styles.title}>End Current Job</Text>
        <Text style={styles.subtitle}>You are about to complete the current job</Text>

        <View style={styles.jobCard}>
          <Text style={styles.cardLabel}>Current Job</Text>
          <Text style={styles.jobNumber}>{displayJobNumber}</Text>
          {jobData?.assignmentId && <Text style={styles.assignmentId}>Assignment ID: {jobData.assignmentId}</Text>}
        </View>

        <Text style={styles.inputLabel}>Number of capsules made</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the number of capsules produced"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={capsulesMade}
          onChangeText={setCapsulesMade}
        />

        <Text style={styles.inputLabel}>Completion Note (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add note about your job completion..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={completionNote}
          onChangeText={setCompletionNote}
        />

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteJob} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.completeButtonText}>Continue Job Completion</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Machine is paused during break time</Text>
          <Text style={styles.footerText}>Break time will be recorded in your activity log</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    marginTop:50,
    marginHorizontal:20
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 60,
  },
  jobCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cardLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  jobNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  assignmentId: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  completeButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#148CB8",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop:200
    
  },
  buttonIcon: {
    marginRight: 8,
  },
  completeButtonText: {
    fontSize:22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
})
