import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Navbar from './components/Layout/Navbar'
import Sidebar from './components/Layout/Sidebar'
import CoordinadorDashboard from './components/Dashboard/CoordinadorDashboard'
import EncargadoDashboard from './components/Dashboard/EncargadoDashboard'
import ListaCentros from './components/Centros/ListaCentros'
import ListaCampanas from './components/Campanas/ListaCampanas'
import ListaInventario from './components/Inventario/ListaInventario'
import Recepcion from './components/Movimientos/Recepcion'
import Entrega from './components/Movimientos/Entrega'
import Merma from './components/Movimientos/Merma'
import Transferencia from './components/Movimientos/Transferencia'
import Ajuste from './components/Movimientos/Ajuste'
import InstitucionDashboard from './components/Dashboard/InstitucionDashboard'
import HistorialMovimientos from './components/Movimientos/HistorialMovimientos'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function RoleGuard({ children, allowedRoles }) {
  const { perfil } = useAuth()
  if (perfil && !allowedRoles.includes(perfil.rol)) return <Navigate to="/" />
  return children
}

function AppLayout() {
  const { perfil } = useAuth()
  
  const DashboardComponent = perfil?.rol === 'coordinador' 
    ? CoordinadorDashboard 
    : perfil?.rol === 'institucion'
    ? InstitucionDashboard
    : EncargadoDashboard

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardComponent />} />
            <Route path="/centros" element={<RoleGuard allowedRoles={['coordinador']}><ListaCentros /></RoleGuard>} />
            <Route path="/campanas" element={<RoleGuard allowedRoles={['coordinador']}><ListaCampanas /></RoleGuard>} />
            <Route path="/inventario" element={<ListaInventario />} />
            <Route path="/recepcion" element={<Recepcion />} />
            <Route path="/entrega" element={<Entrega />} />
            <Route path="/merma" element={<RoleGuard allowedRoles={['coordinador', 'encargado']}><Merma /></RoleGuard>} />
            <Route path="/transferencia" element={<RoleGuard allowedRoles={['coordinador', 'encargado']}><Transferencia /></RoleGuard>} />
            <Route path="/ajuste" element={<RoleGuard allowedRoles={['coordinador', 'encargado']}><Ajuste /></RoleGuard>} />
            <Route path="/historial" element={<HistorialMovimientos />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  return isLogin 
    ? <Login onToggle={() => setIsLogin(false)} />
    : <Register onToggle={() => setIsLogin(true)} />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
