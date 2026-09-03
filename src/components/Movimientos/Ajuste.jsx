import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Settings, Check } from 'lucide-react'

export default function Ajuste() {
  const { perfil } = useAuth()
  const [inventario, setInventario] = useState([])
  const [formData, setFormData] = useState({ producto: '', cantidad: '', tipo: 'ajuste_positivo', motivo: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchInventario() }, [perfil])

  async function fetchInventario() {
    if (!perfil) return
    const { data: movimientos } = await supabase.from('movimientos').select('*').eq('centro_id', perfil.centro_id)
    if (movimientos) {
      const inventarioMap = {}
      movimientos.forEach(mov => {
        if (!inventarioMap[mov.producto]) inventarioMap[mov.producto] = 0
        if (['recepcion', 'transferencia_entrada', 'ajuste_positivo'].includes(mov.tipo)) inventarioMap[mov.producto] += mov.cantidad
        else inventarioMap[mov.producto] -= mov.cantidad
      })
      setInventario(Object.entries(inventarioMap).map(([producto, stock]) => ({ producto, stock: Math.max(0, stock) })))
    }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)
    if (!formData.motivo.trim()) {
      setError('El motivo es obligatorio para ajustes de stock')
      setLoading(false)
      return
    }
    if (formData.tipo === 'ajuste_negativo') {
      const stockDisponible = inventario.find(i => i.producto === formData.producto)?.stock || 0
      if (parseInt(formData.cantidad) > stockDisponible) {
        setError('Stock insuficiente para ajuste negativo. Disponible: ' + stockDisponible)
        setLoading(false)
        return
      }
    }
    try {
      const { error: insertError } = await supabase.from('movimientos').insert({
        centro_id: perfil.centro_id, tipo: formData.tipo, producto: formData.producto,
        cantidad: parseInt(formData.cantidad), motivo: formData.motivo, usuario_id: perfil.id
      })
      if (insertError) throw insertError
      setSuccess(true)
      setFormData({ producto: '', cantidad: '', tipo: 'ajuste_positivo', motivo: '' })
      fetchInventario()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al registrar ajuste')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Settings className="w-6 h-6 text-gray-600" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Ajuste de Stock</h1>
        </div>
        <p className="text-gray-500">Corrige inventario con un motivo justificado</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5" />Ajuste registrado exitosamente</div>}
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ajuste *</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option value="ajuste_positivo">Ajuste Positivo (Agregar)</option>
              <option value="ajuste_negativo">Ajuste Negativo (Restar)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <select name="producto" value={formData.producto} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              <option value="">Seleccionar producto</option>
              {inventario.map(item => (<option key={item.producto} value={item.producto}>{item.producto} (Actual: {item.stock})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
            <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" min="1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo * (obligatorio)</label>
            <textarea name="motivo" value={formData.motivo} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" rows="3" placeholder="Justificacion del ajuste de stock..." required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Settings className="w-5 h-5" />Registrar Ajuste</>}
          </button>
        </form>
      </div>
    </div>
  )
}