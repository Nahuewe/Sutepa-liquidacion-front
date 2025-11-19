// src/pages/liquidaciones/CreateEditLiquidacion.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { SelectForm } from '@/components/ui/SelectForm'
import Textinput from '@/components/ui/Textinput'
import { getConceptos } from '@/services/conceptosService'
import { getEmpleados } from '@/services/empleadoService'
import { createLiquidacion, getLiquidacionById, updateLiquidacion } from '@/services/liquidacionService'

export const CreateEditLiquidacion = () => {
  const { id } = useParams() // id de liquidación si editás
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: empleadosData } = useQuery({ queryKey: ['empleados'], queryFn: () => getEmpleados(1) })
  const { data: conceptosData } = useQuery({ queryKey: ['conceptos'], queryFn: getConceptos })

  const { data: liquidacionData, isLoading: loadingLiquidacion } = useQuery({
    queryKey: ['liquidacion', id],
    queryFn: () => getLiquidacionById(id),
    enabled: !!id
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      empleado_id: '',
      periodo: '',
      items: [{ concepto_id: '', tipo: 'HABER', codigo: '', descripcion: '', monto: 0 }]
    }
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  })

  // cargar para editar
  useEffect(() => {
    if (liquidacionData?.data) {
      const l = liquidacionData.data
      setValue('empleado_id', l.empleado_id)
      setValue('periodo', l.periodo)
      const items = l.items.map(it => ({
        concepto_id: it.concepto_id ?? '',
        tipo: it.tipo,
        codigo: it.codigo ?? it.concepto?.codigo ?? '',
        descripcion: it.descripcion ?? it.concepto?.descripcion ?? '',
        monto: Number(it.monto)
      }))
      replace(items.length ? items : [])
    }
  }, [liquidacionData, replace, setValue])

  // totales en tiempo real
  const itemsWatch = watch('items')
  const totals = useMemo(() => {
    let hab = 0
    let desc = 0
    for (let i = 0; i < (itemsWatch?.length || 0); i++) {
      const it = itemsWatch[i] || {}
      const m = Number(it.monto || 0)
      if (it.tipo === 'HABER') hab += m
      else desc += m
    }
    const neto = hab - desc
    return { hab, desc, neto }
  }, [itemsWatch])

  // --- REACT QUERY v5 ---
  const createMut = useMutation({
    mutationFn: (payload) => createLiquidacion(payload),
    onSuccess: () => {
      toast.success('Liquidación creada')
      qc.invalidateQueries({ queryKey: ['liquidaciones'] })
      navigate('/liquidaciones')
    },
    onError: () => toast.error('Error al crear liquidación')
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateLiquidacion(id, payload),
    onSuccess: () => {
      toast.success('Liquidación actualizada')
      qc.invalidateQueries({ queryKey: ['liquidaciones'] })
      navigate('/liquidaciones')
    },
    onError: () => toast.error('Error al actualizar')
  })

  const onSubmit = (data) => {
    // validar que haya al menos 1 item con monto > 0
    const validItems = (data.items || []).filter(i => Number(i.monto) !== 0)
    if (!validItems.length) {
      return toast.error('La liquidación debe tener al menos un concepto con monto distinto de 0.')
    }

    const payload = {
      empleado_id: data.empleado_id,
      periodo: data.periodo,
      items: data.items.map(i => ({
        concepto_id: i.concepto_id || null,
        tipo: i.tipo,
        codigo: i.codigo,
        descripcion: i.descripcion,
        monto: Number(i.monto)
      }))
    }

    if (id) updateMut.mutate({ id, payload })
    else createMut.mutate(payload)
  }

  if (loadingLiquidacion) return <Loading />

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='form-label block font-medium'>Empleado *</label>
              <SelectForm
                name='empleado_id'
                options={(empleadosData?.data?.data || []).map(e => ({ id: e.id, nombre: `${e.nombre} ${e.apellido}` }))}
                register={register('empleado_id')}
                onChange={(e) => setValue('empleado_id', e.target.value)}
              />
            </div>

            <div>
              <label className='form-label block font-medium'>Periodo (YYYY-MM) *</label>
              <Textinput
                name='periodo'
                placeholder='2025-11'
                register={register}
                error={errors.periodo}
              />
            </div>

            <div className='flex items-end'>
              <div>
                <Button
                  text='Agregar concepto'
                  onClick={() => append({ concepto_id: '', tipo: 'HABER', codigo: '', descripcion: '', monto: 0 })}
                  className='bg-green-600 text-white'
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='border-b'>
                  <th className='p-2'>#</th>
                  <th className='p-2'>Concepto</th>
                  <th className='p-2'>Tipo</th>
                  <th className='p-2'>Código</th>
                  <th className='p-2'>Descripción</th>
                  <th className='p-2'>Monto</th>
                  <th className='p-2'>Acción</th>
                </tr>
              </thead>

              <tbody>
                {fields.map((field, idx) => (
                  <tr key={field.id} className='border-b'>
                    <td className='p-2'>{idx + 1}</td>

                    <td className='p-2 w-56'>
                      <select
                        className='w-full p-2 border rounded'
                        {...register(`items.${idx}.concepto_id`)}
                        onChange={(e) => {
                          const selected = (conceptosData?.data || []).find(c => String(c.id) === e.target.value)
                          if (selected) {
                            setValue(`items.${idx}.concepto_id`, selected.id)
                            setValue(`items.${idx}.codigo`, selected.codigo)
                            setValue(`items.${idx}.descripcion`, selected.descripcion)
                            setValue(`items.${idx}.tipo`, selected.tipo)
                          } else {
                            setValue(`items.${idx}.concepto_id`, '')
                          }
                        }}
                        value={watch(`items.${idx}.concepto_id`) ?? ''}
                      >
                        <option value=''>-- Seleccione --</option>
                        {(conceptosData?.data || []).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.codigo} - {c.descripcion} ({c.tipo})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className='p-2 w-32'>
                      <select
                        className='w-full p-2 border rounded'
                        {...register(`items.${idx}.tipo`)}
                        value={watch(`items.${idx}.tipo`) ?? 'HABER'}
                      >
                        <option value='HABER'>HABER</option>
                        <option value='DESCUENTO'>DESCUENTO</option>
                      </select>
                    </td>

                    <td className='p-2 w-28'>
                      <input className='w-full p-2 border rounded' {...register(`items.${idx}.codigo`)} />
                    </td>

                    <td className='p-2'>
                      <input className='w-full p-2 border rounded' {...register(`items.${idx}.descripcion`)} />
                    </td>

                    <td className='p-2 w-32'>
                      <input
                        type='number'
                        step='0.01'
                        className='w-full p-2 border rounded'
                        {...register(`items.${idx}.monto`, { valueAsNumber: true })}
                      />
                    </td>

                    <td className='p-2'>
                      <button type='button' className='text-red-600' onClick={() => remove(idx)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className='flex justify-end gap-6 mt-4'>
            <div className='text-right'>
              <div>Haberes: ${totals.hab.toFixed(2)}</div>
              <div>Descuentos: ${totals.desc.toFixed(2)}</div>
              <div className='font-semibold'>Neto: ${totals.neto.toFixed(2)}</div>
            </div>
          </div>

        </form>
      </Card>

      <div className='flex justify-end gap-4 mt-6'>
        <Button text='Volver' className='btn-danger' onClick={() => navigate('/liquidaciones')} />
        <Button
          text={isSubmitting ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
          className='bg-green-600 text-white'
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

export default CreateEditLiquidacion
