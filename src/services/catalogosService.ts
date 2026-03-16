import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'

// Interfaces existentes
export interface Empresa { id: number; nombre: string }
export interface Puesto { id: number; nombre: string }
export interface Rol { id: number; rol: string }

// Nueva interfaz para catálogos de usuarios de ventas
export interface UsuarioCatalogo {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export interface EquipoVentas {
  id: number;
  equipo: string;
}

export interface UsuarioEquipoVentas {
  id: number
  nombre: string
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Empresas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getEmpresas(): Promise<Empresa[]> {
  const { data } = await axios.get<Empresa[]>(`${API_URL}/catalogos/empresas`)
  return data
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Puestos
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getPuestos(): Promise<Puesto[]> {
  const { data } = await axios.get<Puesto[]>(`${API_URL}/catalogos/puestos`)
  return data
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Roles
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getRoles(): Promise<Rol[]> {
  const { data } = await axios.get<Rol[]>(`${API_URL}/catalogos/roles`)
  return data
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Admins de ventas (idRol=2, idPuesto=1)
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getAdminVentas(): Promise<UsuarioCatalogo[]> {
  const { data } = await axios.get<UsuarioCatalogo[]>(`${API_URL}/catalogos/admin-ventas`)
  return data
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Usuarios de ventas (idRol=3, idPuesto=1)
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getUsuariosVentas(): Promise<UsuarioCatalogo[]> {
  const { data } = await axios.get<UsuarioCatalogo[]>(`${API_URL}/catalogos/usuarios-ventas`)
  return data
}

export async function getEquiposVentas(): Promise<EquipoVentas[]> {
  const { data } = await axios.get<EquipoVentas[]>(`${API_URL}/catalogos/equipos-ventas`)
  return data
}

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//   Catálogo: Usuarios en equipos de ventas
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
export async function getUsuariosEquipoVentas(idEmpresa: number): Promise<UsuarioEquipoVentas[]> {
  const { data } = await axios.get<UsuarioEquipoVentas[]>(
    `${API_URL}/catalogos/usuarios-equipo-ventas`,
    {
      params: { idEmpresa },
    }
  )
  return data
}