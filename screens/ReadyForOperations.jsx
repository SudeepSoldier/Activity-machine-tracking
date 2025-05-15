"use client"

import { useState,useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useContext } from "react"
import { Context } from "../store/context"
import Ionicons from "react-native-vector-icons/Ionicons"
import { clearActiveJob } from "../services/job-service"
import axios from "axios"
import { ENDPOINTS } from "../constants/api"
import { initDatabase,insertUser } from "../services/database-service"
import NetInfo from '@react-native-community/netinfo';

export default function ReadyForOperations() {
  const { isLogin } = useContext(Context)
  const [isLoading, setIsLoading] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [showPasscode, setShowPasscode] = useState(false)
  const [error, setError] = useState("")
  const [deviceId, setDeviceId] = useState("")

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  console.log("network",isConnected)


  //const deviceId = "DEV001";

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

  const handleChange = (text) => {
    // Allow only letters and numbers
    const alphanumeric = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setDeviceId(alphanumeric);
  };

  const handleLogin = async () => {
    if (!passcode) {
      setError("Please enter your passcode")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Clear any existing active job to ensure we go to ChangeJob screen
      await clearActiveJob()

      // Make API call to login endpoint
      console.log(`Making login API call to: ${ENDPOINTS.LOGIN}`)

      const headers = {
            'Content-Type':'application/json',
            'Cookie':'_vercel_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ5eFE2aVBVbTdzajBCYTBKT29JdjFnZ1oiLCJpYXQiOjE3NDY2MzE2MzMsIm93bmVySWQiOiJ0ZWFtX1RUQW04eTFBV0JPNFBsRXhLSkxtVHRuaiIsImF1ZCI6InYwLW1hY2hpbmUtdHJhY2tpbmctejktNXMzaGU4OHl3LWFnbXMtcHJvamVjdHMtZGM5NmI1MWYudmVyY2VsLmFwcCIsInVzZXJuYW1lIjoibXVydHV6YWthcGFkaWExMjEtZ21haWxjb20iLCJzdWIiOiJzc28tcHJvdGVjdGlvbiJ9.O9EKQP_OrJ9UppqIylx2Wmuf1m1btQVOmONje_D0sIw'
          };
          
          

          const body = {
    "deviceId": deviceId,
    "passcode": passcode
}

      const response = await axios.post(ENDPOINTS.LOGIN, body,{headers
      })

      console.log("Login API response:", response.status)

      if (response.data && response.data.token) {
        // Store token in AsyncStorage
        const token = response.data.token
        await AsyncStorage.setItem("token", token)
        
          
        const db = await initDatabase(); // Initialize DB & tables

        const newUser = {
            id:deviceId,
            passcode:passcode,
            username:response.data.user.username,
            fullName:response.data.user.fullName,
            email:response.data.user.email,
            role:response.data.user.role,
            token:response.data.token
        };

        await insertUser(db, newUser);

        console.log('User inserted successfully');

        // Store user data if available
        if (response.data.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(response.data.user))
        } else {
          // Create minimal user data if not provided by API
          const userData = {
            name: "Operator",
            role: "OPERATOR",
          }
          await AsyncStorage.setItem("userData", JSON.stringify(userData))
        }

        console.log("Login successful - Token stored in AsyncStorage")

        // Update authentication state
        // This will trigger navigation to ChangeJob screen
        isLogin()
      } else {
        setError("Invalid response from server. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)

      if (error.response) {
        // Handle specific error codes
        if (error.response.status === 401) {
          setError("Invalid passcode. Please try again.")
        } else {
          setError(`Server error (${error.response.status}). Please try again.`)
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.")
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPasscode = () => {
    setShowPasscode(!showPasscode)
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>CNC Mill 1</Text>
          <Text style={styles.headerSubtitle}>Ready for operation</Text>
        </View>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Operator Login</Text>
        <Text style={styles.cardSubtitle}>Enter your passcode to begin</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Device ID</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter Device ID"
              value={deviceId}
              onChangeText={handleChange}
              // secureTextEntry={!showPasscode}
               keyboardType="default"
               autoCapitalize="none"
            />
            {/* <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPasscode}>
              <Ionicons name={showPasscode ? "eye-off-outline" : "eye-outline"} size={24} color="#64748B" />
            </TouchableOpacity> */}
          </View> 
        </View>


        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Operator Passcode</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your passcode"
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry={!showPasscode}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPasscode}>
              <Ionicons name={showPasscode ? "eye-off-outline" : "eye-outline"} size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Login & Start Job</Text>}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>If you need assistance, please contact your supervisor</Text>
        <Text style={styles.footerText}>Tablet ID: {deviceId} </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#148CB8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 40,
    width:650,
    marginHorizontal:60,
    marginTop:50
  },
  cardTitle: {
    fontSize: 50,
    fontWeight: "700",
    color: "#148CB8",
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 20,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: "#E11D48",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#148CB8",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 46,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 4,
  },
})
