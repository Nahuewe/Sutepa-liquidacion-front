import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Textinput from '@/components/ui/Textinput'
import { createConcepto, getConceptoById, updateConcepto } from '@/services/conceptosService'

export const CreateEditConceptos = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const page = parseInt(queryParams.get('page')) || 1

  const isEdit = Boolean(id)

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      codigo: '',
      descripcion: '',
      tipo: 'HABER',
      monto: ''
    }
  })

  const { data: concepto, isLoading } = useQuery({
    queryKey: ['concepto', id],
    queryFn: () => getConceptoById(id),
    enabled: isEdit
  })

  useEffect(() => {
    if (isEdit && concepto) {
      setValue('codigo', concepto.codigo)
      setValue('descripcion', concepto.descripcion)
      setValue('tipo', concepto.tipo)
      setValue('monto', concepto.monto_default ?? '')
    }
  }, [concepto, isEdit, setValue])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        await updateConcepto(id, data)
        toast.success('Concepto actualizado correctamente')
      } else {
        await createConcepto(data)
        toast.success('Concepto creado correctamente')
      }

      navigate(`/conceptos?page=${page}`)
    } catch (err) {
      if (err?.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgArr) => toast.error(msgArr[0]))
      } else {
        toast.error('Error al guardar el concepto')
      }
    }
  })

  if (isEdit && isLoading) {
    return <Loading className='mt-24' />
  }

  return (
    <Card className='p-10 mt-8 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl'>
      <h1 className='text-3xl font-semibold mb-8 dark:text-white tracking-wide'>
        {isEdit ? 'Editar Concepto' : 'Crear Concepto'}
      </h1>

      <form
        onSubmit={onSubmit}
        className='grid grid-cols-1 md:grid-cols-2 gap-8'
      >
        <Textinput
          label='Código'
          name='codigo'
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Código del Concepto...'
        />

        <Textinput
          label='Descripción'
          name='descripcion'
          register={register}
          required
          className='rounded-lg !py-3'
          placeholder='Descripción del Concepto...'
        />

        <div className='flex flex-col gap-2'>
          <label className='font-medium text-slate-700 dark:text-slate-200'>
            Tipo
          </label>

          <select
            {...register('tipo')}
            className='border rounded-lg px-4 py-3 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
            required
          >
            <option value='HABER'>HABER</option>
            <option value='DESCUENTO'>DESCUENTO</option>
          </select>
        </div>

        <Textinput
          label='Monto por defecto'
          name='monto'
          type='number'
          step='0.01'
          register={register}
          className='rounded-lg !py-3'
          placeholder='Monto Basico del Concepto...'
        />

        <div className='md:col-span-2 flex justify-end mt-6'>
          <button
            type='submit'
            className='bg-indigo-600 hover:bg-indigo-700 transition-all text-white py-3 px-10 rounded-lg shadow-md font-medium'
          >
            {isEdit ? 'Guardar Cambios' : 'Crear Concepto'}
          </button>
        </div>
      </form>
    </Card>
  )
}
