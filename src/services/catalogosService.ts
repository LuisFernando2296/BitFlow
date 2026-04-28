import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'

export interface Empresa {
  id: number
  nombre: string
}

export interface Puesto {
  id: number
  nombre: string
}

export interface Rol {
  id: number
  rol: string
}

export interface UsuarioCatalogo {
  id: number
  nombre: string
  apellido: string
  correo: string
}

export interface EquipoVentas {
  id: number
  equipo: string
}

export interface UsuarioEquipoVentas {
  id: number
  nombre: string
  idEquipo: number
  equipo: string
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Empresas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getEmpresas(idEmpresa: number): Promise<Empresa[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/empresas`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Puestos
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getPuestos(idEmpresa: number): Promise<Puesto[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/puestos`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Roles
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getRoles(idEmpresa: number): Promise<Rol[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/roles`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Admins de ventas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getAdminVentas(idEmpresa: number): Promise<UsuarioCatalogo[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/admin-ventas`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Usuarios de ventas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getUsuariosVentas(idEmpresa: number): Promise<UsuarioCatalogo[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/usuarios-ventas`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Equipos de ventas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getEquiposVentas(idEmpresa: number): Promise<EquipoVentas[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/equipos-ventas`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Usuarios en equipos de ventas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getUsuariosEquipoVentas(idEmpresa: number): Promise<UsuarioEquipoVentas[]> {
  const { data } = await axios.get(`${API_URL}/catalogos/usuarios-equipo-ventas`, {
    params: { idEmpresa },
  })
  return data.data ?? []
}