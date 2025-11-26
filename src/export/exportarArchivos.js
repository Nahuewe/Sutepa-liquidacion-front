import { sutepaApi } from '@/api'
import { exportarLiquidaciones } from '@/services/liquidacionService'

const getAuditoriaExcel = async () => {
  const response = await sutepaApi.get('/auditoria/exportar', {
    responseType: 'blob'
  })
  return response.data
}

export const descargarAuditoriaExcel = async () => {
  try {
    const blob = await getAuditoriaExcel()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'auditoria.xlsx')
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error descargando Excel:', error)
  }
}

export const descargarLiquidacionesExcel = async () => {
  try {
    const blob = await exportarLiquidaciones()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'liquidaciones.xlsx')
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error descargando Excel:', error)
  }
}
