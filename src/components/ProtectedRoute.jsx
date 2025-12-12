import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

// Get user from localStorage synchronously
function getLocalUser() {
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      return JSON.parse(savedUser)
    }
  } catch (e) {
    console.error('Error loading user from localStorage:', e)
  }
  return null
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  // Initialize with localStorage user immediately
  const [localUser] = useState(() => getLocalUser())

  // Use localUser from localStorage if user from context is not available (e.g., on reload)
  const currentUser = user || localUser

  // Show loading only if we're loading and don't have a user yet
  if (loading && !currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        載入中...
      </div>
    )
  }

  // If we have a user (from context or localStorage), proceed even if still loading
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

export default ProtectedRoute


