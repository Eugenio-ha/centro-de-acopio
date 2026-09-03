import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCampañas } from '../../hooks/useDatabase.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Package, Download, Filter } from 'lucide-react'

export default function ListaInventario() {
  const { perfil } = useAuth()
  const { campañas } = useCampañas()
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroCampana, setFiltroCampana] = useState('')

  useEffect(() => { fetchInventario() }, [perfil, filtroCampana])

  async function fetchInventario() {
    if (!perfil) return
    let query = supabase.from('movimientos').select('*')
    if (perfil.rol !== 'coordinador' && perfil.centro_id) {
      query = query.eq('centro_id', perfil.centro_id)
    }
    if (filtroCampana) {
      query = query.eq('campana_id', filtroCampana)
    }
    const { data: movimientos } = await query
    if (movimientos) {
      const inventarioMap = {}
      movimientos.forEach(mov => {
        const key = perfil.rol === 'coordinador' ? mov.centro_id + '-' + mov.producto : mov.producto
        if (!inventarioMap[key]) inventarioMap[key] = { producto: mov.producto, centro_id: mov.centro_id, stock: 0 }
        if (['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(mov.tipo)) inventarioMap[key].stock += mov.cantidad
        else inventarioMap[key].stock -= mov.cantidad
      })
      const inventarioFinal = Object.values(inventarioMap).map(item => ({ ...item, stock: Math.max(0, item.stock) })).filter(item => item.stock > 0).sort((a, b) => a.producto.localeCompare(b.producto))
      setInventario(inventarioFinal)
    }
    setLoading(false)
  }

  function exportarCSV() {
    const headers = ['Producto', 'Stock']
    const rows = inventario.map(item => [item.producto, item.stock])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventario.csv'
    a.click()
  }

  function getStatusClass(stock) {
    if (stock > 10) return 'bg-green-100 text-green-800'
    if (stock > 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  function getStatusText(stock) {
    if (stock > 10) return 'Suficiente'
    if (stock > 5) return 'Bajo'
    return 'Critico'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{perfil.rol === 'coordinador' ? 'Inventario Global' : 'Mi Inventario'}</h1>
          <p className="text-gray-500">Productos disponibles en el centro</p>
        </div>
        <button onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />Exportar CSV
        </button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Filtrar por campaña:</label>
          <select
            value={filtroCampana}
            onChange={(e) => setFiltroCampana(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
          >
            <option value="">Todas las campañas</option>
            {campañas.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {inventario.length === 0 ? (
          <div className="text-center py-12"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay productos en inventario</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Producto</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-emerald-600" /></div>
                        <span className="font-medium text-gray-900">{item.producto}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right"><span className="text-lg font-semibold text-gray-900">{item.stock}</span></td>
                    <td className="py-3 px-4 text-center">
                      <span className={getStatusClass(item.stock) + ' inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'}>
                        {getStatusText(item.stock)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
