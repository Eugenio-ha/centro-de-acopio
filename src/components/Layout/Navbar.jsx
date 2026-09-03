import { useAuth } from '../../hooks/useAuth.jsx'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { perfil, logout } = useAuth()

  const rolLabels = {
    coordinador: 'Coordinador General',
    encargado: 'Encargado de Centro',
    voluntario: 'Voluntario',
    institucion: 'Institucion Receptora'
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">CA</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Centro de Acopio</h1>
            <p className="text-xs text-gray-500">Sistema de Coordinacion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{perfil?.nombre}</p>
            <p className="text-xs text-gray-500">{rolLabels[perfil?.rol]}</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
