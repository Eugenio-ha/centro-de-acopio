import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase.jsx'
import { Building2, Package, TrendingUp, TrendingDown, AlertTriangle, ArrowLeftRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CoordinadorDashboard() {
  const [stats, setStats] = useState({ totalCentros: 0, totalInventario: 0, recepciones: 0, entregas: 0, mermas: 0, transferencias: 0 })
  const [movimientosRecientes, setMovimientosRecientes] = useState([])
  const [datosGrafica, setDatosGrafica] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  async function fetchDashboard() {
    const [centros, movimientos] = await Promise.all([
      supabase.from('centros').select('*'),
      supabase.from('movimientos').select('*').order('created_at', { ascending: false })
    ])
    const movs = movimientos.data || []
    const centrosList = centros.data || []
    const totalInventario = movs.reduce((acc, mov) => {
      if (['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(mov.tipo)) return acc + mov.cantidad
      if (['entrega', 'merma', 'transferencia_salida', 'ajuste_negativo'].includes(mov.tipo)) return acc - mov.cantidad
      return acc
    }, 0)
    setStats({
      totalCentros: centrosList.length,
      totalInventario: Math.max(0, totalInventario),
      recepciones: movs.filter(m => m.tipo === 'recepcion').length,
      entregas: movs.filter(m => m.tipo === 'entrega').length,
      mermas: movs.filter(m => m.tipo === 'merma').length,
      transferencias: movs.filter(m => m.tipo.includes('transferencia')).length
    })
    setMovimientosRecientes(movs.slice(0, 5))
    const porProducto = {}
    movs.forEach(mov => {
      if (!porProducto[mov.producto]) porProducto[mov.producto] = { nombre: mov.producto, entradas: 0, salidas: 0 }
      if (['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(mov.tipo)) porProducto[mov.producto].entradas += mov.cantidad
      else porProducto[mov.producto].salidas += mov.cantidad
    })
    setDatosGrafica(Object.values(porProducto))
    setLoading(false)
  }

  const statCards = [
    { label: 'Centros Activos', value: stats.totalCentros, icon: Building2, color: 'bg-blue-500' },
    { label: 'Inventario Total', value: stats.totalInventario, icon: Package, color: 'bg-emerald-500' },
    { label: 'Recepciones', value: stats.recepciones, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Entregas', value: stats.entregas, icon: TrendingDown, color: 'bg-orange-500' },
    { label: 'Mermas', value: stats.mermas, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Transferencias', value: stats.transferencias, icon: ArrowLeftRight, color: 'bg-purple-500' },
  ]

  const tipoLabels = {
    recepcion: 'Recepcion', entrega: 'Entrega', merma: 'Merma',
    transferencia_salida: 'Transferencia Salida', transferencia_entrada: 'Transferencia Entrada',
    ajuste_positivo: 'Ajuste +', ajuste_negativo: 'Ajuste -'
  }

  function getStatColor(color) {
    return 'w-12 h-12 rounded-xl flex items-center justify-center ' + color
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard del Coordinador</h1>
        <p className="text-gray-500">Vista general del sistema de centros de acopio</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={getStatColor(stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos por Producto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="salidas" fill="#f97316" name="Salidas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos Recientes</h3>
          <div className="space-y-3">
            {movimientosRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay movimientos registrados</p>
            ) : (
              movimientosRecientes.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{mov.producto}</p>
                    <p className="text-sm text-gray-500">{tipoLabels[mov.tipo]}</p>
                  </div>
                  <div className="text-right">
                    <p className={'font-semibold ' + getMovColor(mov.tipo)}>
                      {getMovPrefix(mov.tipo)}{mov.cantidad}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(mov.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}