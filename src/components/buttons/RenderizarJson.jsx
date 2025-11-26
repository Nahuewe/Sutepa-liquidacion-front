import { formatearFechaArgentina } from '@/constant/datos-id'

export const renderizarJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString)

    const filtrarClaves = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        const copia = { ...obj }
        delete copia.id
        delete copia.created_at
        delete copia.updated_at
        delete copia.deleted_at
        delete copia.seccional_id
        delete copia.roles_id
        return copia
      }
      return obj
    }

    const formatearValor = (key, value) => {
      if (key === 'activa_hasta' && value) {
        return formatearFechaArgentina(value)
      }
      return value
    }

    const renderizarValor = (value) => {
      if (Array.isArray(value)) {
        return (
          <ul className='list-disc list-inside ml-4'>
            {value.map((item, idx) => (
              <li key={idx}>
                {typeof item === 'object' && item !== null
                  ? renderizarObjeto(item)
                  : String(item)}
              </li>
            ))}
          </ul>
        )
      }

      if (typeof value === 'object' && value !== null) {
        return renderizarObjeto(value)
      }

      return String(value)
    }

    const renderizarObjeto = (obj) => {
      const objetoFiltrado = filtrarClaves(obj)
      return (
        <div className='ml-4 border-l-2 border-gray-300 pl-2'>
          {Object.entries(objetoFiltrado).map(([key, value]) => (
            <div key={key} className='mb-1'>
              <strong>{key}:</strong> {renderizarValor(formatearValor(key, value))}
            </div>
          ))}
        </div>
      )
    }

    if (Array.isArray(parsed)) {
      return parsed.length
        ? (
          <ul className='list-disc list-inside'>
            {parsed.map((item, idx) => {
              const itemFiltrado = filtrarClaves(item)
              return (
                <li key={idx}>
                  {Object.entries(itemFiltrado).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {renderizarValor(formatearValor(key, value))}
                    </div>
                  ))}
                </li>
              )
            })}
          </ul>
          )
        : (
          <span className='italic text-gray-500'>Sin datos</span>
          )
    }

    const objetoFiltrado = filtrarClaves(parsed)
    return Object.entries(objetoFiltrado).length
      ? (
        <ul className='list-disc list-inside'>
          {Object.entries(objetoFiltrado).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {renderizarValor(formatearValor(key, value))}
            </li>
          ))}
        </ul>
        )
      : (
        <span className='italic text-gray-500'>Sin datos</span>
        )
  } catch (e) {
    return <span className='italic text-red-500'>Error de formato</span>
  }
}
