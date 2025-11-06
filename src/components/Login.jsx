import React, { useState } from 'react'
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
                    {emailVerifying ? (
                      <>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span style={{ marginLeft: '8px', fontSize: '0.85rem' }}>Verifying email...</span>
                      </>
                    ) : (
                      <>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                      </>
                    )}
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
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="login-footer">
              <p className="login-hint">
                First time? Just enter your email and password to create your account.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Animation/Illustration */}
        <div className="login-animation-section">
          <div className="animation-container">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
            </div>
            <div className="animated-icon">
              {showPassword ? (
                <svg viewBox="0 0 200 200" className="timesheet-active-icon">
                  {/* Active Timesheet - Tasks Visible */}
                  <rect x="40" y="30" width="120" height="140" rx="8" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" className="timesheet-card"/>
                  {/* Task items appearing */}
                  <rect x="50" y="50" width="100" height="12" rx="2" fill="rgba(59, 130, 246, 0.8)" className="task-item task-1"/>
                  <circle cx="155" cy="56" r="5" fill="#22c55e" className="check-icon check-1"/>
                  <rect x="50" y="70" width="90" height="12" rx="2" fill="rgba(59, 130, 246, 0.8)" className="task-item task-2"/>
                  <circle cx="145" cy="76" r="5" fill="#22c55e" className="check-icon check-2"/>
                  <rect x="50" y="90" width="80" height="12" rx="2" fill="rgba(59, 130, 246, 0.8)" className="task-item task-3"/>
                  <circle cx="135" cy="96" r="5" fill="#22c55e" className="check-icon check-3"/>
                  {/* Progress bar */}
                  <rect x="50" y="120" width="100" height="8" rx="4" fill="rgba(59, 130, 246, 0.2)" className="progress-bg"/>
                  <rect x="50" y="120" width="75" height="8" rx="4" fill="#22c55e" className="progress-bar"/>
                  {/* Clock icon */}
                  <circle cx="100" cy="150" r="15" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2"/>
                  <line x1="100" y1="150" x2="100" y2="142" stroke="rgba(59, 130, 246, 1)" strokeWidth="2" strokeLinecap="round" className="clock-hand-1"/>
                  <line x1="100" y1="150" x2="108" y2="150" stroke="rgba(59, 130, 246, 1)" strokeWidth="2" strokeLinecap="round" className="clock-hand-2"/>
                  {/* Success particles */}
                  <circle cx="60" cy="40" r="3" fill="#22c55e" className="success-particle particle-1"/>
                  <circle cx="140" cy="35" r="2" fill="#22c55e" className="success-particle particle-2"/>
                  <circle cx="170" cy="60" r="3" fill="#22c55e" className="success-particle particle-3"/>
                </svg>
              ) : (
                <svg viewBox="0 0 200 200" className="timesheet-secure-icon">
                  {/* Secure/Locked Timesheet */}
                  <rect x="40" y="30" width="120" height="140" rx="8" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" className="timesheet-card"/>
                  {/* Lock icon overlay */}
                  <circle cx="100" cy="100" r="35" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="5,5" className="secure-circle"/>
                  <path d="M 100 75 Q 100 70 95 70 Q 90 70 90 75 L 90 95" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeLinecap="round" fill="none" className="lock-shackle"/>
                  <rect x="85" y="95" width="30" height="25" rx="3" fill="none" stroke="rgba(59, 130, 246, 1)" strokeWidth="4" className="lock-body"/>
                  <circle cx="100" cy="107" r="4" fill="#3b82f6" className="lock-keyhole"/>
                  {/* Blurred task lines */}
                  <rect x="50" y="50" width="100" height="8" rx="2" fill="rgba(59, 130, 246, 0.15)" className="blurred-task"/>
                  <rect x="50" y="65" width="90" height="8" rx="2" fill="rgba(59, 130, 246, 0.15)" className="blurred-task"/>
                  <rect x="50" y="80" width="80" height="8" rx="2" fill="rgba(59, 130, 246, 0.15)" className="blurred-task"/>
                  {/* Security shield */}
                  <path d="M 100 45 L 110 50 L 110 60 Q 110 70 100 75 Q 90 70 90 60 L 90 50 Z" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" className="shield-icon"/>
                </svg>
              )}
            </div>
            <div className="animation-text">
              <h2>{showPassword ? 'Ready to Track' : 'Secure Timesheet'}</h2>
              <p>{showPassword ? 'Your tasks are ready - start tracking your time' : 'Your data is protected - sign in to access your timesheet'}</p>
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

