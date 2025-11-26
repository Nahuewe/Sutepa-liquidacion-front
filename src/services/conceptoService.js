import { sutepaApi } from '@/api'

export const getConceptos = async (page = 1) => {
  const { data } = await sutepaApi.get(`/conceptos?page=${page}`)
  return data
}

export const searchConcepto = async (search, page = 1) => {
  const { data } = await sutepaApi.get(`/conceptos?search=${search}&page=${page}`)
  return data
}

export const getConceptoById = async (id) => {
  const { data } = await sutepaApi.get(`/conceptos/${id}`)
  return data
}

export const createConcepto = async (payload) => {
  const { data } = await sutepaApi.post('/conceptos', payload)
  return data
}

export const updateConcepto = async (id, payload) => {
  const { data } = await sutepaApi.put(`/conceptos/${id}`, payload)
  return data
}

export const deleteConcepto = async (id) => {
  const { data } = await sutepaApi.delete(`/conceptos/${id}`)
  return data
}

export const calcularConcepto = async (conceptoId, empleadoId, items) => {
  const { data } = await sutepaApi.post(`/conceptos/${conceptoId}/calcular`, {
    concepto_id: conceptoId,
    empleado_id: empleadoId,
    items: items.map(i => ({
      concepto_id: i.concepto_id || null,
      codigo: i.codigo,
      monto: Number(i.monto) || 0
    }))
  })

  return data.monto
}
