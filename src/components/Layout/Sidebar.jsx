import { useAuth } from '../../hooks/useAuth.jsx'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertTriangle, 
  ArrowLeftRight,
  Settings,
  Building2,
  Megaphone,
  History,
  Truck
} from 'lucide-react'

export default function Sidebar() {
  const { perfil } = useAuth()
  const rol = perfil?.rol

  const coordinatorLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/centros', icon: Building2, label: 'Centros' },
    { to: '/campanas', icon: Megaphone, label: 'Campañas' },
    { to: '/inventario', icon: Package, label: 'Inventario Global' },
    { to: '/historial', icon: History, label: 'Historial' },
  ]

  const centerLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventario', icon: Package, label: 'Mi Inventario' },
    { to: '/recepcion', icon: ArrowDownCircle, label: 'Recepcion' },
    { to: '/entrega', icon: ArrowUpCircle, label: 'Entrega' },
    { to: '/merma', icon: AlertTriangle, label: 'Merma' },
    { to: '/transferencia', icon: ArrowLeftRight, label: 'Transferencia' },
    { to: '/ajuste', icon: Settings, label: 'Ajuste Stock' },
    { to: '/historial', icon: History, label: 'Historial' },
  ]

  const volunteerLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventario', icon: Package, label: 'Inventario' },
    { to: '/recepcion', icon: ArrowDownCircle, label: 'Recepcion' },
    { to: '/entrega', icon: ArrowUpCircle, label: 'Entrega' },
    { to: '/historial', icon: History, label: 'Historial' },
  ]

  const institutionLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Mis Entregas' },
  ]

  const links = rol === 'coordinador' ? coordinatorLinks : 
                rol === 'voluntario' ? volunteerLinks :
                rol === 'institucion' ? institutionLinks : centerLinks

  function getClassName({ isActive }) {
    return 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ' +
      (isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={getClassName}>
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
