"use client"

import { useState, useEffect, useContext } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { clearActiveJob } from "../services/job-service"
import { Context } from "../store/context"
import axios from "axios"
import Ionicons from "react-native-vector-icons/Ionicons"

export default function Logout({ route }) {
  const { jobId } = route.params || {}
  const [capsulesMade, setCapsulesMade] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("Operator")
  const navigation = useNavigation()
  const { logout } = useContext(Context)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData")
        if (userData) {
          const parsedUserData = JSON.parse(userData)
          setUserName(parsedUserData.name || parsedUserData.fullName || "Operator")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()
    clearActiveJob()
  }, [])

  const handleLogout = async () => {
    if (jobId && !capsulesMade) {
      alert("Please enter the number of capsules produced.")
      return
    }

    try {
      setIsLoading(true)

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token")

      if (token) {
        // Set up headers with token
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }

        // Set up request body
        const body = {
          totalcapsule: Number.parseInt(capsulesMade, 10) || 0,
        }

        try {
          // Make the API call
          console.log("Logging out via API")
          await axios.post(
            "https://v0-machine-tracking-z9-6fvoblp1l-agms-projects-dc96b51f.vercel.app/api/operator/logout",
            body,
            { headers },
          )
          console.log("Logout API call successful")
        } catch (apiError) {
          console.error("Error calling logout API:", apiError.response?.data || apiError.message)
          // Continue with local logout even if API call fails
        }
      }

      // Clear token and user data from AsyncStorage
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("userData")

      // Call context logout function
      await logout()

      // Navigate to login screen
      // Replace this:
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Login" }],
      // })

      // With this:
      // Instead of trying to navigate directly to Login, we'll just rely on the context
      // to switch from MainStack to AuthStack
      console.log("Logout successful, context updated")
    } catch (error) {
      console.error("Logout failed:", error)
      alert("Failed to logout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <Text style={styles.title}>Confirm Logout</Text>
        <Text style={styles.subtitle}>Are you sure you want to logout?</Text>

        <View style={styles.userCard}>
          <View style={styles.userIconContainer}>
            <Ionicons name="person-outline" size={24} color="#BE3927" />
          </View>
          <Text style={styles.currentlyLoggedIn}>Currently logged in</Text>
          <Text style={styles.operatorName}>{userName}</Text>
        </View>

        {jobId && (
          <>
            <Text style={styles.inputLabel}>Number of capsules made</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the number of capsules produced"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={capsulesMade}
              onChangeText={setCapsulesMade}
            />
            <Text style={styles.inputHelp}>Required before logging with an active job</Text>
          </>
        )}

        {/* <View style={styles.spacer} /> */}

        <Text style={styles.warningText}>Logging out will end your current session and any active jobs</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.logoutButtonText}>Continue Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    marginHorizontal:40,
  },
  title: {
    fontSize: 44,
    fontWeight: "700",
    color: "#020817",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  userCard: {
    width: "100%",
    height:200,
    backgroundColor: "#F4F4F4",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  userIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFDBD6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  currentlyLoggedIn: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  operatorName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#020817",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#020817",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#020817",
    marginBottom: 8,
  },
  inputHelp: {
    fontSize: 14,
    color: "#64748B",
    alignSelf: "flex-start",
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  warningText: {
    fontSize: 16,
    color: "#E88F84",
    textAlign: "center",
    marginBottom: 24,
    marginTop:250
  },
  logoutButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#BE3927",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#020817",
  },
})
