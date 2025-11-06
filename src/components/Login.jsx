import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from '../utils/firebase'
import './Login.css'

function Login({ onLogin }) {
  const { darkMode } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [emailVerifying, setEmailVerifying] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Add class to body to hide scrollbar and remove padding
  useEffect(() => {
    document.body.classList.add('login-page-active')
    document.body.style.overflow = 'hidden'
    document.body.style.padding = '0'
    document.body.style.margin = '0'
    document.body.style.background = '#0a1929'
    
    const root = document.getElementById('root')
    if (root) {
      root.style.padding = '0'
      root.style.margin = '0'
      root.style.maxWidth = '100%'
    }

    return () => {
      document.body.classList.remove('login-page-active')
      document.body.style.overflow = ''
      document.body.style.padding = ''
      document.body.style.margin = ''
      document.body.style.background = ''
      
      if (root) {
        root.style.padding = ''
        root.style.margin = ''
        root.style.maxWidth = ''
      }
    }
  }, [])

  // Email format validation function
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation function
  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    if (password.length > 128) {
      return 'Password must be less than 128 characters'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setEmailVerified(false)
    
    // Validate email format
    if (!validateEmailFormat(email.trim())) {
      setError('Please enter a valid email address')
      return
    }
    
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    // Validate password
    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    setIsLoading(true)
    setEmailVerifying(true)

    try {
      // Try to sign in first (in case user already exists)
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )
        
        // Successful sign in
        setEmailVerifying(false)
        setIsLoading(false)
        const displayName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || email.trim()
        onLogin(displayName)
      } catch (signInError) {
        // Handle sign in errors
        if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password') {
          // Wrong password - try to create account (user might be signing up)
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email.trim(),
              password
            )
            
            // Send email verification for new account
            try {
              await sendEmailVerification(userCredential.user)
              setEmailVerified(true)
            } catch (verifyError) {
              console.error('Error sending verification email:', verifyError)
              // Continue even if verification email fails
            }
            
            setEmailVerifying(false)
            
            // Show success message and wait before logging in
            setTimeout(() => {
              setIsLoading(false)
              const displayName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || email.trim()
              onLogin(displayName)
            }, 2000)
          } catch (createError) {
            // If creation fails, user likely exists with wrong password
            setEmailVerifying(false)
            setIsLoading(false)
            
            if (createError.code === 'auth/email-already-in-use') {
              setError('Invalid email or password. Please check your credentials.')
            } else if (createError.code === 'auth/weak-password') {
              setPasswordError('Password is too weak. Please use a stronger password (at least 6 characters).')
            } else if (createError.code === 'auth/invalid-email') {
              setError('Invalid email address. Please check your email.')
            } else {
              setError('Invalid email or password. Please try again.')
            }
          }
        } else if (signInError.code === 'auth/user-not-found') {
          // User doesn't exist - try to create account
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email.trim(),
              password
            )
            
            // Send email verification for new account
            try {
              await sendEmailVerification(userCredential.user)
              setEmailVerified(true)
            } catch (verifyError) {
              console.error('Error sending verification email:', verifyError)
              // Continue even if verification email fails
            }
            
            setEmailVerifying(false)
            
            setTimeout(() => {
              setIsLoading(false)
              const displayName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || email.trim()
              onLogin(displayName)
            }, 2000)
          } catch (createError) {
            setEmailVerifying(false)
            setIsLoading(false)
            
            if (createError.code === 'auth/email-already-in-use') {
              setError('This email is already registered. Please sign in instead.')
            } else if (createError.code === 'auth/weak-password') {
              setPasswordError('Password is too weak. Please use a stronger password (at least 6 characters).')
            } else {
              setError(createError.message || 'Failed to create account. Please try again.')
            }
          }
        } else {
          // Other sign in errors
          setEmailVerifying(false)
          setIsLoading(false)
          
          if (signInError.code === 'auth/invalid-email') {
            setError('Invalid email address. Please check your email.')
          } else {
            setError('Failed to sign in. Please check your credentials and try again.')
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
      setEmailVerifying(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateEmailFormat(resetEmail.trim())) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSuccess(true)
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetEmail('')
        setResetSuccess(false)
      }, 3000)
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email.')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')

      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Successful sign in
      const user = result.user
      const displayName = user.displayName || user.email?.split('@')[0] || 'User'
      
      setIsLoading(false)
      onLogin(displayName)
    } catch (error) {
      console.error('Google Sign-In error:', error)
      setIsLoading(false)
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.')
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.')
      } else {
        setError('Failed to sign in with Google. Please try again.')
      }
    }
  }

  return (
    <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="login-wrapper">
        {/* Left Side - Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-header">
              <h1>Timesheet Tracker</h1>
              <p>Welcome back! Please sign in to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {emailVerified && (
                <div className="email-verified-message">
                  <span className="verified-icon">✓</span>
                  Confirmation email sent to {email}! Please check your inbox and verify your email address.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setEmailVerified(false)
                  }}
                  placeholder="Enter your email"
                  className="form-input"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError('')
                      setError('')
                    }}
                    placeholder="Enter your password"
                    className="form-input"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="password-error">
                    <span className="error-icon">⚠️</span>
                    {passwordError}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-container">
                    <svg className="loading-spinner" viewBox="0 0 24 24">
                      <circle
                        className="loading-spinner-circle"
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="60"
                        strokeDashoffset="60"
                      />
                    </svg>
                    <span className="loading-text">
                      {emailVerifying ? 'Verifying email...' : 'Signing in...'}
                    </span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="forgot-password-link">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="forgot-password-btn"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>or</span>
            </div>

            {/* Google Sign-In Button */}
            <div className="google-signin-container">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="google-signin-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-container">
                    <svg className="loading-spinner" viewBox="0 0 24 24">
                      <circle
                        className="loading-spinner-circle"
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="60"
                        strokeDashoffset="60"
                      />
                    </svg>
                    <span className="loading-text">Signing in...</span>
                  </span>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>

            <div className="login-footer">
              <p className="login-hint">
                First time? Just enter your email and password to create your account.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Fluid Background */}
        <div className="login-animation-section">
          <div className="animation-container">
            <div className="fluid-background">
              <div className="fluid-blob blob-1"></div>
              <div className="fluid-blob blob-2"></div>
              <div className="fluid-blob blob-3"></div>
              <div className="fluid-blob blob-4"></div>
            </div>
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
              <div className="shape shape-6"></div>
              <div className="shape shape-7"></div>
              <div className="shape shape-8"></div>
              <div className="shape shape-9"></div>
              <div className="shape shape-10"></div>
              <div className="shape shape-11"></div>
              <div className="shape shape-12"></div>
            </div>
            <div className="geometric-elements">
              <div className="geo-circle geo-1"></div>
              <div className="geo-circle geo-2"></div>
              <div className="geo-circle geo-3"></div>
              <div className="geo-line geo-line-1"></div>
              <div className="geo-line geo-line-2"></div>
              <div className="geo-line geo-line-3"></div>
            </div>
            <div className="grid-overlay"></div>
            <div className="welcome-text">
              <h2 className="welcome-title">Track Your Time,<br />Achieve Your Goals</h2>
              <p className="welcome-subtitle">Efficient time management starts here. Log your activities, analyze your productivity, and make every minute count.</p>
            </div>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="forgot-password-content">
            <button
              className="close-modal-btn"
              onClick={() => {
                setShowForgotPassword(false)
                setResetEmail('')
                setError('')
                setResetSuccess(false)
              }}
            >
              ×
            </button>
            <h3>Reset Password</h3>
            {resetSuccess ? (
              <div className="reset-success">
                <p>✓ Password reset instructions have been sent to your email.</p>
                <p className="reset-hint">(In a real app, you would receive an email with reset link)</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="reset-form">
                <div className="form-group">
                  <label htmlFor="reset-email">Enter your email address</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="your.email@example.com"
                    className="form-input"
                    autoComplete="email"
                    required
                  />
                </div>
                {error && (
                  <div className="login-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}
                <button type="submit" className="reset-btn">
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

