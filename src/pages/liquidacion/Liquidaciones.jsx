import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '@/components/buttons/ExportButton'
import Loading from '@/components/ui/Loading'

import { exportarLiquidacionesExcel } from '@/export/exportarArchivos'
import { getLiquidaciones, marcarPagada } from '@/services/liquidacionService'

export const Liquidaciones = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const { data: liquidaciones, isLoading, refetch } = useQuery({
    queryKey: ['liquidaciones'],
    queryFn: getLiquidaciones,
    keepPreviousData: true
  })

  const pagar = async (id) => {
    try {
      await marcarPagada(id)
      toast.success('Liquidación marcada como pagada')
      queryClient.invalidateQueries(['liquidaciones'])
    } catch {
      toast.error('No se pudo marcar como pagada')
    }
  }

  if (isLoading) return <Loading />

  return (
    <>
      <div className='flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-2xl shadow-md'>
        <h1 className='text-2xl font-semibold'>Liquidaciones</h1>

        <div className='flex gap-3'>
          <ExportButton
            descargaFn={exportarLiquidacionesExcel}
            nombreArchivo='Liquidaciones'
            textoBoton='Exportar Excel'
            textoExportando='Exportando...'
          />

          <button
            onClick={() => navigate('/liquidaciones/crear')}
            className='bg-indigo-600 hover:bg-indigo-800 text-white py-2 px-6 rounded-lg'
          >
            Nueva Liquidación
          </button>
        </div>
      </div>

      <div className='mt-6 p-4 bg-white rounded-xl shadow'>
        {liquidaciones?.data?.length === 0 && (
          <p className='text-center text-gray-600'>No hay liquidaciones registradas</p>
        )}

        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='border-b'>
              <th className='p-2'>Empleado</th>
              <th className='p-2'>Concepto</th>
              <th className='p-2'>Monto</th>
              <th className='p-2'>Estado</th>
              <th className='p-2'>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {liquidaciones?.data?.map((l) => (
              <tr key={l.id} className='border-b'>
                <td className='p-2'>{l.empleado?.nombre}</td>
                <td className='p-2'>{l.concepto?.descripcion}</td>
                <td className='p-2'>${l.monto}</td>
                <td className='p-2'>
                  {l.pagada
                    ? <span className='text-green-600 font-semibold'>Pagada</span>
                    : <span className='text-yellow-600 font-semibold'>Pendiente</span>}
                </td>
                <td className='p-2 flex gap-2'>
                  <button
                    onClick={() => navigate(`/liquidaciones/editar/${l.id}`)}
                    className='text-blue-600 hover:underline'
                  >
                    Editar
                  </button>

                  {!l.pagada && (
                    <button
                      onClick={() => pagar(l.id)}
                      className='text-green-600 hover:underline'
                    >
                      Marcar Pagada
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
