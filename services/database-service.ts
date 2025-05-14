import SQLite from "react-native-sqlite-storage"

// Enable SQLite debugging in development
SQLite.DEBUG(true)
SQLite.enablePromise(true)

const DATABASE_NAME = "MachineTrackingDB.db"
const DATABASE_VERSION = "1.0"
const DATABASE_DISPLAY_NAME = "Machine Tracking Database"
const DATABASE_SIZE = 200000

export const getDBConnection = async () => {
  return SQLite.openDatabase({
    name: DATABASE_NAME,
    location: "default",
    createFromLocation: "~www/MachineTrackingDB.db",
  })
}

// User Table Operations
export const createUserTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY NOT NULL,
      passcode TEXT,
      username TEXT,
      fullName TEXT,
      email TEXT,
      role TEXT,
      token TEXT
    );
  `
  await db.executeSql(query)
}

export const insertUser = async (db: SQLite.SQLiteDatabase, userData: any) => {
  // First clear any existing user (support only one logged-in user)
  await deleteUser(db)

  const insertQuery = `
    INSERT INTO user (id, passcode, username, fullName, email, role, token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  await db.executeSql(insertQuery, [
    userData.id || `user_${userData.passcode}`,
    userData.passcode,
    userData.username || "",
    userData.fullName || "",
    userData.email || "",
    userData.role || "",
    userData.token || "",
  ])
}

export const deleteUser = async (db: SQLite.SQLiteDatabase) => {
  await db.executeSql("DELETE FROM user")
}

export const getUser = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql("SELECT * FROM user")
  const users = results[0].rows.raw()
  return users.length > 0 ? users[0] : null
}

// Job Tracking Tables
export const createJobsTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );
  `
  await db.executeSql(query)
}

export const insertJobs = async (db: SQLite.SQLiteDatabase, jobs: any[]) => {
  // Begin transaction
  await db.executeSql("BEGIN TRANSACTION")

  try {
    // Insert each job
    for (const job of jobs) {
      const insertQuery = `
        INSERT OR REPLACE INTO jobs (id, name, description)
        VALUES (?, ?, ?)
      `
      await db.executeSql(insertQuery, [job.id, job.name, job.description || ""])
    }

    // Commit transaction
    await db.executeSql("COMMIT")
  } catch (error) {
    // Rollback on error
    await db.executeSql("ROLLBACK")
    throw error
  }
}

export const getJobs = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql("SELECT * FROM jobs")
  return results[0].rows.raw()
}

// Job Sessions Table - for tracking work sessions
export const createJobSessionsTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS job_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      job_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      is_synced INTEGER DEFAULT 0,
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );
  `
  await db.executeSql(query)
}

export const startJobSession = async (db: SQLite.SQLiteDatabase, jobId: string, userId: string) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const startTime = Date.now()

  const query = `
    INSERT INTO job_sessions (id, job_id, user_id, start_time, is_synced)
    VALUES (?, ?, ?, ?, 0)
  `

  await db.executeSql(query, [sessionId, jobId, userId, startTime])
  return sessionId
}

export const endJobSession = async (db: SQLite.SQLiteDatabase, sessionId: string) => {
  const endTime = Date.now()

  const query = `
    UPDATE job_sessions
    SET end_time = ?, is_synced = 0
    WHERE id = ?
  `

  await db.executeSql(query, [endTime, sessionId])
}

export const getCurrentJobSession = async (db: SQLite.SQLiteDatabase, userId: string) => {
  const query = `
    SELECT * FROM job_sessions
    WHERE user_id = ? AND end_time IS NULL
    ORDER BY start_time DESC
    LIMIT 1
  `

  const results = await db.executeSql(query, [userId])
  const sessions = results[0].rows.raw()
  return sessions.length > 0 ? sessions[0] : null
}

export const getUnsyncedSessions = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    SELECT * FROM job_sessions
    WHERE is_synced = 0
  `

  const results = await db.executeSql(query, [])
  return results[0].rows.raw()
}

export const markSessionAsSynced = async (db: SQLite.SQLiteDatabase, sessionId: string) => {
  const query = `
    UPDATE job_sessions
    SET is_synced = 1
    WHERE id = ?
  `

  await db.executeSql(query, [sessionId])
}

// Break Sessions Table - for tracking breaks
export const createBreakSessionsTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS break_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      job_session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      is_synced INTEGER DEFAULT 0,
      FOREIGN KEY (job_session_id) REFERENCES job_sessions(id)
    );
  `
  await db.executeSql(query)
}

export const startBreakSession = async (db: SQLite.SQLiteDatabase, jobSessionId: string, userId: string) => {
  const breakId = `break_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const startTime = Date.now()

  const query = `
    INSERT INTO break_sessions (id, job_session_id, user_id, start_time, is_synced)
    VALUES (?, ?, ?, ?, 0)
  `

  await db.executeSql(query, [breakId, jobSessionId, userId, startTime])
  return breakId
}

export const endBreakSession = async (db: SQLite.SQLiteDatabase, breakId: string) => {
  const endTime = Date.now()

  const query = `
    UPDATE break_sessions
    SET end_time = ?, is_synced = 0
    WHERE id = ?
  `

  await db.executeSql(query, [endTime, breakId])
}

export const getCurrentBreakSession = async (db: SQLite.SQLiteDatabase, userId: string) => {
  const query = `
    SELECT * FROM break_sessions
    WHERE user_id = ? AND end_time IS NULL
    ORDER BY start_time DESC
    LIMIT 1
  `

  const results = await db.executeSql(query, [userId])
  const breaks = results[0].rows.raw()
  return breaks.length > 0 ? breaks[0] : null
}

export const getUnsyncedBreaks = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    SELECT * FROM break_sessions
    WHERE is_synced = 0
  `

  const results = await db.executeSql(query, [])
  return results[0].rows.raw()
}

export const markBreakAsSynced = async (db: SQLite.SQLiteDatabase, breakId: string) => {
  const query = `
    UPDATE break_sessions
    SET is_synced = 1
    WHERE id = ?
  `

  await db.executeSql(query, [breakId])
}

// Initialize database
export const initDatabase = async () => {
  try {
    const db = await getDBConnection()
    await createUserTable(db)
    await createJobsTable(db)
    await createJobSessionsTable(db)
    await createBreakSessionsTable(db)
    return db
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}
