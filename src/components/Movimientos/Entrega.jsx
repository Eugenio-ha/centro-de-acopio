import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { ArrowUpCircle, Check } from 'lucide-react'

export default function Entrega() {
  const { perfil } = useAuth()
  const [instituciones, setInstituciones] = useState([])
  const [inventario, setInventario] = useState([])
  const [formData, setFormData] = useState({ producto: '', cantidad: '', institucion_id: '', notas: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchInstituciones(); fetchInventario() }, [perfil])

  async function fetchInstituciones() {
    if (!perfil) return
    const { data } = await supabase.from('usuarios').select('*').eq('rol', 'institucion')
    setInstituciones(data || [])
  }

  async function fetchInventario() {
    if (!perfil?.centro_id) return
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
    if (!perfil.centro_id) {
      setError('No tienes un centro asignado. Contacta al coordinador.')
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
      const { error: insertError } = await supabase.from('movimientos').insert({
        centro_id: perfil.centro_id, tipo: 'entrega', producto: formData.producto,
        cantidad: parseInt(formData.cantidad), destino_id: formData.institucion_id || null,
        motivo: formData.notas || 'Entrega a institucion', usuario_id: perfil.id
      })
      if (insertError) throw insertError
      setSuccess(true)
      setFormData({ producto: '', cantidad: '', institucion_id: '', notas: '' })
      fetchInventario()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al registrar entrega')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><ArrowUpCircle className="w-6 h-6 text-orange-600" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Entrega</h1>
        </div>
        <p className="text-gray-500">Canaliza donaciones a instituciones receptoras</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5" />Entrega registrada exitosamente</div>}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Institucion Receptora</label>
              <select name="institucion_id" value={formData.institucion_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Seleccionar institucion</option>
                {instituciones.map(inst => (<option key={inst.id} value={inst.id}>{inst.nombre}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea name="notas" value={formData.notas} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" rows="2" placeholder="Detalles de la entrega..." />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ArrowUpCircle className="w-5 h-5" />Registrar Entrega</>}
          </button>
        </form>
      </div>
    </div>
  )
}