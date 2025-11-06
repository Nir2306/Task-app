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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()

  // Initialize offline storage
  useEffect(() => {
    initializeOfflineStorage()
  }, [])

  // Close mobile menu on window resize (when switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isMobileMenuOpen])

  // Check authentication status using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if email is verified (only for email/password accounts)
        if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
          // Email not verified - sign out and show login
          await signOut(auth)
          setIsAuthenticated(false)
          setUsername('')
          setTasks([])
          setIsLoading(false)
          return
        }
        
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

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false) // Close menu when tab changes
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <NetworkStatus />
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="hamburger-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </button>
            <div className="header-title-section">
              <h1>Timesheet Tracker</h1>
              <p className="header-subtitle">Track your daily activities and time</p>
              {username && (
                <p className="user-greeting">
                  Welcome, {username}
                </p>
              )}
            </div>
          </div>
          <div className="header-right">
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

      {/* Desktop Navigation */}
      <nav className="app-nav desktop-nav" aria-label="Main navigation">
        <button 
          className={`nav-btn ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => handleTabChange('entry')}
          aria-label="Add Entry"
          aria-current={activeTab === 'entry' ? 'page' : undefined}
        >
          Add Entry
        </button>
        <button 
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
          aria-label="All Entries"
          aria-current={activeTab === 'list' ? 'page' : undefined}
        >
          All Entries
        </button>
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
          aria-label="Dashboard"
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => handleTabChange('generator')}
          aria-label="Name Generator"
          aria-current={activeTab === 'generator' ? 'page' : undefined}
        >
          Name Generator
        </button>
        <button 
          className={`nav-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => handleTabChange('notes')}
          aria-label="Notes"
          aria-current={activeTab === 'notes' ? 'page' : undefined}
        >
          Notes
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} aria-hidden={!isMobileMenuOpen}>
        <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()} aria-label="Mobile navigation">
          <div className="mobile-nav-header">
            <h2>Menu</h2>
            <button 
              className="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="mobile-nav-items">
            <button 
              className={`mobile-nav-item ${activeTab === 'entry' ? 'active' : ''}`}
              onClick={() => handleTabChange('entry')}
              aria-label="Add Entry"
              aria-current={activeTab === 'entry' ? 'page' : undefined}
            >
              <span className="nav-label">Add Entry</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => handleTabChange('list')}
              aria-label="All Entries"
              aria-current={activeTab === 'list' ? 'page' : undefined}
            >
              <span className="nav-label">All Entries</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
              aria-label="Dashboard"
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              <span className="nav-label">Dashboard</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => handleTabChange('generator')}
              aria-label="Name Generator"
              aria-current={activeTab === 'generator' ? 'page' : undefined}
            >
              <span className="nav-label">Name Generator</span>
            </button>
            <button 
              className={`mobile-nav-item ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => handleTabChange('notes')}
              aria-label="Notes"
              aria-current={activeTab === 'notes' ? 'page' : undefined}
            >
              <span className="nav-label">Notes</span>
            </button>
          </div>
          <div className="mobile-nav-footer">
            <p className="mobile-user-info">Welcome, {username}</p>
          </div>
        </nav>
      </div>

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

