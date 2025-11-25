import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeleteButton from '@/components/buttons/DeleteButton'
import EditButton from '@/components/buttons/EditButton'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import columnConceptos from '@/json/columnConceptos'
import { deleteConcepto, getConceptos, searchConcepto } from '@/services/conceptosService'

export const Conceptos = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const fetchData = async () => {
    return debouncedSearch
      ? searchConcepto(debouncedSearch, currentPage)
      : getConceptos(currentPage)
  }

  const { data: conceptos, isLoading, refetch } = useQuery({
    queryKey: ['conceptos', currentPage, debouncedSearch],
    queryFn: () => fetchData(currentPage),
    keepPreviousData: true
  })

  const onPageChange = (page) => {
    setCurrentPage(page)
    navigate(`?page=${page}`)
  }

  const addConcepto = () => {
    navigate(`/conceptos/crear?page=${currentPage}`)
  }

  const onEdit = (id) => {
    navigate(`/conceptos/editar/${id}?page=${currentPage}`)
  }

  const onDelete = async (id) => {
    try {
      await deleteConcepto(id)
      toast.success('Concepto eliminado correctamente')
      refetch()
    } catch (error) {
      toast.error('No se pudo eliminar el concepto')
    }
  }

  const onSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 800)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <>
      {isLoading && !debouncedSearch
        ? (<Loading className='mt-32' />)
        : (
          <>
            <Card>
              <div className='mb-4 md:flex md:justify-between'>
                <h1 className='text-2xl font-semibold dark:text-white mb-4 md:mb-0'>
                  Conceptos ({conceptos?.meta?.total})
                </h1>

                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                  <SearchInput
                    name='search'
                    type='text'
                    placeholder='Buscar'
                    onChange={onSearch}
                    value={search}
                  />

                  <button
                    type='button'
                    onClick={addConcepto}
                    className='bg-red-600 hover:bg-red-800 text-white py-2 px-6 rounded-lg'
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </Card>

            <Card noborder className='mt-4'>
              <div className='overflow-x-auto -mx-6'>
                <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700'>
                  <thead className='bg-slate-200 dark:bg-slate-700'>
                    <tr>
                      {columnConceptos.map((col, i) => (
                        <th key={i} className='table-th'>{col.label}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className='bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700'>
                    {conceptos?.data?.length > 0
                      ? conceptos?.data?.map((item) => (
                        <tr key={item.id}>
                          <td className='table-td'>{item.codigo}</td>
                          <td className='table-td'>{item.descripcion}</td>
                          <td className='table-td'>{item.tipo}</td>
                          <td className='table-td'>{item.monto_default}</td>
                          <td className='table-td flex gap-2'>
                            <EditButton evento={item} onEdit={onEdit} />
                            <DeleteButton evento={item} onDelete={onDelete} refetch={refetch} />
                          </td>
                        </tr>
                      ))
                      : <tr><td colSpan='10' className='text-center py-2'>No se encontraron resultados</td></tr>}
                  </tbody>

                </table>

                <div className='flex justify-center mt-6'>
                  <Pagination
                    paginate={{
                      current_page: conceptos?.meta?.current_page,
                      last_page: conceptos?.meta?.last_page,
                      total: conceptos?.meta?.total
                    }}
                    onPageChange={onPageChange}
                    text
                  />
                </div>
              </div>
            </Card>
          </>
          )}
    </>
  )
}
