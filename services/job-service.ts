import AsyncStorage from "@react-native-async-storage/async-storage"

// Keys for storing job data
const ACTIVE_JOB_KEY = "activeJob"
const JOB_START_TIME_KEY = "jobStartTime"
const ACTIVE_JOB_COMPLETE_KEY = "activeJobComplete" // New key for storing complete job data

// Save active job
export const saveActiveJob = async (jobData) => {
  try {
    console.log("[job-service] Saving active job:", typeof jobData === "object" ? "Object data" : jobData)

    // Check if we're receiving the complete job data structure from the active job API
    if (jobData.activeJob) {
      console.log("[job-service] Received complete job data structure")

      // Store the complete job data
      await AsyncStorage.setItem(ACTIVE_JOB_COMPLETE_KEY, JSON.stringify(jobData))

      // Extract and sanitize the active job data
      const activeJob = jobData.activeJob

      // Ensure jobData has all required fields with consistent property names
      const sanitizedJobData = {
        // Job identification
        jobId: activeJob.id || `job-${Date.now()}`,
        id: activeJob.id, // Keep original id for API calls
        assignmentId: activeJob.assignmentId || null,

        // Job details
        jobNumber: activeJob.number || "JOB-2023-001",
        number: activeJob.number, // Keep original number for API calls
        description: activeJob.description || "Manufacturing of aerospace components",
        priority: activeJob.priority || "medium",
        estimatedHours: activeJob.estimatedHours || 4,

        // Assignment details
        assignmentStartDate: activeJob.assignmentStartDate || activeJob.startDate || new Date().toISOString(),
        status: activeJob.status || "ACTIVE",

        // Machine details (if available)
        machineId: jobData.machine?.id || null,
        machineName: jobData.machine?.name || null,
        machineCode: jobData.machine?.code || null,

        // Tablet details (if available)
        tabletId: jobData.tablet?.id || null,
        tabletName: jobData.tablet?.name || null,

        // Activity details (if available)
        activityId: jobData.jobActivity?.id || null,
        activityType: jobData.jobActivity?.type || null,
        activityTimestamp: jobData.jobActivity?.timestamp || null,

        // Add timestamp for when the job was saved
        savedAt: Date.now(),
      }

      console.log("[job-service] Sanitized job data:", sanitizedJobData)
      await AsyncStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(sanitizedJobData))
    } else {
      // Handle the case where we're receiving a simple job object
      console.log("[job-service] Received simple job data")

      // Ensure jobData has all required fields with consistent property names
      const sanitizedJobData = {
        // Job identification
        jobId: jobData.jobId || jobData.id || `job-${Date.now()}`,
        id: jobData.id || jobData.jobId, // Keep original id for API calls
        assignmentId: jobData.assignmentId || jobData.id || null,

        // Job details
        jobNumber: jobData.jobNumber || jobData.number || "JOB-2023-001",
        number: jobData.number || jobData.jobNumber, // Keep original number for API calls
        description: jobData.description || "Manufacturing of aerospace components",
        priority: jobData.priority || "medium",
        estimatedHours: jobData.estimatedHours || 4,

        // Assignment details
        assignmentStartDate: jobData.assignmentStartDate || jobData.startDate || new Date().toISOString(),
        status: jobData.status || "ACTIVE",

        // Add timestamp for when the job was saved
        savedAt: Date.now(),
      }

      console.log("[job-service] Sanitized job data:", sanitizedJobData)
      await AsyncStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(sanitizedJobData))
    }

    // Store the job start time if not already set
    const existingStartTime = await AsyncStorage.getItem(JOB_START_TIME_KEY)
    if (!existingStartTime) {
      await AsyncStorage.setItem(JOB_START_TIME_KEY, Date.now().toString())
    }

    console.log("[job-service] Active job saved successfully")
    return true
  } catch (error) {
    console.error("[job-service] Error saving active job:", error)
    return false
  }
}

// Get active job
export const getActiveJob = async () => {
  try {
    const jobData = await AsyncStorage.getItem(ACTIVE_JOB_KEY)
    console.log("[job-service] Retrieved active job:", jobData ? "Job exists" : "No job found")

    if (!jobData) return null

    try {
      // Parse the job data
      const parsedJobData = JSON.parse(jobData)
      return parsedJobData
    } catch (parseError) {
      console.error("[job-service] Error parsing job data:", parseError)
      return null
    }
  } catch (error) {
    console.error("[job-service] Error getting active job:", error)
    return null
  }
}

// Get complete active job data (including machine, tablet, etc.)
export const getCompleteActiveJob = async () => {
  try {
    const completeJobData = await AsyncStorage.getItem(ACTIVE_JOB_COMPLETE_KEY)
    console.log("[job-service] Retrieved complete job data:", completeJobData ? "Data exists" : "No data found")

    if (!completeJobData) return null

    try {
      // Parse the complete job data
      return JSON.parse(completeJobData)
    } catch (parseError) {
      console.error("[job-service] Error parsing complete job data:", parseError)
      return null
    }
  } catch (error) {
    console.error("[job-service] Error getting complete job data:", error)
    return null
  }
}

// Check if there's an active job
export const hasActiveJob = async () => {
  try {
    const jobData = await AsyncStorage.getItem(ACTIVE_JOB_KEY)
    const hasJob = !!jobData
    console.log("[job-service] Checking for active job:", hasJob ? "Job exists" : "No job found")
    return hasJob
  } catch (error) {
    console.error("[job-service] Error checking active job:", error)
    return false
  }
}

// Clear active job
export const clearActiveJob = async () => {
  try {
    console.log("[job-service] Clearing active job")

    // Clear job data
    await AsyncStorage.removeItem(ACTIVE_JOB_KEY)
    await AsyncStorage.removeItem(ACTIVE_JOB_COMPLETE_KEY)
    await AsyncStorage.removeItem(JOB_START_TIME_KEY)
    await AsyncStorage.removeItem("selectedJobId")

    // Clear timer data
    await AsyncStorage.removeItem("timer_start_job")
    await AsyncStorage.removeItem("timer_paused_job")
    await AsyncStorage.removeItem("timer_running_job")

    // Clear break data
    await AsyncStorage.removeItem("timer_start_break")
    await AsyncStorage.removeItem("timer_paused_break")
    await AsyncStorage.removeItem("timer_running_break")
    await AsyncStorage.removeItem("onBreak")
    await AsyncStorage.removeItem("breakEnded")
    await AsyncStorage.removeItem("totalBreakTime")

    console.log("[job-service] Active job and related data cleared from AsyncStorage")
    return true
  } catch (error) {
    console.error("[job-service] Error clearing active job:", error)
    return false
  }
}

// Get job start time
export const getJobStartTime = async () => {
  try {
    const startTime = await AsyncStorage.getItem(JOB_START_TIME_KEY)
    console.log(
      "[job-service] Retrieved job start time:",
      startTime ? new Date(Number.parseInt(startTime, 10)).toISOString() : "No start time found",
    )
    return startTime ? Number.parseInt(startTime, 10) : null
  } catch (error) {
    console.error("[job-service] Error getting job start time:", error)
    return null
  }
}

// Get total job duration in milliseconds
export const getJobDuration = async () => {
  try {
    const startTime = await getJobStartTime()
    if (!startTime) return 0

    // Get break time if available
    const breakTimeStr = await AsyncStorage.getItem("totalBreakTime")
    const breakTime = breakTimeStr ? Number.parseInt(breakTimeStr, 10) : 0

    // Calculate total duration excluding breaks
    const totalDuration = Date.now() - startTime - breakTime
    return totalDuration > 0 ? totalDuration : 0
  } catch (error) {
    console.error("[job-service] Error calculating job duration:", error)
    return 0
  }
}

// Get machine information
export const getMachineInfo = async () => {
  try {
    // Try to get from complete job data first
    const completeJobData = await getCompleteActiveJob()
    if (completeJobData && completeJobData.machine) {
      return completeJobData.machine
    }

    // Fall back to machine info in active job
    const activeJob = await getActiveJob()
    if (activeJob && (activeJob.machineId || activeJob.machineName)) {
      return {
        id: activeJob.machineId,
        name: activeJob.machineName,
        code: activeJob.machineCode,
      }
    }

    return null
  } catch (error) {
    console.error("[job-service] Error getting machine info:", error)
    return null
  }
}

// Get tablet information
export const getTabletInfo = async () => {
  try {
    // Try to get from complete job data first
    const completeJobData = await getCompleteActiveJob()
    if (completeJobData && completeJobData.tablet) {
      return completeJobData.tablet
    }

    // Fall back to tablet info in active job
    const activeJob = await getActiveJob()
    if (activeJob && (activeJob.tabletId || activeJob.tabletName)) {
      return {
        id: activeJob.tabletId,
        name: activeJob.tabletName,
      }
    }

    return null
  } catch (error) {
    console.error("[job-service] Error getting tablet info:", error)
    return null
  }
}
