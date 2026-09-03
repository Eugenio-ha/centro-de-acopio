import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Building2, Package, Check, Clock } from 'lucide-react'

export default function InstitucionDashboard() {
  const { perfil } = useAuth()
  const [entregas, setEntregas] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, confirmadas: 0, pendientes: 0 })

  useEffect(() => {
    if (perfil) fetchEntregas()
  }, [perfil])

  async function fetchEntregas() {
    if (!perfil) return
    const { data: movimientos } = await supabase
      .from('movimientos')
      .select('*, usuarios!movimientos_usuario_id_fkey(nombre), centros!movimientos_centro_id_fkey(nombre)')
      .eq('tipo', 'entrega')
      .eq('destino_id', perfil.id)
      .order('created_at', { ascending: false })

    if (movimientos) {
      setEntregas(movimientos)
      const confirmadas = movimientos.filter(m => m.motivo && m.motivo.includes('Confirmada')).length
      setStats({
        total: movimientos.length,
        confirmadas,
        pendientes: movimientos.length - confirmadas
      })
    }
    setLoading(false)
  }

  async function confirmarRecepcion(movId) {
    await supabase.from('movimientos').update({ motivo: 'Confirmada por institucion receptora' }).eq('id', movId)
    fetchEntregas()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Entregas Recibidas</h1>
        <p className="text-gray-500">Entregas canalizadas hacia esta institucion</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Entregas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmadas}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendientes}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Entregas</h3>
        {entregas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay entregas registradas para esta institucion</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Producto</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Cantidad</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Centro Origen</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Accion</th>
                </tr>
              </thead>
              <tbody>
                {entregas.map((mov) => {
                  const confirmada = mov.motivo && mov.motivo.includes('Confirmada')
                  return (
                    <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(mov.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{mov.producto}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{mov.cantidad}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{mov.centros?.nombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={confirmada ? 'bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium' : 'bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium'}>
                          {confirmada ? 'Confirmada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!confirmada && (
                          <button onClick={() => confirmarRecepcion(mov.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                            Confirmar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
