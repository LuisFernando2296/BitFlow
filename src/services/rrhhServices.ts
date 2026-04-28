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
  fechaIngreso?: string | null
  fechalngreso?: string | null
}

export interface Puesto {
  id: number
  nombre: string
}

// 🔹 Obtener usuarios RRHH por empresa
export async function getUsuariosRRHH(idEmpresa: number): Promise<UsuarioRRHH[]> {
  const { data } = await axios.get<UsuarioRRHH[]>(`${API_URL}/usuarios`, {
    params: { idEmpresa },
  })

  return data
}

// 🔹 Desactivar usuario
export async function desactivarUsuario(id: number): Promise<void> {
  await axios.put(`${API_URL}/usuarios/desactivar/${id}`)
}

// 🔹 Actualizar datos del usuario
export async function actualizarUsuario(
  id: number,
  payload: { correo: string; telefono: number | null; idPuesto: number }
): Promise<void> {
  await axios.put(`${API_URL}/usuarios/${id}`, payload)
}

// 🔹 Obtener catálogo de puestos por empresa
export async function getPuestos(idEmpresa: number): Promise<Puesto[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/puestos`, {
    params: { idEmpresa },
  })

  return data.data ?? []
}

// 🔹 Crear nuevo usuario
export interface CrearUsuarioPayload {
  nombre: string
  apellido: string
  correo: string
  telefono: number | null
  idEmpresa: number
  idPuesto: number
  idRol: number
  fechalngreso: string
}

export interface CrearUsuarioResponse {
  message: string
  usuario: UsuarioRRHH
  password_temp: string
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