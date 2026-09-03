import { useState } from 'react'
import { useCentros } from '../../hooks/useDatabase.jsx'
import { supabase } from '../../utils/supabase.jsx'
import { Building2, Plus, MapPin, Power } from 'lucide-react'
import FormCentro from './FormCentro.jsx'

export default function ListaCentros() {
  const { centros, loading, refetch } = useCentros()
  const [showForm, setShowForm] = useState(false)

  async function toggleActivo(centro) {
    await supabase.from('centros').update({ activo: !centro.activo }).eq('id', centro.id)
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
          <h1 className="text-2xl font-bold text-gray-900">Centros de Acopio</h1>
          <p className="text-gray-500">{centros.length} centros registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Centro
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <FormCentro onClose={() => { setShowForm(false); refetch() }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centros.map(centro => (
          <div key={centro.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <button onClick={() => toggleActivo(centro)} className={centro.activo ? 'bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1' : 'bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1'}>
                <Power className="w-3 h-3" />
                {centro.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{centro.nombre}</h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{centro.direccion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
