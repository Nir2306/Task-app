/**
 * Firestore Database Service
 * Replaces IndexedDB with Firestore for cloud-based persistent storage
 */

import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

// Helper function to get current user ID
const getUserId = () => {
  return auth.currentUser?.uid || null
}

// Helper function to get user collection reference
const getUserCollection = (collectionName) => {
  const userId = getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return collection(db, 'users', userId, collectionName)
}

// Helper function to get user document reference
const getUserDoc = (collectionName, docId) => {
  const userId = getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return doc(db, 'users', userId, collectionName, docId)
}

/**
 * Tasks Collection
 */
export const firestoreTasks = {
  async getAll() {
    try {
      const userId = getUserId()
      if (!userId) return []

      const tasksRef = collection(db, 'users', userId, 'tasks')
      const q = query(tasksRef, orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const tasks = []
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() })
      })
      
      return tasks
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  },

  async saveAll(tasks) {
    try {
      const userId = getUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Delete all existing tasks
      const tasksRef = collection(db, 'users', userId, 'tasks')
      const existingTasks = await getDocs(tasksRef)
      const deletePromises = existingTasks.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add all new tasks
      if (tasks.length > 0) {
        const addPromises = tasks.map(task => {
          const { id, ...taskData } = task
          const docRef = doc(db, 'users', userId, 'tasks', id.toString())
          return setDoc(docRef, taskData)
        })
        await Promise.all(addPromises)
      }
    } catch (error) {
      console.error('Error saving tasks:', error)
      throw error
    }
  }
}

/**
 * Notes Collection
 */
export const firestoreNotes = {
  async getAll() {
    try {
      const userId = getUserId()
      if (!userId) return []

      const notesRef = collection(db, 'users', userId, 'notes')
      const q = query(notesRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const notes = []
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() })
      })
      
      return notes
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  },

  async saveAll(notes) {
    try {
      const userId = getUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Delete all existing notes
      const notesRef = collection(db, 'users', userId, 'notes')
      const existingNotes = await getDocs(notesRef)
      const deletePromises = existingNotes.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add all new notes
      if (notes.length > 0) {
        const addPromises = notes.map(note => {
          const { id, ...noteData } = note
          const docRef = doc(db, 'users', userId, 'notes', id.toString())
          return setDoc(docRef, noteData)
        })
        await Promise.all(addPromises)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      throw error
    }
  }
}

/**
 * Favorites Collection
 */
export const firestoreFavorites = {
  async getAll() {
    try {
      const userId = getUserId()
      if (!userId) return []

      const favoritesRef = collection(db, 'users', userId, 'favorites')
      const querySnapshot = await getDocs(favoritesRef)
      
      const favorites = []
      querySnapshot.forEach((doc) => {
        favorites.push({ id: doc.id, ...doc.data() })
      })
      
      return favorites
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  },

  async saveAll(favorites) {
    try {
      const userId = getUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Delete all existing favorites
      const favoritesRef = collection(db, 'users', userId, 'favorites')
      const existingFavorites = await getDocs(favoritesRef)
      const deletePromises = existingFavorites.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Add all new favorites
      if (favorites.length > 0) {
        const addPromises = favorites.map(favorite => {
          const { id, ...favoriteData } = favorite
          const docRef = doc(db, 'users', userId, 'favorites', id.toString())
          return setDoc(docRef, favoriteData)
        })
        await Promise.all(addPromises)
      }
    } catch (error) {
      console.error('Error saving favorites:', error)
      throw error
    }
  }
}

/**
 * Migrate data from IndexedDB/localStorage to Firestore
 */
export const migrateToFirestore = async () => {
  try {
    const userId = getUserId()
    if (!userId) return

    // Check if migration already done
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists() && userDoc.data().migrated) {
      return // Already migrated
    }

    // Import old database functions to read from IndexedDB
    const { dbTasks, dbNotes, dbFavorites } = await import('./database')
    
    // Migrate tasks
    try {
      const tasks = await dbTasks.getAll()
      if (tasks && tasks.length > 0) {
        await firestoreTasks.saveAll(tasks)
      }
    } catch (error) {
      console.error('Error migrating tasks:', error)
    }

    // Migrate notes
    try {
      const notes = await dbNotes.getAll()
      if (notes && notes.length > 0) {
        await firestoreNotes.saveAll(notes)
      }
    } catch (error) {
      console.error('Error migrating notes:', error)
    }

    // Migrate favorites
    try {
      const favorites = await dbFavorites.getAll()
      if (favorites && favorites.length > 0) {
        await firestoreFavorites.saveAll(favorites)
      }
    } catch (error) {
      console.error('Error migrating favorites:', error)
    }

    // Mark migration as complete
    await setDoc(userDocRef, { migrated: true, migratedAt: new Date().toISOString() }, { merge: true })
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

