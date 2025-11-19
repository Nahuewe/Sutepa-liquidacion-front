import { sutepaApi } from '@/api'

export const getEmpleados = async (page = 1) => {
  const { data } = await sutepaApi.get(`/empleados?page=${page}`)
  return data
}

export const searchEmpleado = async (search, page = 1) => {
  const { data } = await sutepaApi.get(`/empleados?search=${search}&page=${page}`)
  return data
}

export const getEmpleadoById = async (id) => {
  const { data } = await sutepaApi.get(`/empleados/${id}`)
  return data
}

export const createEmpleado = async (payload) => {
  const { data } = await sutepaApi.post('/empleados', payload)
  return data
}

export const updateEmpleado = async (id, payload) => {
  const { data } = await sutepaApi.put(`/empleados/${id}`, payload)
  return data
}

export const deleteEmpleado = async (id) => {
  const { data } = await sutepaApi.delete(`/empleados/${id}`)
  return data
}
