"use client"

import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Alert } from "react-native"
import SearchInput from "../component/SelectJob/SearchInput"
import Job from "../component/SelectJob/Job"
import colors from "../utils/Colors"
import { SafeAreaView } from "react-native-safe-area-context"
import axios from "axios"
import { useState, useEffect } from "react"
import { API } from "../constants/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { saveLastActiveScreen } from "../services/navigation-service"
import { MAIN_WORLD } from "puppeteer"
import { initDatabase,insertJobs,getJobs,startJobSession } from "../services/database-service"


export default function ChangeJob() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [startingJob, setStartingJob] = useState(false)
  const navigation = useNavigation()
  const [localJobs,setLocalJobs] = useState([])
  
  // ✅ Load array
  
  const removeItemFromStorage = async () => {
    try {
      await AsyncStorage.removeItem("syncData");
      console.log("remove item is called")
    } catch (e) {
      console.error(`Failed to remove the item with key "${key}".`, e);
    }
  };

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
  // Function to fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token")
      console.log(
        "Token from AsyncStorage:",
        token ? "Found (first 10 chars: " + token.substring(0, 10) + "...)" : "Not found",
      )

      if (!token) {
        console.error("Authentication token not found")
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      console.log("Token found, preparing to make API call")
      const AssignedJobAPI = `${API}/api/operator/jobs/assigned`
      console.log("API endpoint:", AssignedJobAPI)

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
      console.log("Headers:", JSON.stringify(headers))

      // Make the API call - IMPORTANT: Don't include body in GET request
      console.log("Making API call...")
      const response = await axios.get(AssignedJobAPI, { headers })

      console.log("API response status:", response.status)
      console.log("API response data type:", typeof response.data)
      console.log("API response data preview:", JSON.stringify(response.data).substring(0, 200))

      console.log(response.data)

      const db = await initDatabase(); // Initialize DB & tables
      
      const assignedJobs = response.data.assignedJobs
      const newUser = assignedJobs.map(({ number, priority, description }) => ({
        id:number,
        name:priority,
        description:description
      }));

      console.log(newUser)
      await insertJobs(db, newUser);

      // console.log('User inserted successfully');
      const testData = await getJobs(db)

      setLocalJobs(testData)

      // } catch (error) {
      // console.error('Insert user failed:', error);
      // }






      // Handle different response formats
      if (response.data) {
        let jobsData = []

        if (Array.isArray(response.data)) {
          // If response.data is directly an array of jobs
          console.log("Response is an array with", response.data.length, "jobs")
          jobsData = response.data
        } else if (response.data.assignedJobs && Array.isArray(response.data.assignedJobs)) {
          // If jobs are in an assignedJobs property
          console.log("Response has assignedJobs array with", response.data.assignedJobs.length, "jobs")
          jobsData = response.data.assignedJobs
        } else {
          // If we can't find jobs in the expected format
          console.warn("Unexpected response format:", JSON.stringify(response.data).substring(0, 100))
          setError("Received unexpected data format from server.")

          // Use sample data as fallback
          jobsData = [
            {
              id: "6b31c81c-87e5-4648-ae55-36ec822246d3",
              number: "JOB-2023-001",
              description: "Machine Maintenance",
              priority: "high",
              estimatedHours: 2,
            },
            {
              id: "3d32026d-2cec-4d2c-acc7-35172b41a284",
              number: "JOB-2023-002",
              description: "Part Production",
              priority: "medium",
              estimatedHours: 4,
            },
          ]
        }

        console.log("Setting jobs state with", jobsData.length, "jobs")
        setJobs(jobsData)
      }
    } catch (error) {
      console.error("❌ Error fetching jobs:")

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response status:", error.response.status)
        console.error("Response data:", JSON.stringify(error.response.data))

        if (error.response.status === 401) {
          setError("Authentication failed. Your session may have expired. Please log in again.")
        } else {
          setError(`Server error: ${error.response.status}. ${error.response.data?.message || ""}`)
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
        setError("No response from server. Please check your connection.")
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message)
        setError(`Error: ${error.message}`)
      }

      // Use sample data as fallback
      const sampleJobs = [
        {
          id: "6b31c81c-87e5-4648-ae55-36ec822246d3",
          number: "JOB-2023-001",
          description: "Machine Maintenance",
          priority: "high",
          estimatedHours: 2,
        },
        {
          id: "3d32026d-2cec-4d2c-acc7-35172b41a284",
          number: "JOB-2023-002",
          description: "Part Production",
          priority: "medium",
          estimatedHours: 4,
        },
      ]
      setJobs(sampleJobs)
    } finally {
      setLoading(false)
    }
  }

  // Function to start a job
  const startJob = async (job) => {
    try {
      setStartingJob(true)

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.")
        return false
      }

      // Get the job ID
      const jobId = job.id || job.jobId
      if (!jobId) {
        Alert.alert("Error", "Job ID not found. Please try again.")
        return false
      }

      // Set up headers with token
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      // Set up request body
      const body = {
        jobId: jobId,
      }

      console.log("[ChangeJob] Starting job with data:", body)

      // Make the API call to start the job
      const startJobUrl =
        "https://v0-machine-tracking-z9-6fvoblp1l-agms-projects-dc96b51f.vercel.app/api/operator/jobs/start"
      console.log(`[ChangeJob] Calling start job API: ${startJobUrl}`)

      const response = await axios.post(startJobUrl, body, { headers })

      console.log("[ChangeJob] Start job API response:", response.status, response.data)

      // asyncApi data storing

      const data = {
          action:"start_job",
          timestamp:response.data.assignment.startDate,
          payload:{
            jobid:response.data.job.id
          }
        }

        addingSyncBody(data)

        const db = await initDatabase(); // Initialize DB & tables
      
        

        await startJobSession(db, response.data.assignment.id,response.data.job.id);

        console.log('User inserted successfully');

      // Prepare job data for storage
      const jobData = {
        jobId: job.id || job.jobId,
        id: job.id || job.jobId,
        jobNumber: job.number || job.jobNumber,
        number: job.number || job.jobNumber,
        description: job.description || "Manufacturing of aerospace components",
        priority: job.priority || "medium",
        estimatedHours: job.estimatedHours || 4,
        assignmentId: job.assignmentId || job.id,
        assignmentStartDate: job.assignmentStartDate || job.startDate || new Date().toISOString(),
        status: "ACTIVE",
        savedAt: Date.now(),
      }

      // Save the job data to AsyncStorage
      const { saveActiveJob } = require("../services/job-service")
      await saveActiveJob(jobData)

      // Save the selected job ID to AsyncStorage
      await AsyncStorage.setItem("selectedJobId", jobData.jobId)
      console.log("[ChangeJob] Job data saved to AsyncStorage")

      // Return true for success
      return true
    } catch (error) {
      console.error("[ChangeJob] Error starting job:", error)

      if (error.response) {
        console.error("[ChangeJob] API error response:", error.response.status, error.response.data)

        // Show specific error message if available
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Failed to start job. Please try again."

        Alert.alert("Error", errorMessage)
      } else {
        Alert.alert("Error", "Failed to start job. Please check your connection and try again.")
      }

      return false
    } finally {
      setStartingJob(false)
    }
  }

  // Function to handle job selection
  const handleJobSelect = async (job) => {
    console.log("Selected job:", job)

    const index = localJobs.find((element)=>element.number===job.number)

    try {
      setStartingJob(true)

      // Start the job via API
      const success = await startJob(job)

      if (success) {
        // Prepare basic job data with consistent property names
        const jobData = {
          jobId: job.id || job.jobId,
          jobNumber: job.number || job.jobNumber,
          description: job.description || localJobs[index].description,
          priority: job.priority || "medium",
          estimatedHours: job.estimatedHours || 4,
          // Add assignment fields
          assignmentId: job.assignmentId || job.id,
          assignmentStartDate: job.assignmentStartDate || job.startDate || new Date().toISOString(),
        }

        // Save the selected job ID to AsyncStorage
        await AsyncStorage.setItem("selectedJobId", jobData.jobId)
        console.log("Selected job ID saved to AsyncStorage:", jobData.jobId)

        // Navigate to NameOperations with basic job data
        // The NameOperations screen will fetch the complete job data
        navigation.navigate("nameOperation", jobData)
      }
    } catch (error) {
      console.error("Error selecting job:", error)
      Alert.alert("Error", "Failed to select job. Please try again.")
    } finally {
      setStartingJob(false)
    }
  }

  // Function to handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job) => {
    const jobNumber = job.number || job.jobNumber || ""
    return jobNumber.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    // Save ChangeJob as the last active screen when this component mounts
    saveLastActiveScreen("ChangeJob")
  }, [])

  console.log("localJobs",localJobs)

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Job</Text>
        
      </View>

      <SearchInput onSearch={handleSearch} />

      {loading || startingJob ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>{startingJob ? "Starting job..." : "Loading jobs..."}</Text>
        </View>
      ) : error ? (
        <View style={styles.messageContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredJobs.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons name="folder-open-outline" size={48} color={colors.grey} />
          <Text style={styles.noJobsText}>No jobs found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filteredJobs.map((job, index) => (
          <Job
            key={job.id || job.jobId || index}
            title={job.number || job.jobNumber || localJobs[index].id}
            description={job.description || localJobs[index].description}
            level={job.priority || localJobs[index].name}
            time={job.estimatedHours || 0}
            onPress={() => handleJobSelect(job)}
          />
        ))
      )}

      <View style={styles.bottomText}>
        <Text style={styles.text}>Select a job to begin working on it</Text>
        <Text style={styles.text}>If you don't see a job, contact your supervisor</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop:50
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 0,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomText: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingVertical: 20,
    marginBottom:50
  },
  text: {
    textAlign: "center",
    fontSize: 20,
    color: colors.dimPurple,
  },
  messageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.grey,
  },
  noJobsText: {
    fontSize: 16,
    color: colors.grey,
    marginVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: colors.red,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
})
