// src/services/rrhhServices.ts
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'

export interface UsuarioRRHH {
  id: number
  nombre: string
  apellido: string
  telefono: number | null
  correo: string
  status: number
  empresa: string
  puesto: string
  rol: string
  idPuesto?: number
  idEmpresa?: number
  idRol?: number
  fechalngreso?: string | null
}

export interface Puesto {
  id: number
  nombre: string
}

// 🔹 Obtener todos los usuarios (RRHH)
export async function getUsuariosRRHH(): Promise<UsuarioRRHH[]> {
  const { data } = await axios.get<UsuarioRRHH[]>(`${API_URL}/usuarios`)
  return data
}

// 🔹 Desactivar usuario (status = 2)
export async function desactivarUsuario(id: number): Promise<void> {
  await axios.put(`${API_URL}/usuarios/desactivar/${id}`)
}

// 🔹 Actualizar datos del usuario (correo, teléfono, idPuesto)
export async function actualizarUsuario(
  id: number,
  payload: { correo: string; telefono: number | null; idPuesto: number }
): Promise<void> {
  await axios.put(`${API_URL}/usuarios/${id}`, payload)
}

// 🔹 Obtener catálogo de puestos
export async function getPuestos(): Promise<Puesto[]> {
  const { data } = await axios.get<Puesto[]>(`${API_URL}/catalogos/puestos`)
  return data
}

/* 🔹 CREAR NUEVO USUARIO (usa POST /usuarios/adduser) */
export interface CrearUsuarioPayload {
  nombre: string
  apellido: string
  correo: string
  telefono: number | null
  idEmpresa: number
  idPuesto: number
  idRol: number
  fechalngreso: string // 'YYYY-MM-DD'
}

export interface CrearUsuarioResponse {
  message: string
  usuario: UsuarioRRHH
  password_temp: string // la pass que genera el backend
}

export async function crearUsuario(
  payload: CrearUsuarioPayload
): Promise<CrearUsuarioResponse> {
  const { data } = await axios.post<CrearUsuarioResponse>(
    `${API_URL}/usuarios/adduser`,
    payload
  )
  return data
}
