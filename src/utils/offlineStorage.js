/**
 * Offline Storage Service
 * Provides hybrid storage: IndexedDB (offline) + Firestore (online sync)
 * Automatically syncs data when online and queues operations when offline
 */

import { dbTasks, dbNotes, dbFavorites, initDB } from './database'
import { firestoreTasks, firestoreNotes, firestoreFavorites } from './firestore'
import { auth } from './firebase'

const SYNC_QUEUE_KEY = 'syncQueue'
const LAST_SYNC_KEY = 'lastSync'

/**
 * Network Detection
 */
export const isOnline = () => {
  return navigator.onLine
}

/**
 * Sync Queue Management
 */
export const getSyncQueue = () => {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY)
    return queue ? JSON.parse(queue) : []
  } catch (error) {
    console.error('Error reading sync queue:', error)
    return []
  }
}

const addToSyncQueue = (operation) => {
  try {
    const queue = getSyncQueue()
    queue.push({
      ...operation,
      timestamp: Date.now(),
      id: `${operation.type}_${Date.now()}_${Math.random()}`
    })
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
    return queue.length
  } catch (error) {
    console.error('Error adding to sync queue:', error)
    return 0
  }
}

const clearSyncQueue = () => {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY)
  } catch (error) {
    console.error('Error clearing sync queue:', error)
  }
}

/**
 * Process pending sync operations
 */
export const processSyncQueue = async () => {
  if (!isOnline() || !auth.currentUser) {
    return { success: false, message: 'Not online or not authenticated' }
  }

  const queue = getSyncQueue()
  if (queue.length === 0) {
    return { success: true, processed: 0 }
  }

  const results = {
    success: true,
    processed: 0,
    failed: 0,
    errors: []
  }

  for (const operation of queue) {
    try {
      switch (operation.type) {
        case 'saveTasks':
          await firestoreTasks.saveAll(operation.data)
          results.processed++
          break
        case 'saveNotes':
          await firestoreNotes.saveAll(operation.data)
          results.processed++
          break
        case 'saveFavorites':
          await firestoreFavorites.saveAll(operation.data)
          results.processed++
          break
        default:
          console.warn('Unknown sync operation type:', operation.type)
      }
    } catch (error) {
      console.error(`Error processing sync operation ${operation.type}:`, error)
      results.failed++
      results.errors.push({ operation, error: error.message })
    }
  }

  // Clear queue only if all operations succeeded
  if (results.failed === 0) {
    clearSyncQueue()
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString())
  } else {
    // Keep failed operations in queue for retry
    const failedOps = queue.filter((op, idx) => {
      return results.errors.some(err => err.operation.id === op.id)
    })
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedOps))
  }

  return results
}

/**
 * Hybrid Tasks Storage
 */
export const hybridTasks = {
  async getAll() {
    try {
      // Always try IndexedDB first (works offline)
      await initDB()
      const localTasks = await dbTasks.getAll()
      
      // If online and authenticated, try to sync with Firestore
      if (isOnline() && auth.currentUser) {
        try {
          const cloudTasks = await firestoreTasks.getAll()
          
          // Merge: prefer local if newer, otherwise use cloud
          if (cloudTasks.length > 0) {
            const lastSync = localStorage.getItem(LAST_SYNC_KEY)
            const localLastModified = localTasks.length > 0 
              ? Math.max(...localTasks.map(t => t.lastModified || t.id))
              : 0
            
            if (!lastSync || cloudTasks.length > localTasks.length) {
              // Cloud has more recent data, update local
              await dbTasks.saveAll(cloudTasks)
              return cloudTasks
            }
          }
        } catch (error) {
          console.warn('Error syncing from Firestore, using local data:', error)
        }
      }
      
      return localTasks || []
    } catch (error) {
      console.error('Error loading tasks:', error)
      return []
    }
  },

  async saveAll(tasks) {
    try {
      // Always save to IndexedDB first (works offline)
      await initDB()
      await dbTasks.saveAll(tasks)
      
      // If online, also save to Firestore
      if (isOnline() && auth.currentUser) {
        try {
          await firestoreTasks.saveAll(tasks)
          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString())
        } catch (error) {
          console.warn('Error saving to Firestore, queueing for sync:', error)
          // Queue for later sync
          addToSyncQueue({ type: 'saveTasks', data: tasks })
        }
      } else {
        // Queue for sync when back online
        addToSyncQueue({ type: 'saveTasks', data: tasks })
      }
    } catch (error) {
      console.error('Error saving tasks:', error)
      throw error
    }
  }
}

/**
 * Hybrid Notes Storage
 */
export const hybridNotes = {
  async getAll() {
    try {
      await initDB()
      const localNotes = await dbNotes.getAll()
      
      if (isOnline() && auth.currentUser) {
        try {
          const cloudNotes = await firestoreNotes.getAll()
          
          if (cloudNotes.length > 0) {
            const lastSync = localStorage.getItem(LAST_SYNC_KEY)
            if (!lastSync || cloudNotes.length > localNotes.length) {
              await dbNotes.saveAll(cloudNotes)
              return cloudNotes
            }
          }
        } catch (error) {
          console.warn('Error syncing notes from Firestore, using local data:', error)
        }
      }
      
      return localNotes || []
    } catch (error) {
      console.error('Error loading notes:', error)
      return []
    }
  },

  async saveAll(notes) {
    try {
      await initDB()
      await dbNotes.saveAll(notes)
      
      if (isOnline() && auth.currentUser) {
        try {
          await firestoreNotes.saveAll(notes)
          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString())
        } catch (error) {
          console.warn('Error saving notes to Firestore, queueing for sync:', error)
          addToSyncQueue({ type: 'saveNotes', data: notes })
        }
      } else {
        addToSyncQueue({ type: 'saveNotes', data: notes })
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      throw error
    }
  }
}

/**
 * Hybrid Favorites Storage
 */
export const hybridFavorites = {
  async getAll() {
    try {
      await initDB()
      const localFavorites = await dbFavorites.getAll()
      
      if (isOnline() && auth.currentUser) {
        try {
          const cloudFavorites = await firestoreFavorites.getAll()
          
          if (cloudFavorites.length > 0) {
            const lastSync = localStorage.getItem(LAST_SYNC_KEY)
            if (!lastSync || cloudFavorites.length > localFavorites.length) {
              await dbFavorites.saveAll(cloudFavorites)
              return cloudFavorites
            }
          }
        } catch (error) {
          console.warn('Error syncing favorites from Firestore, using local data:', error)
        }
      }
      
      return localFavorites || []
    } catch (error) {
      console.error('Error loading favorites:', error)
      return []
    }
  },

  async saveAll(favorites) {
    try {
      await initDB()
      await dbFavorites.saveAll(favorites)
      
      if (isOnline() && auth.currentUser) {
        try {
          await firestoreFavorites.saveAll(favorites)
          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString())
        } catch (error) {
          console.warn('Error saving favorites to Firestore, queueing for sync:', error)
          addToSyncQueue({ type: 'saveFavorites', data: favorites })
        }
      } else {
        addToSyncQueue({ type: 'saveFavorites', data: favorites })
      }
    } catch (error) {
      console.error('Error saving favorites:', error)
      throw error
    }
  }
}

/**
 * Initialize offline storage and sync
 */
export const initializeOfflineStorage = async () => {
  try {
    await initDB()
    
    // Process any pending sync operations when coming online
    if (isOnline() && auth.currentUser) {
      const queue = getSyncQueue()
      if (queue.length > 0) {
        // Processing pending sync operations
        await processSyncQueue()
      }
    }
  } catch (error) {
    console.error('Error initializing offline storage:', error)
  }
}

