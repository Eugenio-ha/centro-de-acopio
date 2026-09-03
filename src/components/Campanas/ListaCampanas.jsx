import { useState } from 'react'
import { useCampañas } from '../../hooks/useDatabase.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Megaphone, Plus, Calendar, X, Check, Power, Edit2 } from 'lucide-react'

export default function ListaCampanas() {
  const { campañas, loading, crearCampaña, refetch } = useCampañas()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function startEdit(campaña) {
    setEditingId(campaña.id)
    setFormData({
      nombre: campaña.nombre,
      descripcion: campaña.descripcion || '',
      fecha_inicio: campaña.fecha_inicio,
      fecha_fin: campaña.fecha_fin || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoadingCreate(true)
    try {
      if (editingId) {
        await supabase.from('campanas').update({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin || null
        }).eq('id', editingId)
      } else {
        await crearCampaña({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin || null,
          activa: true
        })
      }
      setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })
      setShowForm(false)
      setEditingId(null)
      refetch()
    } catch (err) {
      setError(err.message || 'Error al guardar campaña')
    } finally {
      setLoadingCreate(false)
    }
  }

  async function toggleActiva(campaña) {
    await supabase.from('campanas').update({ activa: !campaña.activa }).eq('id', campaña.id)
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-500">{campañas.length} campañas registradas</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' }) }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nueva Campaña'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Editar Campaña' : 'Crear Campaña'}</h3>
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Campaña de Acopio Navideña"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                rows="2"
                placeholder="Descripcion de la campaña..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loadingCreate}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingCreate ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingId ? 'Guardar Cambios' : 'Crear Campaña'}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campañas.map(campaña => (
          <div key={campaña.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(campaña)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActiva(campaña)} className={campaña.activa ? 'bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1' : 'bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1'}>
                  <Power className="w-3 h-3" />
                  {campaña.activa ? 'Activa' : 'Inactiva'}
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaña.nombre}</h3>
            {campaña.descripcion && (
              <p className="text-sm text-gray-500 mb-3">{campaña.descripcion}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(campaña.fecha_inicio).toLocaleDateString()}</span>
              {campaña.fecha_fin && (
                <>
                  <span>-</span>
                  <span>{new Date(campaña.fecha_fin).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
