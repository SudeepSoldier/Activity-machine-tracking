
// Update this with your actual API base URL - remove the /api suffix if it's included in the endpoints
// Update this with your actual API base URL - remove the /api suffix if it's included in the endpoints
// API endpoints// Update this with your actual API base URL - remove the /api suffix if it's included in the endpoints
// Update this with your actual API base URL
// Update this with your actual API base URL
export const API = "https://v0-machine-tracking-z9-6fvoblp1l-agms-projects-dc96b51f.vercel.app" // Base URL

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API}/api/operator/login`,
  LOGOUT: `${API}/api/operator/logout`,

  // Job endpoints
  START_JOB: `${API}/api/operator/jobs/start`,
  COMPLETE_JOB: `${API}/api/operator/jobs/complete`,
  CHANGE_JOB: `${API}/api/operator/jobs/change`,
  ACTIVE_JOB: `${API}/api/operator/jobs/active`,
  ASSIGNED_JOBS: `${API}/api/operator/jobs/assigned`,

  // Break endpoints
  BREAKS: `${API}/api/operator/breaks`,
}

// Fallback API functions for development/testing
export const mockStartJob = (jobId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Job started successfully (mock)",
        jobId: jobId,
        startTime: new Date().toISOString(),
      })
    }, 500)
  })
}

// Mock data for jobs when API fails
export const MOCK_JOBS = [
  {
    id: "6b31c81c-87e5-4648-ae55-36ec822246d3",
    number: "JOB-2023-001",
    description: "Machine Maintenance",
    priority: "HIGH",
    estimatedHours: 2,
  },
  {
    id: "3d32026d-2cec-4d2c-acc7-35172b41a284",
    number: "JOB-2023-002",
    description: "Part Production",
    priority: "MEDIUM",
    estimatedHours: 4,
  },
]

