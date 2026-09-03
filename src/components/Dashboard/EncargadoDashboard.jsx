import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

export default function EncargadoDashboard() {
  const { perfil } = useAuth()
  const [inventario, setInventario] = useState([])
  const [stats, setStats] = useState({ total: 0, recepciones: 0, entregas: 0, mermas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (perfil?.centro_id) fetchInventario()
  }, [perfil])

  async function fetchInventario() {
    if (!perfil?.centro_id) { setLoading(false); return }
    const { data: movimientos } = await supabase
      .from('movimientos').select('*').eq('centro_id', perfil.centro_id).order('created_at', { ascending: false })
    if (movimientos) {
      const inventarioMap = {}
      let totalGeneral = 0, recepciones = 0, entregas = 0, mermas = 0
      movimientos.forEach(mov => {
        if (!inventarioMap[mov.producto]) inventarioMap[mov.producto] = { producto: mov.producto, stock: 0 }
        if (['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(mov.tipo)) {
          inventarioMap[mov.producto].stock += mov.cantidad
          totalGeneral += mov.cantidad
          if (mov.tipo === 'recepcion') recepciones += mov.cantidad
        } else {
          inventarioMap[mov.producto].stock -= mov.cantidad
          totalGeneral -= mov.cantidad
          if (mov.tipo === 'entrega') entregas += mov.cantidad
          if (mov.tipo === 'merma') mermas += mov.cantidad
        }
      })
      setInventario(Object.values(inventarioMap).filter(i => i.stock > 0))
      setStats({ total: Math.max(0, totalGeneral), recepciones, entregas, mermas })
    }
    setLoading(false)
  }

  if (!perfil?.centro_id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin centro asignado</h2>
        <p className="text-gray-500">No tienes un centro de acopio asignado. Contacta al coordinador.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Centro de Acopio</h1>
        <p className="text-gray-500">Inventario y movimientos de tu centro</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inventario Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recepciones</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.recepciones}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Entregas</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.entregas}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mermas</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.mermas}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario Actual</h3>
        {inventario.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay productos en inventario</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Producto</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item) => (
                  <tr key={item.producto} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{item.producto}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                        {item.stock}
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