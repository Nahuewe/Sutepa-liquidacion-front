import { useDispatch, useSelector } from 'react-redux'
import { sutepaApi } from '@/api'
import { handleLogin, handleLogout, setErrorMessage } from '@/store/auth'

export const useAuthStore = () => {
  const { status, user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const startLogin = async ({ username, password }) => {
    try {
      const { data: { token, user } } = await sutepaApi.post('/login', {
        username,
        password
      })

      if (user) {
        localStorage.setItem('token', token)
        dispatch(handleLogin({ ...user }))
        return { ok: true }
      } else {
        dispatch(handleLogout())
        return { ok: false, message: 'Usuario inválido' }
      }
    } catch (error) {
      let message = 'Error al iniciar sesión'
      let remaining

      if (error.response?.data?.error) {
        message = error.response.data.error
      }
      if (error.response?.data?.remaining !== undefined) {
        remaining = error.response.data.remaining
      }

      dispatch(setErrorMessage(message))
      dispatch(handleLogout())
      return { ok: false, message, remaining }
    }
  }

  const checkAuthToken = async () => {
    const token = localStorage.getItem('token')
    if (!token) return dispatch(handleLogout())

    try {
      const { data: { token, user } } = await sutepaApi.post('/refresh-token')
      localStorage.setItem('token', token)
      dispatch(handleLogin({ ...user }))
    } catch (error) {
      localStorage.clear()
      dispatch(handleLogout())
    }
  }

  const startLogout = () => {
    localStorage.clear()
    dispatch(handleLogout())
  }

  return {
    status,
    user,
    startLogin,
    checkAuthToken,
    startLogout
  }
}
