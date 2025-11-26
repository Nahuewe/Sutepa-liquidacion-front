import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { SelectForm } from '@/components/ui/SelectForm'
import Textinput from '@/components/ui/Textinput'
import { getConceptos, calcularConcepto } from '@/services/conceptoService'
import { getEmpleados } from '@/services/empleadoService'
import { createLiquidacion, getLiquidacionById, updateLiquidacion } from '@/services/liquidacionService'

export const CreateEditLiquidacion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1
  const [currentPage] = useState(initialPage)

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
      items: []
    }
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  })

  useEffect(() => {
    if (liquidacionData) {
      const l = liquidacionData

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
  }, [liquidacionData])

  const itemsWatch = watch('items')

  const totals = useMemo(() => {
    let hab = 0
    let desc = 0

    for (let i = 0; i < (itemsWatch?.length || 0); i++) {
      const it = itemsWatch[i]
      const monto = Number(it?.monto || 0)

      if (it?.tipo === 'HABER') hab += monto
      else desc += monto
    }

    return {
      hab,
      desc,
      neto: hab - desc
    }
  }, [itemsWatch])

  useEffect(() => {
    const empleadoId = watch('empleado_id')
    if (!empleadoId || !empleadosData?.data) return

    const empleado = empleadosData.data.find(e => String(e.id) === String(empleadoId))
    if (!empleado) return

    const sueldo = Number(empleado.sueldo_basico || 0)

    const exists = itemsWatch.some(i => i.codigo === 'BAS')

    if (!exists) {
      replace([
        {
          concepto_id: null,
          tipo: 'HABER',
          codigo: 'BAS',
          descripcion: 'Sueldo Básico',
          monto: sueldo
        },
        ...(itemsWatch || [])
      ])
    } else {
      itemsWatch.forEach((it, idx) => {
        if (it.codigo === 'BAS') {
          setValue(`items.${idx}.monto`, sueldo)
        }
      })
    }
  }, [watch('empleado_id'), empleadosData])

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
      qc.invalidateQueries({ queryKey: ['liquidaciones'], exact: false })
      navigate('/liquidaciones')
    },
    onError: () => toast.error('Error al actualizar')
  })

  const onSubmit = (data) => {
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
                options={(empleadosData?.data ?? []).map(e => ({
                  id: e.id,
                  nombre: `${e.nombre} ${e.apellido}`
                }))}
                register={register('empleado_id')}
                onChange={(e) => setValue('empleado_id', e.target.value)}
              />
            </div>

            <div>
              <label className='form-label block font-medium'>Periodo (AÑO-MES) *</label>
              <Textinput
                name='periodo'
                placeholder='YYYY-MM'
                register={register}
                error={errors.periodo}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length > 4) {
                    value = value.slice(0, 4) + '-' + value.slice(4, 6)
                  }
                  if (value.length > 7) value = value.slice(0, 7)
                  setValue('periodo', value, { shouldValidate: true })
                }}
              />
            </div>

            <div className='flex items-end'>
              <Button
                text='Agregar concepto'
                onClick={() => append({ concepto_id: '', tipo: 'HABER', codigo: '', descripcion: '', monto: 0 })}
                className='bg-blue-600 text-white p-2'
              />
            </div>
          </div>

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
                      <SelectForm
                        name={`items.${idx}.concepto_id`}
                        register={register(`items.${idx}.concepto_id`)}
                        value={watch(`items.${idx}.concepto_id`) ?? ''}
                        options={(conceptosData?.data || []).map(c => ({
                          id: c.id,
                          nombre: `${c.codigo} - ${c.descripcion}` // (${c.tipo})
                        }))}
                        onChange={(e) => {
                          const selected = (conceptosData?.data || []).find(
                            c => String(c.id) === e.target.value
                          )

                          if (selected) {
                            setValue(`items.${idx}.concepto_id`, selected.id)
                            setValue(`items.${idx}.codigo`, selected.codigo)
                            setValue(`items.${idx}.descripcion`, selected.descripcion)
                            setValue(`items.${idx}.tipo`, selected.tipo)

                            if (selected.modo_calculo === 'FIJO') {
                              setValue(`items.${idx}.monto`, Number(selected.monto_default || 0))
                            }

                            if (selected.modo_calculo !== 'FIJO') {
                              const empleadoId = watch('empleado_id')

                              if (!empleadoId) {
                                toast.error('Primero seleccioná un empleado')
                                return
                              }

                              calcularConcepto(selected.id, empleadoId, itemsWatch)
                                .then(valor => {
                                  setValue(`items.${idx}.monto`, Number(valor))
                                })
                                .catch(() => toast.error('No se pudo calcular el concepto'))
                            }
                          } else {
                            setValue(`items.${idx}.concepto_id`, '')
                          }
                        }}
                      />
                    </td>

                    <td className='p-2 w-32'>
                      <SelectForm
                        name={`items.${idx}.tipo`}
                        register={register(`items.${idx}.tipo`)}
                        value={watch(`items.${idx}.tipo`) ?? 'HABER'}
                        options={[
                          { id: 'HABER', nombre: 'HABER' },
                          { id: 'DESCUENTO', nombre: 'DESCUENTO' }
                        ]}
                        onChange={(e) => setValue(`items.${idx}.tipo`, e.target.value)}
                      />
                    </td>

                    <td className='w-28 p-1'>
                      <Textinput
                        name={`items.${idx}.codigo`}
                        type='text'
                        placeholder=''
                        register={register}
                      />
                    </td>

                    <td className='p-1'>
                      <Textinput
                        name={`items.${idx}.descripcion`}
                        type='text'
                        placeholder='Ingrese una descripción...'
                        register={register}
                      />
                    </td>

                    <td className='p-1 w-32'>
                      <Textinput
                        name={`items.${idx}.monto`}
                        register={register}
                        rules={{ valueAsNumber: true }}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0)
                          setValue(`items.${idx}.monto`, v, { shouldValidate: true })
                        }}
                        type='number'
                      />
                    </td>

                    <td className='p-2'>
                      {watch(`items.${idx}.codigo`) !== 'BAS' && (
                        <button
                          type='button'
                          className='text-red-600'
                          onClick={() => remove(idx)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='flex justify-end gap-6 mt-4'>
            <div className='text-right'>
              <div>Haberes: ${totals.hab.toFixed(2)}</div>
              <div>Descuentos: ${totals.desc.toFixed(2)}</div>
              <div className='font-semibold'>Neto: ${totals.neto.toFixed(2)}</div>
            </div>
          </div>

        </form>
      </Card>

      <div className='flex justify-end gap-4 mt-8'>
        <button
          className='btn-danger py-2 px-6 rounded-lg'
          onClick={() => navigate(`/liquidaciones?page=${currentPage}`)}
        >
          Volver
        </button>

        <Button
          type='submit'
          text={isSubmitting ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
          className={`bg-green-500 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-700'} text-white py-2 px-6 rounded-lg`}
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </>
  )
}

export default CreateEditLiquidacion
