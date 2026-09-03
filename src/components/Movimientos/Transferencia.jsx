import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCentros } from '../../hooks/useDatabase.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { ArrowLeftRight, Check } from 'lucide-react'

export default function Transferencia() {
  const { perfil } = useAuth()
  const { centros } = useCentros()
  const [inventario, setInventario] = useState([])
  const [formData, setFormData] = useState({ producto: '', cantidad: '', centro_destino_id: '', notas: '' })
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
      setInventario(Object.entries(inventarioMap).map(([producto, stock]) => ({ producto, stock: Math.max(0, stock) })).filter(i => i.stock > 0))
    }
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)
    if (formData.centro_destino_id === perfil.centro_id) {
      setError('No puedes transferir al mismo centro')
      setLoading(false)
      return
    }
    const stockDisponible = inventario.find(i => i.producto === formData.producto)?.stock || 0
    if (parseInt(formData.cantidad) > stockDisponible) {
      setError('Stock insuficiente. Disponible: ' + stockDisponible)
      setLoading(false)
      return
    }
    try {
      const { error: errorSalida } = await supabase.from('movimientos').insert({
        centro_id: perfil.centro_id, tipo: 'transferencia_salida', producto: formData.producto,
        cantidad: parseInt(formData.cantidad), destino_id: formData.centro_destino_id,
        motivo: formData.notas || 'Transferencia entre centros', usuario_id: perfil.id
      })
      if (errorSalida) throw errorSalida
      const { error: errorEntrada } = await supabase.from('movimientos').insert({
        centro_id: formData.centro_destino_id, tipo: 'transferencia_entrada', producto: formData.producto,
        cantidad: parseInt(formData.cantidad), destino_id: perfil.centro_id,
        motivo: formData.notas || 'Transferencia entre centros', usuario_id: perfil.id
      })
      if (errorEntrada) throw errorEntrada
      setSuccess(true)
      setFormData({ producto: '', cantidad: '', centro_destino_id: '', notas: '' })
      fetchInventario()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al registrar transferencia')
    } finally { setLoading(false) }
  }

  const otrosCentros = centros.filter(c => c.id !== perfil.centro_id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><ArrowLeftRight className="w-6 h-6 text-purple-600" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Transferencia entre Centros</h1>
        </div>
        <p className="text-gray-500">Mueve stock de un centro a otro</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5" />Transferencia registrada exitosamente</div>}
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <select name="producto" value={formData.producto} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
              <option value="">Seleccionar producto</option>
              {inventario.map(item => (<option key={item.producto} value={item.producto}>{item.producto} (Disponible: {item.stock})</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" min="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro Destino *</label>
              <select name="centro_destino_id" value={formData.centro_destino_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                <option value="">Seleccionar centro</option>
                {otrosCentros.map(centro => (<option key={centro.id} value={centro.id}>{centro.nombre}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea name="notas" value={formData.notas} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" rows="2" placeholder="Motivo de la transferencia..." />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ArrowLeftRight className="w-5 h-5" />Registrar Transferencia</>}
          </button>
        </form>
      </div>
    </div>
  )
}