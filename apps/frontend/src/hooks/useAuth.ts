import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

export const useAuth = () => {
  const { user, login, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data.user, response.data.token)
      navigate('/')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const handleRegister = async (data: any) => {
    try {
      const response = await api.post('/auth/register', data)
      login(response.data.user, response.data.token)
      navigate('/')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  }
}
