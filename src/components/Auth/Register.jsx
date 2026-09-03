import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCentros } from '../../hooks/useDatabase.jsx'
import { UserPlus, Mail, Lock, User, Building2 } from 'lucide-react'

export default function Register({ onToggle }) {
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', rol: 'voluntario', centro_id: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { centros } = useCentros()

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await register(formData.email, formData.password, formData.nombre, formData.rol, formData.centro_id || null) }
    catch (err) { setError(err.message || 'Error al registrar') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-2xl">CA</span></div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Acopio</h1>
          <p className="text-gray-500 mt-1">Sistema de Coordinacion</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Crear Cuenta</h2>
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" placeholder="Juan Perez" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" placeholder="tu@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" placeholder="Minimo 6 caracteres" minLength={6} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select name="rol" value={formData.rol} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors">
                <option value="voluntario">Voluntario</option>
                <option value="encargado">Encargado de Centro</option>
                <option value="coordinador">Coordinador General</option>
                <option value="institucion">Institucion Receptora</option>
              </select>
            </div>
            {(formData.rol === 'encargado' || formData.rol === 'voluntario') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Acopio</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select name="centro_id" value={formData.centro_id} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors" required>
                    <option value="">Seleccionar centro</option>
                    {centros.map(centro => (<option key={centro.id} value={centro.id}>{centro.nombre}</option>))}
                  </select>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5" />Crear Cuenta</>}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Ya tienes cuenta? <button onClick={onToggle} className="text-emerald-600 font-medium hover:text-emerald-700">Iniciar Sesion</button></p>
          </div>
        </div>
      </div>
    </div>
  )
}