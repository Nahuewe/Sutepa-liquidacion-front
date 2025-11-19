import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ExportButton from '@/components/buttons/ExportButton'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Pagination from '@/components/ui/Pagination'
import { exportarLiquidaciones, getLiquidaciones, marcarPagada } from '@/services/liquidacionService'

export const LiquidacionesList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1
  const [currentPage, setCurrentPage] = useState(initialPage)

  const { data, isLoading } = useQuery({
    queryKey: ['liquidaciones', currentPage],
    queryFn: () => getLiquidaciones(currentPage),
    keepPreviousData: true
  })

  const handleMarcarPagada = async (id) => {
    try {
      await marcarPagada(id)
      toast.success('Liquidación marcada como pagada')
      queryClient.invalidateQueries({ queryKey: ['liquidaciones'] })
    } catch (err) {
      console.error(err)
      toast.error('No se pudo marcar como pagada')
    }
  }

  const onPageChange = (page) => {
    setCurrentPage(page)
    navigate(`?page=${page}`)
  }

  function addLiquidacion () {
    navigate('/liquidaciones/crear')
    queryClient.invalidateQueries({ queryKey: ['votaciones'] })
  }

  if (isLoading) return <Loading />

  return (
    <>
      <div className='flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-slate-800 shadow mb-4'>
        <h1 className='text-2xl font-semibold'>Liquidaciones</h1>

        <div className='flex gap-3'>
          <ExportButton
            descargaFn={exportarLiquidaciones}
            nombreArchivo='Liquidaciones'
            textoBoton='Exportar Excel'
            textoExportando='Exportando...'
          />

          <button
            onClick={addLiquidacion}
            className='bg-indigo-600 hover:bg-indigo-800 text-white items-center text-center py-2 px-6 rounded-lg'
          >
            Crear Liquidacion
          </button>
        </div>
      </div>

      <Card>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b'>
                <th className='p-2'>#</th>
                <th className='p-2'>Empleado</th>
                <th className='p-2'>Periodo</th>
                <th className='p-2'>Haberes</th>
                <th className='p-2'>Descuentos</th>
                <th className='p-2'>Neto</th>
                <th className='p-2'>Estado</th>
                <th className='p-2'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data?.data?.map((l) => (
                <tr key={l.id} className='border-b hover:bg-gray-50'>
                  <td className='p-2'>{l.id}</td>
                  <td className='p-2'>{l.empleado?.nombre} {l.empleado?.apellido}</td>
                  <td className='p-2'>{l.periodo}</td>
                  <td className='p-2'>${Number(l.total_haberes).toFixed(2)}</td>
                  <td className='p-2'>${Number(l.total_descuentos).toFixed(2)}</td>
                  <td className='p-2 font-semibold'>${Number(l.neto).toFixed(2)}</td>
                  <td className='p-2'>
                    {l.estado === 'PAGADA'
                      ? <span className='text-green-600 font-semibold'>Pagada</span>
                      : <span className='text-yellow-600 font-semibold'>{l.estado}</span>}
                  </td>

                  <td className='p-2 flex gap-3'>
                    <button className='text-blue-600 hover:underline' onClick={() => navigate(`/liquidaciones/${l.id}`)}>Ver</button>
                    <button className='text-indigo-600 hover:underline' onClick={() => navigate(`/liquidaciones/editar/${l.id}`)}>Editar</button>

                    {l.estado !== 'PAGADA' && (
                      <button
                        className='text-green-600 hover:underline'
                        onClick={() => handleMarcarPagada(l.id)}
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

        <div className='flex justify-center mt-8'>
          <Pagination
            paginate={{
              current_page: data?.meta?.current_page,
              last_page: data?.meta?.last_page,
              total: data?.meta?.total
            }}
            onPageChange={onPageChange}
            text
          />
        </div>
      </Card>
    </>
  )
}

export default LiquidacionesList
