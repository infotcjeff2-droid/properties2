import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  // Always check localStorage first to prevent logout on reload
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          // User exists in localStorage, allow access
          setIsChecking(false)
        } else if (!user && !loading) {
          // No user in localStorage and not loading, redirect to login
          setIsChecking(false)
        } else {
          setIsChecking(false)
        }
      } catch (e) {
        console.error('Error checking auth:', e)
        setIsChecking(false)
      }
    }
    
    checkAuth()
  }, [user, loading])

  if (loading || isChecking) {
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

  // Check localStorage directly to prevent logout on navigation/reload
  const savedUser = localStorage.getItem('user')
  if (!savedUser && !user) {
    return <Navigate to="/login" replace />
  }

  // Parse user if not in state but exists in localStorage
  let currentUser = user
  if (!currentUser && savedUser) {
    try {
      currentUser = JSON.parse(savedUser)
    } catch (e) {
      return <Navigate to="/login" replace />
    }
  }

  if (requiredRole && currentUser && currentUser.role !== requiredRole) {
    return <Navigate to="/order" replace />
  }

  return children
}

export default ProtectedRoute


