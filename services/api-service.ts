import axios from "axios"

// You'll need to replace this with your actual API base URL
const API_BASE_URL = "https://your-api-endpoint.com"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Set auth token for API requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common["Authorization"]
  }
}

export const verifyPasscode = async (
  passcode: string,
): Promise<{ success: boolean; userId?: string; token?: string }> => {
  try {
    // Replace with your actual API endpoint and response structure
    const response = await apiClient.post("/verify-passcode", { passcode })
    return {
      success: response.data.success,
      userId: response.data.userId,
      token: response.data.token,
    }
  } catch (error) {
    console.error("Passcode verification failed:", error)
    return { success: false }
  }
}

export const startJob = async (jobId: string, userId: string) => {
  try {
    const response = await apiClient.post("/start-job", { jobId, userId })
    return response.data
  } catch (error) {
    console.error("Failed to start job:", error)
    throw error
  }
}

export const endJob = async (jobId: string, userId: string) => {
  try {
    const response = await apiClient.post("/end-job", { jobId, userId })
    return response.data
  } catch (error) {
    console.error("Failed to end job:", error)
    throw error
  }
}

export const startBreak = async (userId: string) => {
  try {
    const response = await apiClient.post("/start-break", { userId })
    return response.data
  } catch (error) {
    console.error("Failed to start break:", error)
    throw error
  }
}

export const endBreak = async (userId: string) => {
  try {
    const response = await apiClient.post("/end-break", { userId })
    return response.data
  } catch (error) {
    console.error("Failed to end break:", error)
    throw error
  }
}

export const fetchJobs = async () => {
  try {
    const response = await apiClient.get("/jobs")
    return response.data.jobs
  } catch (error) {
    console.error("Failed to fetch jobs:", error)
    return []
  }
}

// New sync methods
export const syncJobSession = async (sessionData: {
  id: string
  jobId: string
  userId: string
  startTime: number
  endTime: number
}) => {
  try {
    const response = await apiClient.post("/sync/job-session", sessionData)
    return response.data
  } catch (error) {
    console.error("Failed to sync job session:", error)
    throw error
  }
}

export const syncBreakSession = async (breakData: {
  id: string
  jobSessionId: string
  userId: string
  startTime: number
  endTime: number
}) => {
  try {
    const response = await apiClient.post("/sync/break-session", breakData)
    return response.data
  } catch (error) {
    console.error("Failed to sync break session:", error)
    throw error
  }
}
