import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../utils/supabase.jsx'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchPerfil(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchPerfil(userId) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single()
    setPerfil(data)
    setLoading(false)
    if (!data) {
      await supabase.auth.signOut()
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function register(email, password, nombre, rol, centroId = null) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } }
    })
    if (authError) throw authError
    const { error: profileError } = await supabase.from('usuarios').insert({ id: authData.user.id, email, nombre, rol, centro_id: centroId || null })
    if (profileError && profileError.code !== '23505') throw profileError
    return authData
  }

  async function logout() { await supabase.auth.signOut(); setUser(null); setPerfil(null) }

  return (<AuthContext.Provider value={{ user, perfil, loading, login, register, logout }}>{children}</AuthContext.Provider>)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}