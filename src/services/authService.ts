// src/services/authService.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'

export interface User {
  id: number
  nombre: string | null
  apellido: string | null
  correo: string
  telefono?: string | null
  area?: string | null
  idRol?: number
  idEmpresa?: number
  idPuesto?: number
  fechalngreso?: string | null
  fechaSalida?: string | null
  status: number
  mustChangePass?: number

  // 🔹 Campos nuevos que manda el backend
  empresa?: string | null
  empresa_idGroup?: number | null
  grupoEmpresa?: string | null
}

export interface LoginResponse {
  ok: boolean
  msg: string
  user?: User
}

const USER_KEY = 'bitflow_user'

// 🔹 Login con opción de "Recordarme"
export async function loginRequest(
  correo: string,
  pass: string,
  remember: boolean
): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, {
      correo,
      pass,
    })

    if (data.ok && data.user) {
      saveUser(data.user, remember)
    }

    return data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data as LoginResponse
    }

    return {
      ok: false,
      msg: 'No se pudo conectar con el servidor',
    }
  }
}


// 🔹 Guardar usuario según "Recordarme"
export function saveUser(user: User, remember: boolean) {
  const payload = JSON.stringify(user)

  if (remember) {
    // Persiste aunque se cierre el navegador
    localStorage.setItem(USER_KEY, payload)
    sessionStorage.removeItem(USER_KEY)
  } else {
    // Solo mientras la pestaña/ventana esté abierta
    sessionStorage.setItem(USER_KEY, payload)
    localStorage.removeItem(USER_KEY)
  }
}

// 🔹 Obtener usuario (busca primero en sessionStorage y luego en localStorage)
export function getUser(): User | null {
  const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

// 🔹 Limpiar usuario en logout
export function clearUser() {
  sessionStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_KEY)
}

export interface ChangePasswordResponse {
  ok: boolean
  msg: string
}

export async function changeInitialPassword(
  idUsuario: number,
  passwordActual: string,
  passwordNueva: string
): Promise<ChangePasswordResponse> {
  const { data } = await axios.post<ChangePasswordResponse>(
    `${API_URL}/usuarios/cambiar-password-inicial`,
    {
      idUsuario,
      passwordActual,
      passwordNueva,
    }
  )

  return data
}


