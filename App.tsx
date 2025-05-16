"use client"
// this is my project 
import { useState, useEffect, useContext } from "react"
import { View, ActivityIndicator } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { enableScreens } from "react-native-screens"
import MainStack from "./stacks/MainStack"
import AuthStack from "./stacks/AuthStack"
import ContextProvider, { Context } from "./store/context"
import { hasActiveJob, getActiveJob } from "./services/job-service"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLastActiveScreen } from "./services/navigation-service"

enableScreens()



// App content component
function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [initialRoute, setInitialRoute] = useState("ChangeJob")
  const { authenticated } = useContext(Context)

  // Check for active job and break status on mount
  useEffect(() => {
    const checkAppState = async () => {
      try {
        console.log("[App] Checking app state on startup...")

        // Check if there's an active job
        const activeJobExists = await hasActiveJob()
        console.log("[App] Active job exists:", activeJobExists)

        // Get the last active screen
        const lastActiveScreen = await getLastActiveScreen()
        
        console.log("[App] Last active screen:", lastActiveScreen)

        if (activeJobExists) {
          // Get the active job data to ensure it's valid
          const activeJobData = await getActiveJob()

          if (activeJobData && activeJobData.jobId) {
            console.log("[App] Valid active job found:", activeJobData.jobId)

            // Check if user is on break
            const onBreak = await AsyncStorage.getItem("onBreak")
            console.log("[App] On break:", onBreak === "true")

            if (onBreak === "true") {
              console.log("[App] App restarted while on break, navigating to break screen")
              setInitialRoute("TakeBreak")
            } else if (lastActiveScreen === "ChangeJob") {
              // If the last active screen was ChangeJob, navigate back to it
              console.log("[App] App restarted from ChangeJob screen, navigating back to ChangeJob")
              setInitialRoute("ChangeJob")
            } else if (lastActiveScreen === "EndJob") {
              // If the last active screen was EndJob, navigate back to it
              console.log("[App] App restarted from EndJob screen, navigating back to EndJob")
              setInitialRoute("EndJob")

              // Check if we have the EndJob params
              const endJobParams = await AsyncStorage.getItem("endJobParams")
              if (!endJobParams) {
                console.log("[App] No EndJob params found, will use active job data")
              }
            } else {
              console.log("[App] App restarted with active job, navigating to job screen")
              setInitialRoute("nameOperation")
            }
          } else {
            console.log("[App] Active job data is invalid or incomplete, navigating to job selection")
            setInitialRoute("ChangeJob")
          }
        } else {
          console.log("[App] No active job found, navigating to job selection")
          setInitialRoute("ChangeJob")
        }
      } catch (error) {
        console.error("[App] Error checking app state:", error)
        // Default to ChangeJob if there's an error
        setInitialRoute("ChangeJob")
      } finally {
        setIsLoading(false)
      }
    }

    checkAppState()
  }, [authenticated])

  // Show loading indicator while checking
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#148CB8" />
      </View>
    )
  }

  // Render the appropriate stack based on authentication state
  return (
    <NavigationContainer>
      {authenticated ? <MainStack initialRouteName={initialRoute} /> : <AuthStack />}
    </NavigationContainer>
  )
}

// Main App component
export default function App() {
  return (
    <ContextProvider>
      <AppContent />
    </ContextProvider>
  )
}

