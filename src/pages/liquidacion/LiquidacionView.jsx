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

  const l = data
  if (!l) return <p className='text-center text-lg mt-10'>Liquidación no encontrada</p>

  return (
    <>
      <div className='flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-slate-800 shadow mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
            Liquidación #{l.id}
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mt-1 text-lg'>
            {l.empleado.nombre} {l.empleado.apellido} · {l.periodo}
          </p>
        </div>
        <Button
          text='Volver'
          onClick={() => navigate('/liquidaciones')}
          className='btn-outline'
        />
      </div>

      <Card className='p-0 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-separate border-spacing-0'>
            <thead className='bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200'>
              <tr>
                <th className='p-3 font-semibold'>Concepto</th>
                <th className='p-3 font-semibold'>Tipo</th>
                <th className='p-3 font-semibold'>Código</th>
                <th className='p-3 font-semibold'>Descripción</th>
                <th className='p-3 font-semibold text-right'>Monto</th>
              </tr>
            </thead>
            <tbody>
              {l?.items?.length > 0
                ? (
                    l.items.map((it, index) => (
                      <tr
                        key={it.id}
                        className={`${
                      index % 2 === 0
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-gray-50 dark:bg-slate-700'
                    } hover:bg-gray-100 dark:hover:bg-slate-600 transition`}
                      >
                        <td className='p-3'>
                          {it?.descripcion || it?.concepto?.descripcion || '-'}
                        </td>

                        <td className='p-3'>{it?.tipo}</td>

                        <td className='p-3'>
                          {it?.codigo || it?.concepto?.codigo || '-'}
                        </td>

                        <td className='p-3'>
                          {it?.descripcion || it?.concepto?.descripcion || '-'}
                        </td>

                        <td className='p-3 text-right font-medium'>
                          ${Number(it.monto).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )
                : (
                  <tr>
                    <td colSpan={5} className='p-6 text-center text-gray-500'>
                      Sin ítems en esta liquidación
                    </td>
                  </tr>
                  )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className='mt-6'>
        <Card className='p-6 md:w-1/3 ml-auto shadow-lg'>
          <div className='space-y-2 text-gray-800 dark:text-gray-200 text-lg'>
            <div className='flex justify-between'>
              <span>Total haberes:</span>
              <span className='font-medium'>
                ${Number(l.total_haberes).toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Total descuentos:</span>
              <span className='font-medium'>
                ${Number(l.total_descuentos).toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between pt-2 border-t text-xl font-bold'>
              <span>Neto:</span>
              <span>${Number(l.neto).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
