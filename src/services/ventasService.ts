// src/services/ventasService.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'
const USER_KEY = 'bitflow_user'

// Si después manejas token/JWT, lo agregas aquí
const getAuthHeaders = () => {
  const stored = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)
  if (!stored) return {}
  // const user = JSON.parse(stored)
  // return { Authorization: `Bearer ${user.token}` }
  return {}
}

// ---------- Tipos ----------
export type ProspectoPayload = {
  nombre: string
  telefono: string
  correo: string
  origen?: string
  idUser?: number | null
  idEmpresa?: number | null
  idEquip?: number | null
}

export type ProspectosConteos = {
  totales: number
  libres: number
  remarcados: number
}

export type Prospecto = {
  id: number
  idUser: number | null
  lastIdUser?: number | null
  nombre: string
  telefono: string
  correo: string
  folio?: string | null
  fechaAlta: string | null
  origen?: string | null
  status: 1 | 2 | 3 | 4 | 5
  fechaCierre?: string | null
  venta?: number | null
  comentarios?: string | null
  usuario?: string | null
  ultimoUsuario?: string | null
  noContAt?: string | null
  noContExpiresAt?: string | null
  primerContactoAt?: string | null
  primerContactoExpiresAt?: string | null
}

export interface NotaProspecto {
  id: number
  idUser: number
  regNota: string
  nota: string
  url: string | null
  create_at: string
  usuario: string
}

// ---------- Crear prospecto manual ----------
export const crearProspectoManual = async (payload: ProspectoPayload) => {
  const res = await axios.post(
    `${API_URL}/ventas/prospectos`,
    payload,
    { headers: getAuthHeaders() }
  )

  return res.data as {
    ok: boolean
    msg: string
    id: number
    idUserAsignado: number | null
  }
}

// ---------- Importar prospectos desde JSON (carga masiva) ----------
export const importarProspectosJson = async (prospectos: ProspectoPayload[]) => {
  const res = await axios.post(
    `${API_URL}/ventas/prospectos/import-json`,
    { prospectos },
    { headers: getAuthHeaders() }
  )

  return res.data as {
    ok: boolean
    msg: string
  }
}

// ---------- Obtener lista de prospectos (con filtros y rol del usuario) ----------
export const getProspectos = async (params: {
  search?: string
  status?: number
}) => {
  const stored =
    sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)

  let idUser: number | undefined
  let idRol: number | undefined
  let idPuesto: number | undefined
  let idEmpresa: number | undefined

  if (stored) {
    try {
      const user = JSON.parse(stored)
      idUser = user.id
      idRol = user.idRol
      idPuesto = user.idPuesto
      idEmpresa = user.idEmpresa
    } catch {}
  }

  const res = await axios.get(`${API_URL}/ventas/prospectos`, {
    params: {
      ...params,
      idUser,
      idRol,
      idPuesto,
      idEmpresa,
    },
    headers: getAuthHeaders(),
  })

  return res.data as {
    ok: boolean
    msg: string
    data: Prospecto[]
  }
}

// ---------- Actualizar folio / venta / comentarios ----------
export const actualizarVentaProspecto = async (
  id: number,
  data: { folio?: string | null; venta?: number | null; comentarios?: string | null }
) => {
  const res = await axios.patch(
    `${API_URL}/ventas/prospectos/${id}/venta`,
    data,
    { headers: getAuthHeaders() }
  )

  return res.data as { ok: boolean; msg: string; data: Prospecto }
}

// ---------- Actualizar status ----------
export const actualizarStatusProspecto = async (id: number, status: 1 | 2 | 3 | 4 | 5) => {
  const stored =
    sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)

  let idRol: number | undefined

  if (stored) {
    try {
      const user = JSON.parse(stored)
      idRol = user.idRol
    } catch {
      // ignore
    }
  }

  const res = await axios.patch(
    `${API_URL}/ventas/prospectos/${id}/status`,
    { status, idRol },
    { headers: getAuthHeaders() }
  )

  return res.data as { ok: boolean; msg: string; data: Prospecto }
}

export const asignarProspectoManual = async (id: number, idUser: number) => {
  const res = await axios.patch(
    `${API_URL}/ventas/prospectos/${id}/asignar-manual`,
    { idUser },
    { headers: getAuthHeaders() }
  )

  return res.data as {
    ok: boolean
    msg: string
    data: Prospecto
  }
}

// Obtener notas de un prospecto
export const getNotasProspecto = async (idProspecto: number) => {
  const res = await axios.get(`${API_URL}/ventas/prospectos/${idProspecto}/notas`, {
    headers: getAuthHeaders(),
  })

  return res.data as {
    ok: boolean
    msg: string
    regNota: string
    data: NotaProspecto[]
  }
}

// Crear nota
export const crearNotaProspecto = async (idPros: number, formData: FormData) => {
  const res = await axios.post(
    `${API_URL}/ventas/prospectos/${idPros}/notas`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return res.data as { ok: boolean; msg: string; data: NotaProspecto }
}

export const tomarProspectosLibres = async (idUser: number) => {
  const res = await axios.post(
    `${API_URL}/ventas/prospectos/tomar-libres`,
    { idUser },
    { headers: getAuthHeaders() }
  )
  return res.data
}

export async function getProspectosByUser(idUser: number) {
  const { data } = await axios.get(
    `${API_URL}/ventas/prospectos/usuario/${idUser}`,
    { headers: getAuthHeaders() }
  )
  return data
}

export async function getNotasByRegNota(regNota: string) {
  const { data } = await axios.get(
    `${API_URL}/ventas/prospectos/notas/${regNota}`,
    { headers: getAuthHeaders() }
  )
  return data
}

export async function crearNotaByRegNota(regNota: string, formData: FormData) {
  const { data } = await axios.post(
    `${API_URL}/ventas/prospectos/notas/${regNota}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return data
}

export async function getMetricasUsuario(idUser: number) {
  const { data } = await axios.get(
    `${API_URL}/ventas/usuarios/${idUser}/metricas`,
    { headers: getAuthHeaders() }
  )
  return data
}

export type ModoAsignacion = 'totales' | 'libres' | 'remarcados'

export async function getProspectosLibresCount() {
  const { data } = await axios.get(
    `${API_URL}/ventas/prospectos/libres/count`,
    { headers: getAuthHeaders() }
  )
  return data as {
    ok: boolean
    data: ProspectosConteos
  }
}

export async function asignarProspectosMasivo(payload: {
  idUser: number
  cantidad: number
  modo: ModoAsignacion
}) {
  const { data } = await axios.post(
    `${API_URL}/ventas/prospectos/asignar-masivo`,
    payload,
    { headers: getAuthHeaders() }
  )

  return data as {
    ok: boolean
    msg?: string
    data: {
      asignados: number
      ids: number[]
      conteos: ProspectosConteos
      restantesModo: number
      modo: ModoAsignacion
    }
  }
}

export async function tomarProspecto(payload: { idProspecto: number; idUser: number }) {
  const { data } = await axios.post(
    `${API_URL}/ventas/prospectos/tomar`,
    payload,
    { headers: getAuthHeaders() }
  )

  return data as { ok: boolean; msg?: string; data?: any }
}