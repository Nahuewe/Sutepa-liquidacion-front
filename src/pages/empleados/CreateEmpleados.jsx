import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Textinput from '@/components/ui/Textinput'
import { createEmpleado, getEmpleadoById, updateEmpleado } from '@/services/empleadoService'

export const CreateEmpleados = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const page = parseInt(queryParams.get('page')) || 1

  const isEdit = Boolean(id)

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      cuil: '',
      legajo: '',
      sueldo_basico: '',
      puesto: ''
    }
  })

  const { data: empleado, isLoading } = useQuery({
    queryKey: ['empleado', id],
    queryFn: () => getEmpleadoById(id),
    enabled: isEdit
  })

  useEffect(() => {
    if (empleado && isEdit) {
      setValue('nombre', empleado.nombre ?? '')
      setValue('apellido', empleado.apellido ?? '')
      setValue('cuil', empleado.cuil ?? '')
      setValue('legajo', empleado.legajo ?? '')
      setValue('sueldo_basico', empleado.sueldo_basico ?? '')
      setValue('puesto', empleado.puesto ?? '')
    }
  }, [empleado, isEdit, setValue])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        await updateEmpleado(id, data)
        toast.success('Empleado actualizado correctamente')
      } else {
        await createEmpleado(data)
        toast.success('Empleado creado correctamente')
      }

      navigate(`/empleados?page=${page}`)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el empleado')
    }
  })

  if (isEdit && isLoading) {
    return <Loading className='mt-24' />
  }

  return (
    <Card className='p-10 mt-8 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl'>
      <h1 className='text-3xl font-semibold mb-8 dark:text-white tracking-wide'>
        {isEdit ? 'Editar Empleado' : 'Crear Empleado'}
      </h1>

      <form
        onSubmit={onSubmit}
        className='grid grid-cols-1 md:grid-cols-2 gap-8'
      >
        <Textinput
          label='Nombre'
          name='nombre'
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Nombre del Empleado...'
        />

        <Textinput
          label='Apellido'
          name='apellido'
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Apellido del Empleado...'
        />

        <Textinput
          label='CUIL'
          name='cuil'
          register={register}
          className='rounded-lg !py-3'
          placeholder='CUIL del Empleado...'
        />

        <Textinput
          label='Legajo'
          name='legajo'
          register={register}
          className='rounded-lg !py-3'
          placeholder='Legajo del Empleado...'
        />

        <Textinput
          label='Sueldo Básico'
          name='sueldo_basico'
          type='number'
          step='0.01'
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Sueldo Basico del Empleado...'
        />

        <div className='flex flex-col gap-2'>
          <label className='font-medium text-slate-700 dark:text-slate-200'>
            Puesto
          </label>

          <select
            {...register('puesto')}
            className='border rounded-lg px-4 py-3 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
          >
            <option value=''>Seleccionar...</option>
            <option value='ADMINISTRATIVO'>ADMINISTRATIVO</option>
            <option value='SECRETARIO'>SECRETARIO</option>
            <option value='OPERARIO'>OPERARIO</option>
            <option value='SUPERVISOR'>SUPERVISOR</option>
          </select>
        </div>

        <div className='md:col-span-2 flex justify-end mt-6'>
          <button
            type='submit'
            className='bg-indigo-600 hover:bg-indigo-700 transition-all text-white py-3 px-10 rounded-lg shadow-md font-medium'
          >
            {isEdit ? 'Guardar Cambios' : 'Crear Empleado'}
          </button>
        </div>
      </form>
    </Card>
  )
}
