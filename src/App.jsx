import React, { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './utils/firebase'
import TimesheetForm from './components/TimesheetForm'
import Dashboard from './components/Dashboard'
import TaskList from './components/TaskList'
import NameGenerator from './components/NameGenerator'
import StandaloneNotes from './components/StandaloneNotes'
import Login from './components/Login'
import NetworkStatus from './components/NetworkStatus'
import { hybridTasks, initializeOfflineStorage } from './utils/offlineStorage'
import { migrateToFirestore } from './utils/firestore'
import './App.css'

function AppContent() {
  const [tasks, setTasks] = useState([])
  const [activeTab, setActiveTab] = useState('entry')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()

  // Initialize offline storage
  useEffect(() => {
    initializeOfflineStorage()
  }, [])

  // Check authentication status using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true)
        setUsername(user.displayName || user.email?.split('@')[0] || 'User')
        
        // Migrate data from IndexedDB to Firestore on first login (only when online)
        try {
          await migrateToFirestore()
        } catch (error) {
          console.error('Error during migration:', error)
        }
        
        // Load tasks from hybrid storage (works offline)
        try {
          const savedTasks = await hybridTasks.getAll()
          setTasks(savedTasks || [])
        } catch (error) {
          console.error('Error loading tasks:', error)
          setTasks([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsAuthenticated(false)
        setUsername('')
        setTasks([])
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const saveTasks = async (newTasks) => {
    try {
      setTasks(newTasks)
      // Use hybrid storage (saves to IndexedDB always, syncs to Firestore when online)
      await hybridTasks.saveAll(newTasks)
    } catch (error) {
      console.error('Error saving tasks:', error)
      // Still update state even if save fails
      setTasks(newTasks)
    }
  }

  const handleAddTask = async (task) => {
    const taskWithId = { ...task, id: Date.now() }
    const newTasks = [...tasks, taskWithId]
    await saveTasks(newTasks)
  }

  const handleDeleteTask = async (taskId) => {
    const newTasks = tasks.filter(task => task.id !== taskId)
    await saveTasks(newTasks)
  }

  const handleEditTask = async (taskId, updatedTask) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...updatedTask, id: taskId } : task
    )
    await saveTasks(newTasks)
  }

  const handleLogin = (loggedInUsername) => {
    // Authentication is handled by Firebase Auth state listener
    // This function is kept for backwards compatibility
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth)
      setShowLogoutModal(false)
      // State will be updated by the auth state listener
    } catch (error) {
      console.error('Error signing out:', error)
      setShowLogoutModal(false)
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: darkMode ? '#e0e0e0' : '#333'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <NetworkStatus />
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Timesheet Tracker</h1>
            <p>Track your daily activities and time</p>
            {username && (
              <p className="user-greeting" style={{ fontSize: '0.85rem', marginTop: '5px', opacity: 0.8 }}>
                Welcome, {username}
              </p>
            )}
          </div>
          <div>
            <button 
              onClick={handleLogoutClick} 
              className="logout-btn"
              title="Log out"
            >
              Logout
            </button>
            <button onClick={toggleDarkMode} className="dark-mode-toggle" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          Add Entry
        </button>
        <button 
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          All Entries
        </button>
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          Name Generator
        </button>
        <button 
          className={`nav-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </nav>

      <main className={`app-main ${activeTab === 'entry' ? 'no-scroll' : ''}`}>
        {activeTab === 'entry' && (
          <TimesheetForm onAddTask={handleAddTask} />
        )}
        {activeTab === 'list' && (
          <TaskList 
            tasks={tasks} 
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard tasks={tasks} />
        )}
        {activeTab === 'generator' && (
          <NameGenerator />
        )}
        {activeTab === 'notes' && (
          <StandaloneNotes tasks={tasks} />
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleLogoutCancel}>
          <div className={`logout-modal ${darkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button 
                className="logout-modal-btn cancel-btn"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="logout-modal-btn confirm-btn"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App

