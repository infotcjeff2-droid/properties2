import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Load users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Default admin user
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@jeff.zxs.hk',
        password: 'admin321',
        role: 'admin',
        name: '系統管理員'
      }
    ]
    
    const allUsers = [...defaultUsers, ...users]
    const foundUser = allUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    }
    
    return { success: false, error: '帳號或密碼錯誤' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const addUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: 'member'
    }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    return newUser
  }

  const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const filtered = users.filter(u => u.id !== userId)
    localStorage.setItem('users', JSON.stringify(filtered))
  }

  const getUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    return users.map(u => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })
  }

  const value = {
    user,
    login,
    logout,
    addUser,
    deleteUser,
    getUsers,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

