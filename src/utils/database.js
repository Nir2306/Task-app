/**
 * Database Service
 * Uses IndexedDB for reliable persistent storage with localStorage as fallback
 * User-specific: Each user gets their own database
 */

import { auth } from './firebase'

// Get user-specific database name
const getDBName = () => {
  const userId = auth.currentUser?.uid
  if (!userId) {
    // Fallback for when user is not logged in (shouldn't happen in normal flow)
    return 'TimesheetTrackerDB_guest'
  }
  return `TimesheetTrackerDB_${userId}`
}

const DB_VERSION = 1
const TASKS_STORE = 'tasks'
const NOTES_STORE = 'notes'
const FAVORITES_STORE = 'favorites'

let db = null
let currentDBName = null

/**
 * Initialize IndexedDB (user-specific)
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const dbName = getDBName()
    
    // If database name changed (user switched), close old connection
    if (db && currentDBName !== dbName) {
      db.close()
      db = null
      currentDBName = null
    }
    
    if (db && currentDBName === dbName) {
      resolve(db)
      return
    }

    const request = indexedDB.open(dbName, DB_VERSION)
    
    request.onsuccess = () => {
      db = request.result
      currentDBName = dbName
      resolve(db)
    }

    request.onerror = () => {
      console.warn('IndexedDB not available, using localStorage fallback')
      reject(new Error('IndexedDB not available'))
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(TASKS_STORE)) {
        const taskStore = database.createObjectStore(TASKS_STORE, { keyPath: 'id' })
        taskStore.createIndex('date', 'date', { unique: false })
        taskStore.createIndex('taskName', 'taskName', { unique: false })
      }

      if (!database.objectStoreNames.contains(NOTES_STORE)) {
        const noteStore = database.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        noteStore.createIndex('category', 'category', { unique: false })
        noteStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!database.objectStoreNames.contains(FAVORITES_STORE)) {
        database.createObjectStore(FAVORITES_STORE, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Check if IndexedDB is available
 */
const isIndexedDBAvailable = () => {
  return typeof indexedDB !== 'undefined' && indexedDB !== null
}

/**
 * Fallback to localStorage (user-specific)
 */
const getLocalStorageKey = (baseKey) => {
  const userId = auth.currentUser?.uid
  if (!userId) {
    return `${baseKey}_guest`
  }
  return `${baseKey}_${userId}`
}

const getFromLocalStorage = (key) => {
  try {
    const userKey = getLocalStorageKey(key)
    const item = localStorage.getItem(userKey)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

const setToLocalStorage = (key, value) => {
  try {
    const userKey = getLocalStorageKey(key)
    localStorage.setItem(userKey, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error writing to localStorage:', error)
    return false
  }
}

/**
 * Tasks Database Operations
 */
export const dbTasks = {
  /**
   * Get all tasks
   */
  async getAll() {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([TASKS_STORE], 'readonly')
          const store = transaction.objectStore(TASKS_STORE)
          const request = store.getAll()

          request.onsuccess = () => {
            resolve(request.result || [])
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    const tasks = getFromLocalStorage('timesheetTasks')
    return tasks || []
  },

  /**
   * Save all tasks
   */
  async saveAll(tasks) {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([TASKS_STORE], 'readwrite')
          const store = transaction.objectStore(TASKS_STORE)

          // Clear existing tasks
          store.clear()

          // Add all tasks
          tasks.forEach(task => {
            store.add(task)
          })

          transaction.oncomplete = () => {
            resolve(true)
          }

          transaction.onerror = () => {
            reject(transaction.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    return setToLocalStorage('timesheetTasks', tasks)
  },

  /**
   * Add a task
   */
  async add(task) {
    const tasks = await this.getAll()
    const newTasks = [...tasks, task]
    return await this.saveAll(newTasks)
  },

  /**
   * Update a task
   */
  async update(taskId, updatedTask) {
    const tasks = await this.getAll()
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...updatedTask, id: taskId } : task
    )
    return await this.saveAll(newTasks)
  },

  /**
   * Delete a task
   */
  async delete(taskId) {
    const tasks = await this.getAll()
    const newTasks = tasks.filter(task => task.id !== taskId)
    return await this.saveAll(newTasks)
  }
}

/**
 * Notes Database Operations
 */
export const dbNotes = {
  /**
   * Get all notes
   */
  async getAll() {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([NOTES_STORE], 'readonly')
          const store = transaction.objectStore(NOTES_STORE)
          const request = store.getAll()

          request.onsuccess = () => {
            resolve(request.result || [])
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    const notes = getFromLocalStorage('standaloneNotes')
    return notes || []
  },

  /**
   * Save all notes
   */
  async saveAll(notes) {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([NOTES_STORE], 'readwrite')
          const store = transaction.objectStore(NOTES_STORE)

          // Clear existing notes
          store.clear()

          // Add all notes
          notes.forEach(note => {
            store.add(note)
          })

          transaction.oncomplete = () => {
            resolve(true)
          }

          transaction.onerror = () => {
            reject(transaction.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    return setToLocalStorage('standaloneNotes', notes)
  }
}

/**
 * Favorites Database Operations
 */
export const dbFavorites = {
  /**
   * Get all favorites
   */
  async getAll() {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([FAVORITES_STORE], 'readonly')
          const store = transaction.objectStore(FAVORITES_STORE)
          const request = store.getAll()

          request.onsuccess = () => {
            resolve(request.result || [])
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    const favorites = getFromLocalStorage('nameGeneratorFavorites')
    return favorites || []
  },

  /**
   * Save all favorites
   */
  async saveAll(favorites) {
    try {
      if (isIndexedDBAvailable()) {
        await initDB()
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([FAVORITES_STORE], 'readwrite')
          const store = transaction.objectStore(FAVORITES_STORE)

          // Clear existing favorites
          store.clear()

          // Add all favorites
          favorites.forEach(favorite => {
            store.add(favorite)
          })

          transaction.oncomplete = () => {
            resolve(true)
          }

          transaction.onerror = () => {
            reject(transaction.error)
          }
        })
      }
    } catch (error) {
      console.warn('IndexedDB failed, using localStorage:', error)
    }

    // Fallback to localStorage
    return setToLocalStorage('nameGeneratorFavorites', favorites)
  }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async () => {
  try {
    // Migrate tasks
    const tasks = getFromLocalStorage('timesheetTasks')
    if (tasks && tasks.length > 0) {
      await dbTasks.saveAll(tasks)
    }

    // Migrate notes
    const notes = getFromLocalStorage('standaloneNotes')
    if (notes && notes.length > 0) {
      await dbNotes.saveAll(notes)
    }

    // Migrate favorites
    const favorites = getFromLocalStorage('nameGeneratorFavorites')
    if (favorites && favorites.length > 0) {
      await dbFavorites.saveAll(favorites)
    }

    // Data migration completed
  } catch (error) {
    console.error('Error migrating data:', error)
  }
}

