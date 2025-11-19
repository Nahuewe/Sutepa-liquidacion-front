import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { SelectForm } from '@/components/ui/SelectForm'
import Textarea from '@/components/ui/Textarea'
import Textinput from '@/components/ui/Textinput'

// ENDPOINTS NUEVOS
import { getConceptos } from '@/services/conceptosService'
import { getEmpleados } from '@/services/empleadosService'
import { createLiquidacion, getLiquidacionById } from '@/services/liquidacionService'

export const CreateLiquidacion = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1
  const [currentPage] = useState(initialPage)
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const { data: empleados } = useQuery({
    queryKey: ['empleados', currentPage],
    queryFn: () => getEmpleados(currentPage),
    keepPreviousData: true
  })

  const { data: conceptos } = useQuery({
    queryKey: ['conceptos'],
    queryFn: () => getConceptos(),
    keepPreviousData: true
  })

  const {
    register,
    formState: { isSubmitting },
    handleSubmit,
    setValue
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await createLiquidacion(data)
      navigate('/liquidaciones')
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error inesperado'
      toast.error(msg)
    }
  }

  const loadLiquidacion = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const { data } = await getLiquidacionById(id)

      setValue('empleado_id', data.empleado_id)
      setValue('concepto_id', data.concepto_id)
      setValue('codigo', data.codigo)
      setValue('descripcion', data.descripcion)
      setValue('monto', data.monto)
    } catch (err) {
      console.error(err)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadLiquidacion()
  }, [id])

  return isLoading
    ? (
      <Loading />
      )
    : (
      <>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>

            <div>
              <label className='form-label block font-medium'>Empleado (*)</label>
              <SelectForm
                name='empleado_id'
                className='w-full border rounded-lg p-2'
                options={
                empleados?.data?.map(e => ({
                  id: e.id,
                  nombre: `${e.nombre} ${e.apellido}`
                })) ?? []
              }
                onChange={(e) => setValue('empleado_id', e.target.value)}
              />
            </div>

            <div>
              <label className='form-label block font-medium'>Concepto (*)</label>
              <SelectForm
                name='concepto_id'
                className='w-full border rounded-lg p-2'
                options={conceptos?.data ?? []}
                onChange={(e) => {
                  const concepto = conceptos?.data?.find(c => c.id === e.target.value)
                  if (concepto) {
                    setValue('concepto_id', concepto.id)
                    setValue('codigo', concepto.codigo)
                  }
                }}
              />
            </div>

            <div>
              <Textinput
                name='codigo'
                label='Código'
                register={register}
                placeholder='Código del concepto'
              />
            </div>

            <div>
              <Textarea
                name='descripcion'
                rows={3}
                className='w-full border rounded-lg p-2'
                placeholder='Detalle del concepto'
                register={register}
              />
            </div>

            <div>
              <Textinput
                name='monto'
                type='number'
                label='Monto (*)'
                register={register}
                placeholder='Ingrese el monto'
              />
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
            text={isSubmitting ? 'Guardando...' : 'Guardar'}
            className='bg-green-600 text-white py-2 px-6 rounded-lg'
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </>
      )
}
