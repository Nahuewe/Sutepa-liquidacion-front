import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Textinput from '@/components/ui/Textinput'
import { createEmpleado, getEmpleadoById, updateEmpleado } from '@/services/empleadoService'

export const CreateEditEmpleados = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const page = parseInt(queryParams.get('page')) || 1

  const isEdit = Boolean(id)
  const { register } = useForm()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    cuil: '',
    legajo: '',
    sueldo_basico: '',
    puesto: ''
  })

  const { data: empleado, isLoading } = useQuery({
    queryKey: ['empleado', id],
    queryFn: () => getEmpleadoById(id),
    enabled: isEdit
  })

  useEffect(() => {
    if (empleado?.data && isEdit) {
      setForm({
        nombre: empleado.data.nombre ?? '',
        apellido: empleado.data.apellido ?? '',
        cuil: empleado.data.cuil ?? '',
        legajo: empleado.data.legajo ?? '',
        sueldo_basico: empleado.data.sueldo_basico ?? '',
        puesto: empleado.data.puesto ?? ''
      })
    }
  }, [empleado, isEdit])

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isEdit) {
        await updateEmpleado(id, form)
        toast.success('Empleado actualizado correctamente')
      } else {
        await createEmpleado(form)
        toast.success('Empleado creado correctamente')
      }

      navigate(`/empleados?page=${page}`)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el empleado')
    }
  }

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
          value={form.nombre}
          onChange={onChange}
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Ej: Juan'
        />

        <Textinput
          label='Apellido'
          name='apellido'
          value={form.apellido}
          onChange={onChange}
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Ej: Pérez'
        />

        <Textinput
          label='CUIL'
          name='cuil'
          value={form.cuil}
          onChange={onChange}
          register={register}
          className='rounded-lg !py-3'
          placeholder='20-12345678-9'
        />

        <Textinput
          label='Legajo'
          name='legajo'
          value={form.legajo}
          onChange={onChange}
          register={register}
          className='rounded-lg !py-3'
          placeholder='Ej: 4421'
        />

        <Textinput
          label='Sueldo Básico'
          name='sueldo_basico'
          type='number'
          step='0.01'
          value={form.sueldo_basico}
          onChange={onChange}
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='0.00'
        />

        <div className='flex flex-col gap-2'>
          <label className='font-medium text-slate-700 dark:text-slate-200'>
            Puesto
          </label>

          <select
            name='puesto'
            value={form.puesto}
            onChange={onChange}
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
