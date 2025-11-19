import { sutepaApi } from '@/api'

export const getConceptos = async () => {
  const { data } = await sutepaApi.get('/conceptos')
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
