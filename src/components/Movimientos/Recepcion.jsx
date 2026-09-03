import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCampanas } from '../../hooks/useDatabase.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { ArrowDownCircle, Check } from 'lucide-react'

export default function Recepcion() {
  const { perfil } = useAuth()
  const { campanas } = useCampanas()
  const [formData, setFormData] = useState({ producto: '', cantidad: '', donante: '', campana_id: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)
    try {
      const motivoStr = formData.donante ? 'Donante: ' + formData.donante : 'Donacion general'
      const { error: insertError } = await supabase.from('movimientos').insert({
        centro_id: perfil.centro_id,
        tipo: 'recepcion',
        producto: formData.producto,
        cantidad: parseInt(formData.cantidad),
        motivo: motivoStr,
        campana_id: formData.campana_id || null,
        usuario_id: perfil.id
      })
      if (insertError) throw insertError
      setSuccess(true)
      setFormData({ producto: '', cantidad: '', donante: '', campana_id: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Error al registrar recepcion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Recepcion</h1>
        </div>
        <p className="text-gray-500">Registra donaciones recibidas en el centro</p>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"><Check className="w-5 h-5" />Recepcion registrada exitosamente</div>}
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <input type="text" name="producto" value={formData.producto} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Ej: Aceite, Atun, Leche..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" min="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campana</label>
              <select name="campana_id" value={formData.campana_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Sin campana</option>
                {campanas.filter(c => c.activa).map(campana => (<option key={campana.id} value={campana.id}>{campana.nombre}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donante (opcional)</label>
            <input type="text" name="donante" value={formData.donante} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Nombre o Anonimo" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ArrowDownCircle className="w-5 h-5" />Registrar Recepcion</>}
          </button>
        </form>
      </div>
    </div>
  )
}