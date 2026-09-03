import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase.jsx'

export function useCentros() {
  const [centros, setCentros] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCentros() {
    const { data, error } = await supabase.from('centros').select('*').order('nombre')
    if (!error) setCentros(data)
    setLoading(false)
  }

  async function crearCentro(centro) {
    const { data, error } = await supabase.from('centros').insert(centro).select()
    if (error) throw error
    setCentros([...centros, data[0]])
    return data[0]
  }

  async function actualizarCentro(id, updates) {
    const { data, error } = await supabase.from('centros').update(updates).eq('id', id).select()
    if (error) throw error
    setCentros(centros.map(c => c.id === id ? data[0] : c))
    return data[0]
  }

  useEffect(() => { fetchCentros() }, [])
  return { centros, loading, crearCentro, actualizarCentro, refetch: fetchCentros }
}

export function useMovimientos(centroId = null) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchMovimientos() {
    let query = supabase.from('movimientos').select('*').order('created_at', { ascending: false })
    if (centroId) query = query.eq('centro_id', centroId)
    const { data, error } = await query
    if (!error) setMovimientos(data)
    setLoading(false)
  }

  async function crearMovimiento(movimiento) {
    const { data, error } = await supabase.from('movimientos').insert(movimiento).select()
    if (error) throw error
    setMovimientos([data[0], ...movimientos])
    return data[0]
  }

  useEffect(() => { fetchMovimientos() }, [centroId])
  return { movimientos, loading, crearMovimiento, refetch: fetchMovimientos }
}

export function useCampanas() {
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCampanas() {
    const { data, error } = await supabase.from('campanas').select('*').order('created_at', { ascending: false })
    if (!error) setCampanas(data)
    setLoading(false)
  }

  async function crearCampana(campana) {
    const { data, error } = await supabase.from('campanas').insert(campana).select()
    if (error) throw error
    setCampanas([data[0], ...campanas])
    return data[0]
  }

  useEffect(() => { fetchCampanas() }, [])
  return { campanas, loading, crearCampana, refetch: fetchCampanas }
}