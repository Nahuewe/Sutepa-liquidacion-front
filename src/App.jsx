import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Auditoria } from './pages/auth/Auditoria'
import { Conceptos } from './pages/conceptos/Conceptos'
import { CreateConceptos } from './pages/conceptos/CreateConceptos'
import { CreateEmpleados } from './pages/empleados/CreateEmpleados'
import { Empleados } from './pages/empleados/Empleados'
import Loading from '@/components/ui/Loading'
import { useAuthStore } from '@/helpers/useAuthStore'
import Layout from '@/layout/Layout'
import Error from '@/pages/404'
import Login from '@/pages/auth/Login'
import { CreateLiquidacion } from '@/pages/liquidacion/CreateLiquidacion'
import { Liquidaciones } from '@/pages/liquidacion/Liquidaciones'
import { LiquidacionView } from '@/pages/liquidacion/LiquidacionView'
import { CreateUser } from '@/pages/users/CreateUser'
import { Users } from '@/pages/users/Users'

function App () {
  const { status, checkAuthToken } = useAuthStore()

  useEffect(() => {
    checkAuthToken()
  }, [])

  if (status === 'checking') {
    return (
      <Loading />
    )
  }

  return (
    <main className='App relative'>
      <Routes>
        {
          (status === 'not-authenticated')
            ? (
              <>
                {/* Login */}
                <Route path='/login' element={<Login />} />
                <Route path='/*' element={<Navigate to='/login' />} />
              </>
              )
            : (
              <>
                <Route path='/' element={<Navigate to='/liquidaciones' />} />

                <Route path='/*' element={<Layout />}>
                  <Route path='*' element={<Navigate to='/404' />} />

                  {/* Auditoria */}
                  <Route path='auditoria' element={<Auditoria />} />

                  {/* Liquidacion */}
                  <Route path='liquidaciones' element={<Liquidaciones />} />
                  <Route path='liquidaciones/crear' element={<CreateLiquidacion />} />
                  <Route path='liquidaciones/editar/:id' element={<CreateLiquidacion />} />
                  <Route path='liquidaciones/:id' element={<LiquidacionView />} />

                  {/* Conceptos */}
                  <Route path='conceptos' element={<Conceptos />} />
                  <Route path='conceptos/crear' element={<CreateConceptos />} />
                  <Route path='conceptos/editar/:id' element={<CreateConceptos />} />

                  {/* Empleados */}
                  <Route path='empleados' element={<Empleados />} />
                  <Route path='empleados/crear' element={<CreateEmpleados />} />
                  <Route path='empleados/editar/:id' element={<CreateEmpleados />} />

                  {/* Usuarios */}
                  <Route path='usuarios' element={<Users />} />
                  <Route path='usuarios/crear' element={<CreateUser />} />
                  <Route path='usuarios/editar/:id' element={<CreateUser />} />
                </Route>

                <Route path='*' element={<Navigate to='/404' />} />
                <Route path='/404' element={<Error />} />
              </>
              )
        }
      </Routes>
    </main>
  )
}

export default App
