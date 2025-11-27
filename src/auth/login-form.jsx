import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Textinput from '@/components/ui/Textinput'
import Tooltip from '@/components/ui/Tooltip'
import { useAuthStore } from '@/helpers'

function LoginForm () {
  const navigate = useNavigate()
  const { startLogin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [warning, setWarning] = useState(null)
  const [loginError, setLoginError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [blockTime, setBlockTime] = useState(null)

  const validateForm = (values) => {
    const errors = {}
    if (!values.username) {
      errors.username = 'El usuario es requerido'
    }
    if (!values.password) {
      errors.password = 'La contraseña es requerida'
    }
    return errors
  }

  const { formState: { errors }, handleSubmit, setValue, register } = useForm({
    defaultValues: {
      username: '',
      password: ''
    },
    resolver: async (data) => {
      const errors = validateForm(data)
      return {
        values: Object.keys(errors).length === 0 ? data : {},
        errors: Object.keys(errors).reduce((acc, key) => {
          acc[key] = { type: 'custom', message: errors[key] }
          return acc
        }, {})
      }
    }
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const onSubmit = async (data) => {
    setLoginError(null)
    setWarning(null)
    setIsLoading(true)

    try {
      const resp = await startLogin(data)

      if (!resp.ok) {
        setLoginError(resp.message)

        if (resp.remaining_minutes > 0) {
          setBlockTime(resp.remaining_minutes)
        }

        if (resp.remaining !== undefined && resp.remaining > 0) {
          setWarning(`Te quedan ${resp.remaining} intentos antes de ser bloqueado.`)
        }

        if (resp.remaining_minutes !== undefined && resp.remaining_minutes > 0) {
          setBlockTime(`Intenta de nuevo en ${resp.remaining_minutes} minuto(s).`)
        }

        setIsLoading(false)
        return
      }

      navigate('/')
    } catch (error) {
      setLoginError('Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='relative space-y-2'
    >
      <div>
        <label className='form-label text-white'>
          Usuario
        </label>
        <Textinput
          name='username'
          type='text'
          register={register}
          error={errors.username}
          className='h-[48px]'
          placeholder='Usuario'
          onChange={(e) => setValue('username', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor='default-picker' className='form-label text-white'>
          Contraseña
        </label>
        <Textinput
          name='password'
          type={showPassword ? 'text' : 'password'}
          register={register}
          error={errors.password}
          className='h-[48px]'
          placeholder='Contraseña'
          onChange={(e) => {
            setValue('password', e.target.value)
          }}
        />
      </div>

      <button
        type='button'
        className='absolute top-2/4 right-4 transform translate-y-2/4 mt-1'
        onClick={togglePasswordVisibility}
      >
        {showPassword
          ? (
            <Tooltip content='Ocultar Contraseña'>
              <svg xmlns='http://www.w3.org/2000/svg' className='icon icon-tabler icon-tabler-eye dark:stroke-white' width='24' height='24' viewBox='0 0 24 24' strokeWidth='1' stroke='#000000' fill='none' strokeLinecap='round' strokeLinejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                <path d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6' />
              </svg>
            </Tooltip>
            )
          : (
            <Tooltip content='Mostrar Contraseña'>
              <svg xmlns='http://www.w3.org/2000/svg' className='icon icon-tabler icon-tabler-eye-closed dark:stroke-white' width='24' height='24' viewBox='0 0 24 24' strokeWidth='1' stroke='#000000' fill='none' strokeLinecap='round' strokeLinejoin='round'>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path d='M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4' />
                <path d='M3 15l2.5 -3.8' />
                <path d='M21 14.976l-2.492 -3.776' />
                <path d='M9 17l.5 -4' />
                <path d='M15 17l-.5 -4' />
              </svg>
            </Tooltip>
            )}
      </button>

      <button
        type='submit'
        disabled={isLoading}
        className='btn bg-indigo-600 hover:bg-indigo-800 disabled:bg-indigo-400 disabled:cursor-not-allowed block w-full text-center mt-2 text-white'
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      {loginError && (
        <div className='text-red-300 text-sm mt-2 p-2 rounded bg-red-900/40 border border-red-700'>
          {loginError}
        </div>
      )}

      {warning && (
        <div className='text-yellow-300 text-sm mt-2 p-2 rounded bg-yellow-900/40 border border-yellow-700'>
          {warning}
        </div>
      )}

      {blockTime && (
        <div className='text-orange-300 text-sm mt-2 p-2 rounded bg-orange-900/40 border border-orange-700'>
          {blockTime}
        </div>
      )}
    </form>
  )
}

export default LoginForm
