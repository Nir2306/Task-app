import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Function to detect system preference
  const getSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has manually set a preference
    const saved = localStorage.getItem('darkMode')
    const hasManualPreference = localStorage.getItem('darkModeManual') === 'true'
    
    if (hasManualPreference && saved !== null) {
      // Use saved preference if user manually set it
      return JSON.parse(saved)
    } else {
      // Otherwise, use system preference
      return getSystemPreference()
    }
  })

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Listen for system preference changes (only if user hasn't manually set preference)
  useEffect(() => {
    const hasManualPreference = localStorage.getItem('darkModeManual') === 'true'
    
    if (!hasManualPreference && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e) => {
        setDarkMode(e.matches)
      }
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    // Mark as manual preference and save
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    localStorage.setItem('darkModeManual', 'true')
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

