/* eslint-disable react/jsx-closing-tag-location */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeleteButton from '@/components/buttons/DeleteButton'
import EditButton from '@/components/buttons/EditButton'
import ExportButton from '@/components/buttons/ExportButton'
import MarkPaidButton from '@/components/buttons/MarkPaidButton'
import ViewButton from '@/components/buttons/ViewButton'
import Card from '@/components/ui/Card'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Loading from '@/components/ui/Loading'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import { descargarLiquidacionesExcel } from '@/export/exportarArchivos'
import {
  deleteLiquidacion,
  getLiquidaciones,
  searchLiquidaciones,
  marcarPagada
} from '@/services/liquidacionService'

export const Liquidaciones = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const fetchData = async () => {
    return debouncedSearch
      ? searchLiquidaciones(debouncedSearch, currentPage)
      : getLiquidaciones(currentPage)
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['liquidaciones', currentPage, debouncedSearch],
    queryFn: () => fetchData(),
    keepPreviousData: true
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 800)
    return () => clearTimeout(timer)
  }, [search])

  const onPageChange = (page) => {
    setCurrentPage(page)
    navigate(`?page=${page}`)
  }

  const addLiquidacion = () => {
    navigate(`/liquidaciones/crear?page=${currentPage}`)
  }

  const onView = (id) => {
    navigate(`/liquidaciones/${id}?page=${currentPage}`)
  }

  const onEdit = (id) => {
    navigate(`/liquidaciones/editar/${id}?page=${currentPage}`)
  }

  const onSearch = (e) => setSearch(e.target.value)

  const openConfirmModal = (id) => {
    setSelectedId(id)
    setModalOpen(true)
  }

  const onDelete = async (id) => {
    try {
      await deleteLiquidacion(id)
      toast.success('Liquidación eliminada correctamente')
      refetch()
    } catch (error) {
      toast.error('No se pudo eliminar la liquidación')
    }
  }

  const confirmPago = async () => {
    try {
      await marcarPagada(selectedId)
      toast.success('Liquidación marcada como pagada')

      setModalOpen(false)
      setSelectedId(null)

      queryClient.invalidateQueries({ queryKey: ['liquidaciones'], exact: false })
    } catch (err) {
      toast.error('No se pudo marcar como pagada')
    }
  }

  if (isLoading && !debouncedSearch) {
    return <Loading className='mt-28 md:mt-64' />
  }

  return (
    <>
      <Card>
        <div className='mb-4 md:flex md:justify-between'>
          <h1 className='text-2xl font-semibold dark:text-white mb-4 md:mb-0'>
            Liquidaciones ({data?.meta?.total || 0})
          </h1>

          <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
            <SearchInput
              name='search'
              type='text'
              placeholder='Buscar'
              onChange={onSearch}
              value={search}
            />

            <ExportButton
              descargaFn={descargarLiquidacionesExcel}
              nombreArchivo='Liquidaciones'
              textoBoton='Exportar Liquidaciones'
              textoExportando='Exportando Liquidaciones...'
            />

            <button
              type='button'
              onClick={addLiquidacion}
              className='bg-red-600 hover:bg-red-800 text-white py-2 px-6 rounded-lg'
            >
              Agregar
            </button>
          </div>
        </div>
      </Card>

      <Card noborder className='mt-4'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-200 dark:bg-slate-700'>
              <tr>
                <th className='table-th'>Empleado</th>
                <th className='table-th'>CUIL</th>
                <th className='table-th'>Periodo</th>
                <th className='table-th'>Haberes</th>
                <th className='table-th'>Descuentos</th>
                <th className='table-th'>Neto</th>
                <th className='table-th'>Estado</th>
                <th className='table-th'>Acciones</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
              {data?.data?.length
                ? data.data.map((l) => (
                  <tr key={l.id}>
                    <td className='table-td'>
                      {l.empleado?.nombre} {l.empleado?.apellido}
                    </td>
                    <td className='table-td'>{l?.empleado?.cuil}</td>
                    <td className='table-td'>{l.periodo}</td>
                    <td className='table-td'>${Number(l.total_haberes).toFixed(2)}</td>
                    <td className='table-td'>${Number(l.total_descuentos).toFixed(2)}</td>
                    <td className='table-td font-semibold'>
                      ${Number(l.neto).toFixed(2)}
                    </td>

                    <td className='table-td'>
                      {l.estado === 'PAGADA'
                        ? <span className='text-green-600 font-semibold'>Pagada</span>
                        : <span className='text-yellow-600 font-semibold'>{l.estado}</span>}
                    </td>

                    <td className='table-td flex gap-2'>
                      <ViewButton evento={l} onView={onView} />
                      <EditButton evento={l} onEdit={onEdit} />
                      <DeleteButton evento={l} onDelete={onDelete} />
                      {l.estado !== 'PAGADA' && (
                        <MarkPaidButton evento={l} onMarkPaid={() => openConfirmModal(l.id)} />
                      )}
                    </td>
                  </tr>
                ))
                : <tr><td colSpan='8' className='text-center py-3'>Sin resultados</td></tr>}
            </tbody>
          </table>
        </div>

        <div className='flex justify-center mt-6'>
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

      <ConfirmModal
        open={modalOpen}
        title='Confirmar pago'
        message='¿Deseas marcar esta liquidación como pagada?'
        onClose={() => setModalOpen(false)}
        onConfirm={confirmPago}
      />
    </>
  )
}
