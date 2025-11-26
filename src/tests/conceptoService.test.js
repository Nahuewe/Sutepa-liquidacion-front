import { vi, describe, test, afterEach, expect } from 'vitest'
import { sutepaApi } from '@/api'

import {
  getConceptos,
  searchConcepto,
  getConceptoById,
  createConcepto,
  updateConcepto,
  deleteConcepto
} from '@/services/conceptoService'

vi.mock('@/api')

describe('Servicios de conceptos', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getConceptos obtiene conceptos paginados', async () => {
    const mock = { data: [{ id: 1 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)

    const res = await getConceptos(2)

    expect(sutepaApi.get).toHaveBeenCalledWith('/conceptos?page=2')
    expect(res).toEqual(mock.data)
  })

  test('searchConcepto busca conceptos', async () => {
    const mock = { data: [{ id: 5 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)

    const res = await searchConcepto('aporte', 3)

    expect(sutepaApi.get).toHaveBeenCalledWith('/conceptos?search=aporte&page=3')
    expect(res).toEqual(mock.data)
  })

  test('getConceptoById obtiene un concepto por ID', async () => {
    const mock = { data: { id: 9 } }
    sutepaApi.get.mockResolvedValueOnce(mock)

    const res = await getConceptoById(9)

    expect(sutepaApi.get).toHaveBeenCalledWith('/conceptos/9')
    expect(res).toEqual(mock.data)
  })

  test('createConcepto crea un concepto', async () => {
    const payload = { codigo: 'AFP', descripcion: 'Aporte' }
    const mock = { data: { creado: true } }
    sutepaApi.post.mockResolvedValueOnce(mock)

    const res = await createConcepto(payload)

    expect(sutepaApi.post).toHaveBeenCalledWith('/conceptos', payload)
    expect(res).toEqual(mock.data)
  })

  test('updateConcepto actualiza un concepto', async () => {
    const payload = { descripcion: 'Modificado' }
    const mock = { data: { actualizado: true } }
    sutepaApi.put.mockResolvedValueOnce(mock)

    const res = await updateConcepto(4, payload)

    expect(sutepaApi.put).toHaveBeenCalledWith('/conceptos/4', payload)
    expect(res).toEqual(mock.data)
  })

  test('deleteConcepto elimina un concepto', async () => {
    const mock = { data: { eliminado: true } }
    sutepaApi.delete.mockResolvedValueOnce(mock)

    const res = await deleteConcepto(7)

    expect(sutepaApi.delete).toHaveBeenCalledWith('/conceptos/7')
    expect(res).toEqual(mock.data)
  })
})

// --- Tests de errores ---

describe('Errores en servicios de conceptos', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getConceptos lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getConceptos'))
    await expect(getConceptos()).rejects.toThrow('Falló getConceptos')
  })

  test('searchConcepto lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló searchConcepto'))
    await expect(searchConcepto('x')).rejects.toThrow('Falló searchConcepto')
  })

  test('getConceptoById lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getConceptoById'))
    await expect(getConceptoById(1)).rejects.toThrow('Falló getConceptoById')
  })

  test('createConcepto lanza error', async () => {
    sutepaApi.post.mockRejectedValueOnce(new Error('Falló createConcepto'))
    await expect(createConcepto({})).rejects.toThrow('Falló createConcepto')
  })

  test('updateConcepto lanza error', async () => {
    sutepaApi.put.mockRejectedValueOnce(new Error('Falló updateConcepto'))
    await expect(updateConcepto(1, {})).rejects.toThrow('Falló updateConcepto')
  })

  test('deleteConcepto lanza error', async () => {
    sutepaApi.delete.mockRejectedValueOnce(new Error('Falló deleteConcepto'))
    await expect(deleteConcepto(1)).rejects.toThrow('Falló deleteConcepto')
  })
})
