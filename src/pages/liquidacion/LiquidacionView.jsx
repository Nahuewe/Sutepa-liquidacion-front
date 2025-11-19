// src/pages/liquidaciones/LiquidacionView.jsx
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import { getLiquidacionById } from '@/services/liquidacionService'

export const LiquidacionView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['liquidacion', id],
    queryFn: () => getLiquidacionById(id),
    enabled: !!id
  })

  if (isLoading) return <Loading />

  const l = data?.data

  if (!l) return <p className='text-center'>Liquidación no encontrada</p>

  return (
    <>
      <div className='flex items-center justify-between p-6 rounded-2xl bg-white shadow mb-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Liquidación #{l.id}</h1>
          <p className='text-gray-600'>{l.empleado.nombre} {l.empleado.apellido} — {l.periodo}</p>
        </div>

        <div className='flex gap-2'>
          <Button text='Volver' onClick={() => navigate('/liquidaciones')} className='btn-outline' />
        </div>
      </div>

      <Card>
        <table className='w-full text-left'>
          <thead>
            <tr className='border-b'>
              <th className='p-2'>Concepto</th>
              <th className='p-2'>Tipo</th>
              <th className='p-2'>Código</th>
              <th className='p-2'>Descripción</th>
              <th className='p-2'>Monto</th>
            </tr>
          </thead>

          <tbody>
            {l.items.map(it => (
              <tr key={it.id} className='border-b'>
                <td className='p-2'>{it.concepto?.descripcion ?? it.descripcion}</td>
                <td className='p-2'>{it.tipo}</td>
                <td className='p-2'>{it.codigo}</td>
                <td className='p-2'>{it.descripcion}</td>
                <td className='p-2'>${Number(it.monto).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='mt-4 flex justify-end gap-6'>
          <div className='text-right'>
            <div>Total haberes: ${Number(l.total_haberes).toFixed(2)}</div>
            <div>Total descuentos: ${Number(l.total_descuentos).toFixed(2)}</div>
            <div className='font-semibold'>Neto: ${Number(l.neto).toFixed(2)}</div>
          </div>
        </div>
      </Card>
    </>
  )
}

export default LiquidacionView
