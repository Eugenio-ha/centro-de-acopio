import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { History, Filter } from 'lucide-react'

const tipoLabels = {
  recepcion: 'Recepcion', entrega: 'Entrega', merma: 'Merma',
  transferencia_salida: 'Transfer. Salida', transferencia_entrada: 'Transfer. Entrada',
  ajuste_positivo: 'Ajuste +', ajuste_negativo: 'Ajuste -'
}

export default function HistorialMovimientos() {
  const { perfil } = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')

  useEffect(() => { fetchMovimientos() }, [perfil, filtroTipo])

  async function fetchMovimientos() {
    if (!perfil) return
    let query = supabase.from('movimientos').select('*, usuarios!movimientos_usuario_id_fkey(nombre)').order('created_at', { ascending: false })
    if (perfil.rol !== 'coordinador' && perfil.centro_id) {
      query = query.eq('centro_id', perfil.centro_id)
    }
    if (filtroTipo) {
      query = query.eq('tipo', filtroTipo)
    }
    const { data } = await query.limit(100)
    if (data) setMovimientos(data)
    setLoading(false)
  }

  function getMovColor(tipo) {
    return ['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(tipo) ? 'text-green-600' : 'text-red-600'
  }

  function getMovPrefix(tipo) {
    return ['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(tipo) ? '+' : '-'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
        <p className="text-gray-500">Registro completo de entradas, salidas y ajustes</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm">
            <option value="">Todos los tipos</option>
            <option value="recepcion">Recepcion</option>
            <option value="entrega">Entrega</option>
            <option value="merma">Merma</option>
            <option value="transferencia_salida">Transferencia Salida</option>
            <option value="transferencia_entrada">Transferencia Entrada</option>
            <option value="ajuste_positivo">Ajuste Positivo</option>
            <option value="ajuste_negativo">Ajuste Negativo</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {movimientos.length === 0 ? (
          <div className="text-center py-12"><History className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay movimientos registrados</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Producto</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Cantidad</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(mov.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{tipoLabels[mov.tipo]}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{mov.producto}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={'font-semibold ' + getMovColor(mov.tipo)}>
                        {getMovPrefix(mov.tipo)}{mov.cantidad}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{mov.usuarios?.nombre || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-[200px] truncate">{mov.motivo || '-'}</td>
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
