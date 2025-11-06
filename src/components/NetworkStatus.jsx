/**
 * Network Status Indicator
 * Shows online/offline status and pending sync operations
 */

import React, { useState, useEffect, useCallback } from 'react'
import { isOnline, processSyncQueue, getSyncQueue } from '../utils/offlineStorage'
import './NetworkStatus.css'

function NetworkStatus() {
  const [online, setOnline] = useState(isOnline())
  const [pendingSync, setPendingSync] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = useCallback(async () => {
    if (!isOnline() || isSyncing) return
    
    setIsSyncing(true)
    try {
      const result = await processSyncQueue()
      if (result.success) {
        setPendingSync(0)
        // Successfully synced - no need to log in production
      }
    } catch (error) {
      console.error('Error during sync:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  useEffect(() => {
    const updateStatus = () => {
      const newOnlineStatus = isOnline()
      setOnline(newOnlineStatus)
      
      // Check pending sync operations
      const queue = getSyncQueue()
      setPendingSync(queue.length)
      
      // Auto-sync when coming back online
      if (newOnlineStatus && queue.length > 0 && !isSyncing) {
        handleSync()
      }
    }

    // Initial check
    updateStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    // Check periodically
    const interval = setInterval(updateStatus, 5000)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      clearInterval(interval)
    }
  }, [isSyncing, handleSync])

  if (online && pendingSync === 0) {
    return null // Hide when online and no pending sync
  }

  return (
    <div className={`network-status ${online ? 'online' : 'offline'}`}>
      <div className="network-status-content">
        {online ? (
          <>
            <span className="network-icon">✓</span>
            <span className="network-text">Online</span>
            {pendingSync > 0 && (
              <>
                <span className="network-pending">
                  {pendingSync} pending {pendingSync === 1 ? 'change' : 'changes'}
                </span>
                <button 
                  className="network-sync-btn"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <span className="network-icon">⚠</span>
            <span className="network-text">Offline Mode</span>
            {pendingSync > 0 && (
              <span className="network-pending">
                ({pendingSync} pending)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NetworkStatus

