// src/services/equiposService.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'
const USER_KEY = 'bitflow_user'

const getAuthHeaders = () => {
  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return {}
  // si después usas token, añádelo aquí
  return {}
}

// ======================
// Types
// ======================
export type TeamSummary = {
  id: number
  equipo: string
  fechaAlta: string | null
  idUser: number
  lider: string | null
  totalMiembros: number
}

export type TeamDetail = Omit<TeamSummary, 'totalMiembros'>

export type TeamMember = {
  id: number
  idUser: number
  rolEquipo: 1 | 2
  rolNombre?: string
  nombreUsuario: string
  correo?: string | null
  area?: string | null
}

export type TeamDetailResponse = {
  ok: boolean
  msg: string
  equipo: TeamDetail
  miembros: TeamMember[]
}

// ======================
// API calls
// ======================
export async function getEquipos(idEmpresa: number) {
  const { data } = await axios.get(`${API_URL}/ventas/equipos`, {
    params: { idEmpresa },
  })

  return data
}

export const getEquipoDetalle = async (id: number) => {
  const res = await axios.get(`${API_URL}/ventas/equipos/${id}`, {
    headers: getAuthHeaders(),
  })
  return res.data as TeamDetailResponse
}

// Crear equipo con miembros y sublíderes (rolEquipo: 1 sublíder, 2 miembro)
export const crearEquipo = async (payload: {
  equipo: string
  idUser: number
  idEmpresa: number   // 👈 AGREGAR
  miembros?: number[]
  sublideres?: number[]
}) => {
  const res = await axios.post(`${API_URL}/ventas/equipos/crear`, payload, {
    headers: getAuthHeaders(),
  })
  return res.data as { ok: boolean; msg: string; data?: { id: number } }
}

// Agregar miembro indicando rolEquipo
export const agregarMiembroEquipo = async (payload: {
  idEquipo: number
  idUser: number
  rolEquipo: 1 | 2
}) => {
  const res = await axios.post(
    `${API_URL}/ventas/equipos/agregar-miembro`,
    payload,
    { headers: getAuthHeaders() },
  )
  return res.data as { ok: boolean; msg: string }
}

export const eliminarMiembroEquipo = async (payload: {
  idEquipo: number
  idUser: number
}) => {
  const res = await axios.post(
    `${API_URL}/ventas/equipos/eliminar-miembro`,
    payload,
    { headers: getAuthHeaders() },
  )
  return res.data as { ok: boolean; msg: string }
}

// Cambiar rol (1 sublíder, 2 miembro)
export const cambiarRolEquipo = async (payload: {
  idEquipo: number
  idUser: number
  rolEquipo: 1 | 2
}) => {
  const res = await axios.patch(`${API_URL}/ventas/equipos/rol`, payload, {
    headers: getAuthHeaders(),
  })
  return res.data as { ok: boolean; msg: string }
}

