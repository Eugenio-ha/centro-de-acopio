import { useState } from 'react'
import { useCentros } from '../../hooks/useDatabase.jsx'
import { X, Check } from 'lucide-react'

export default function FormCentro({ onClose }) {
  const { crearCentro } = useCentros()
  const [formData, setFormData] = useState({ nombre: '', direccion: '', lat: '', lng: '', encargado_id: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await crearCentro({
        nombre: formData.nombre,
        direccion: formData.direccion,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        encargado_id: formData.encargado_id || null,
        activo: true
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear centro')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nuevo Centro de Acopio</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Centro de Acopio Principal" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Direccion *</label>
          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Calle, Numero, Colonia, Ciudad" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input type="number" name="lat" value={formData.lat} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" step="any" placeholder="19.4326" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input type="number" name="lng" value={formData.lng} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" step="any" placeholder="-99.1332" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" />Crear Centro</>}
          </button>
        </div>
      </form>
    </div>
  )
}