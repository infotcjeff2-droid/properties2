import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Login.css'
// Logo will be handled via CSS fallback if image doesn't exist

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const result = login(email, password)
    
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/order')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="logo-placeholder">
            <div className="logo-graphic">
              <div className="logo-z"></div>
              <div className="logo-x"></div>
            </div>
            <div className="logo-text">
              <div className="logo-chinese">中信方案</div>
              <div className="logo-english">ZX SOLUTION</div>
            </div>
          </div>
          <div className="logo-placeholder" style={{ display: 'none' }}>
            <div className="logo-graphic">
              <div className="logo-z"></div>
              <div className="logo-x"></div>
            </div>
            <div className="logo-text">
              <div className="logo-chinese">中信方案</div>
              <div className="logo-english">ZX SOLUTION</div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="login-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          訂單表單系統
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@jeff.zxs.hk"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            登入
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default Login

