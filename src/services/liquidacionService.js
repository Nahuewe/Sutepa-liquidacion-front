import { sutepaApi } from '@/api'

export const getLiquidaciones = async (page = 1) => {
  const { data } = await sutepaApi.get(`/liquidaciones?page=${page}`)
  return data
}

export const searchLiquidaciones = async (search, page) => {
  const { data } = await sutepaApi.get(`/liquidaciones?search=${search}&page=${page}`)
  return data
}

export const getLiquidacionById = async (id) => {
  const { data } = await sutepaApi.get(`/liquidaciones/${id}`)
  return data
}

export const createLiquidacion = async (payload) => {
  const { data } = await sutepaApi.post('/liquidaciones', payload)
  return data
}

export const updateLiquidacion = async (id, payload) => {
  const { data } = await sutepaApi.put(`/liquidaciones/${id}`, payload)
  return data
}

export const deleteLiquidacion = async (id) => {
  const { data } = await sutepaApi.delete(`/liquidaciones/${id}`)
  return data
}

export const marcarPagada = async (id) => {
  const { data } = await sutepaApi.post(`/liquidaciones/${id}/pagar`)
  return data
}

export const exportarLiquidaciones = async () => {
  const response = await sutepaApi.get('/liquidaciones/export', {
    responseType: 'blob'
  })

  return response.data
}
