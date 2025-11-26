import { vi, describe, test, afterEach, expect } from 'vitest'
import { sutepaApi } from '@/api'
import {
  getEmpleados,
  searchEmpleado,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
} from '@/services/empleadoService'

vi.mock('@/api')

describe('Servicios de empleados', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getEmpleados obtiene empleados paginados', async () => {
    const mock = { data: [{ id: 1 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await getEmpleados(3)
    expect(sutepaApi.get).toHaveBeenCalledWith('/empleados?page=3')
    expect(res).toEqual(mock.data)
  })

  test('searchEmpleado busca empleados', async () => {
    const mock = { data: [{ id: 7 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await searchEmpleado('juan', 2)
    expect(sutepaApi.get).toHaveBeenCalledWith('/empleados?search=juan&page=2')
    expect(res).toEqual(mock.data)
  })

  test('getEmpleadoById obtiene un empleado por ID', async () => {
    const mock = { data: { id: 5 } }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await getEmpleadoById(5)
    expect(sutepaApi.get).toHaveBeenCalledWith('/empleados/5')
    expect(res).toEqual(mock.data)
  })

  test('createEmpleado crea un nuevo empleado', async () => {
    const payload = { nombre: 'Carlos' }
    const mock = { data: { creado: true } }
    sutepaApi.post.mockResolvedValueOnce(mock)
    const res = await createEmpleado(payload)
    expect(sutepaApi.post).toHaveBeenCalledWith('/empleados', payload)
    expect(res).toEqual(mock.data)
  })

  test('updateEmpleado actualiza un empleado', async () => {
    const payload = { apellido: 'Gomez' }
    const mock = { data: { actualizado: true } }
    sutepaApi.put.mockResolvedValueOnce(mock)
    const res = await updateEmpleado(9, payload)
    expect(sutepaApi.put).toHaveBeenCalledWith('/empleados/9', payload)
    expect(res).toEqual(mock.data)
  })

  test('deleteEmpleado elimina un empleado', async () => {
    const mock = { data: { eliminado: true } }
    sutepaApi.delete.mockResolvedValueOnce(mock)
    const res = await deleteEmpleado(4)
    expect(sutepaApi.delete).toHaveBeenCalledWith('/empleados/4')
    expect(res).toEqual(mock.data)
  })
})

// --- Tests de errores ---

describe('Errores en servicios de empleados', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getEmpleados lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getEmpleados'))
    await expect(getEmpleados()).rejects.toThrow('Falló getEmpleados')
  })

  test('searchEmpleado lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló searchEmpleado'))
    await expect(searchEmpleado('x')).rejects.toThrow('Falló searchEmpleado')
  })

  test('getEmpleadoById lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getEmpleadoById'))
    await expect(getEmpleadoById(1)).rejects.toThrow('Falló getEmpleadoById')
  })

  test('createEmpleado lanza error', async () => {
    sutepaApi.post.mockRejectedValueOnce(new Error('Falló createEmpleado'))
    await expect(createEmpleado({})).rejects.toThrow('Falló createEmpleado')
  })

  test('updateEmpleado lanza error', async () => {
    sutepaApi.put.mockRejectedValueOnce(new Error('Falló updateEmpleado'))
    await expect(updateEmpleado(1, {})).rejects.toThrow('Falló updateEmpleado')
  })

  test('deleteEmpleado lanza error', async () => {
    sutepaApi.delete.mockRejectedValueOnce(new Error('Falló deleteEmpleado'))
    await expect(deleteEmpleado(1)).rejects.toThrow('Falló deleteEmpleado')
  })
})
