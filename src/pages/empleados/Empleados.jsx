/* eslint-disable react/jsx-closing-tag-location */
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeleteButton from '@/components/buttons/DeleteButton'
import EditButton from '@/components/buttons/EditButton'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import { deleteEmpleado, getEmpleados, searchEmpleado } from '@/services/empleadoService'

export const Empleados = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const fetchEmpleados = async () => {
    return debouncedSearch
      ? searchEmpleado(debouncedSearch, currentPage)
      : getEmpleados(currentPage)
  }

  const { data: empleados, isLoading, refetch } = useQuery({
    queryKey: ['empleados', currentPage, debouncedSearch],
    queryFn: () => fetchEmpleados(currentPage),
    keepPreviousData: true
  })

  const onPageChange = (page) => {
    setCurrentPage(page)
    navigate(`?page=${page}`)
  }

  const addEmpleado = () => {
    navigate(`/empleados/crear?page=${currentPage}`)
  }

  const onEdit = (id) => {
    navigate(`/empleados/editar/${id}?page=${currentPage}`)
  }

  const onDelete = async (id) => {
    try {
      await deleteEmpleado(id)
      toast.success('Empleado eliminado correctamente')
      refetch()
    } catch (error) {
      toast.error('No se pudo eliminar el empleado')
    }
  }

  const onSearch = (e) => setSearch(e.target.value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 600)
    return () => clearTimeout(handler)
  }, [search])

  return (
    <>
      {(isLoading && !debouncedSearch)
        ? <Loading className='mt-28 md:mt-64' />
        : <>
          <Card>
            <div className='mb-4 md:flex md:justify-between'>
              <h1 className='text-2xl font-semibold dark:text-white mb-4 md:mb-0'>
                Empleados ({empleados?.meta?.total || 0})
              </h1>

              <div className='flex gap-4 items-center'>
                <SearchInput
                  name='search'
                  placeholder='Buscar empleado'
                  onChange={onSearch}
                  value={search}
                />

                <button
                  type='button'
                  onClick={addEmpleado}
                  className='bg-indigo-600 hover:bg-blue-800 text-white py-2 px-6 rounded-lg'
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
                    <th className='table-th'>Apellido</th>
                    <th className='table-th'>Nombre</th>
                    <th className='table-th'>CUIL</th>
                    <th className='table-th'>Legajo</th>
                    <th className='table-th'>Puesto</th>
                    <th className='table-th'>Acciones</th>
                  </tr>
                </thead>

                <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
                  {
                    empleados?.length
                      ? empleados.map((e) => (
                        <tr key={e.id}>
                          <td className='table-td'>{e.apellido}</td>
                          <td className='table-td'>{e.nombre}</td>
                          <td className='table-td'>{e.cuil || '-'}</td>
                          <td className='table-td'>{e.legajo || '-'}</td>
                          <td className='table-td'>{e.puesto || '-'}</td>
                          <td className='table-td flex gap-2'>
                            <EditButton evento={e} onEdit={onEdit} />
                            <DeleteButton evento={e} onDelete={onDelete} />
                          </td>
                        </tr>
                      ))
                      : <tr><td colSpan='6' className='text-center py-3'>Sin resultados</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div className='flex justify-center mt-6'>
              <Pagination
                paginate={{
                  current_page: empleados?.meta?.current_page,
                  last_page: empleados?.meta?.last_page,
                  total: empleados?.meta?.total
                }}
                onPageChange={onPageChange}
                text
              />
            </div>
          </Card>
        </>}
    </>
  )
}
