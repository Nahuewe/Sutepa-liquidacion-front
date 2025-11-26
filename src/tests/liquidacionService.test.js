import { vi, describe, test, afterEach, expect } from 'vitest'
import { sutepaApi } from '@/api'
import {
  getLiquidaciones,
  searchLiquidaciones,
  getLiquidacionById,
  createLiquidacion,
  updateLiquidacion,
  deleteLiquidacion,
  marcarPagada,
  exportarLiquidaciones
} from '@/services/liquidacionService'

vi.mock('@/api')

describe('Servicios de liquidaciones', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getLiquidaciones obtiene liquidaciones paginadas', async () => {
    const mock = { data: [{ id: 1 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await getLiquidaciones(3)
    expect(sutepaApi.get).toHaveBeenCalledWith('/liquidaciones?page=3')
    expect(res).toEqual(mock.data)
  })

  test('searchLiquidaciones busca liquidaciones', async () => {
    const mock = { data: [{ id: 9 }] }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await searchLiquidaciones('coso', 2)
    expect(sutepaApi.get).toHaveBeenCalledWith('/liquidaciones?search=coso&page=2')
    expect(res).toEqual(mock.data)
  })

  test('getLiquidacionById obtiene una liquidacion por ID', async () => {
    const mock = { data: { id: 10 } }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await getLiquidacionById(10)
    expect(sutepaApi.get).toHaveBeenCalledWith('/liquidaciones/10')
    expect(res).toEqual(mock.data)
  })

  test('createLiquidacion crea una nueva liquidación', async () => {
    const payload = { empleado_id: 5 }
    const mock = { data: { success: true } }
    sutepaApi.post.mockResolvedValueOnce(mock)
    const res = await createLiquidacion(payload)
    expect(sutepaApi.post).toHaveBeenCalledWith('/liquidaciones', payload)
    expect(res).toEqual(mock.data)
  })

  test('updateLiquidacion actualiza una liquidación', async () => {
    const payload = { total: 999 }
    const mock = { data: { ok: true } }
    sutepaApi.put.mockResolvedValueOnce(mock)
    const res = await updateLiquidacion(7, payload)
    expect(sutepaApi.put).toHaveBeenCalledWith('/liquidaciones/7', payload)
    expect(res).toEqual(mock.data)
  })

  test('deleteLiquidacion elimina una liquidación', async () => {
    const mock = { data: { eliminado: true } }
    sutepaApi.delete.mockResolvedValueOnce(mock)
    const res = await deleteLiquidacion(4)
    expect(sutepaApi.delete).toHaveBeenCalledWith('/liquidaciones/4')
    expect(res).toEqual(mock.data)
  })

  test('marcarPagada marca una liquidación como pagada', async () => {
    const mock = { data: { pagada: true } }
    sutepaApi.post.mockResolvedValueOnce(mock)
    const res = await marcarPagada(12)
    expect(sutepaApi.post).toHaveBeenCalledWith('/liquidaciones/12/pagar')
    expect(res).toEqual(mock.data)
  })

  test('exportarLiquidaciones exporta archivo Excel/Blob', async () => {
    const mock = { data: new Blob(['excel']) }
    sutepaApi.get.mockResolvedValueOnce(mock)
    const res = await exportarLiquidaciones()
    expect(sutepaApi.get).toHaveBeenCalledWith('/liquidaciones/export', {
      responseType: 'blob'
    })
    expect(res).toBeInstanceOf(Blob)
  })
})

// --- Tests de errores ---

describe('Errores en servicios de liquidaciones', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('getLiquidaciones lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getLiquidaciones'))
    await expect(getLiquidaciones()).rejects.toThrow('Falló getLiquidaciones')
  })

  test('searchLiquidaciones lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló searchLiquidaciones'))
    await expect(searchLiquidaciones('x')).rejects.toThrow('Falló searchLiquidaciones')
  })

  test('getLiquidacionById lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló getLiquidacionById'))
    await expect(getLiquidacionById(1)).rejects.toThrow('Falló getLiquidacionById')
  })

  test('createLiquidacion lanza error', async () => {
    sutepaApi.post.mockRejectedValueOnce(new Error('Falló createLiquidacion'))
    await expect(createLiquidacion({})).rejects.toThrow('Falló createLiquidacion')
  })

  test('updateLiquidacion lanza error', async () => {
    sutepaApi.put.mockRejectedValueOnce(new Error('Falló updateLiquidacion'))
    await expect(updateLiquidacion(1, {})).rejects.toThrow('Falló updateLiquidacion')
  })

  test('deleteLiquidacion lanza error', async () => {
    sutepaApi.delete.mockRejectedValueOnce(new Error('Falló deleteLiquidacion'))
    await expect(deleteLiquidacion(1)).rejects.toThrow('Falló deleteLiquidacion')
  })

  test('marcarPagada lanza error', async () => {
    sutepaApi.post.mockRejectedValueOnce(new Error('Falló marcarPagada'))
    await expect(marcarPagada(1)).rejects.toThrow('Falló marcarPagada')
  })

  test('exportarLiquidaciones lanza error', async () => {
    sutepaApi.get.mockRejectedValueOnce(new Error('Falló exportarLiquidaciones'))
    await expect(exportarLiquidaciones()).rejects.toThrow('Falló exportarLiquidaciones')
  })
})
