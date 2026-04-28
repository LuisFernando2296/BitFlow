// src/modules/ventas/hooks/useEquiposPage.ts
import { useEffect, useMemo, useState } from 'react'
import { getUser } from '../../../services/authService'
import {
  getEquipos,
  getEquipoDetalle,
  crearEquipo,
  agregarMiembroEquipo,
  eliminarMiembroEquipo,
  cambiarRolEquipo,
  type TeamSummary,
  type TeamMember,
  type TeamDetail,
} from '../../../services/equiposService'
import {
  getAdminVentas,
  getUsuariosVentas,
  type UsuarioCatalogo,
} from '../../../services/catalogosService'

const ROWS_PER_PAGE = 10

export function useEquiposPage() {
  const currentUser = getUser()
  const idEmpresa = currentUser?.idEmpresa ?? 0

  const [equipos, setEquipos] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const [adminsVentas, setAdminsVentas] = useState<UsuarioCatalogo[]>([])
  const [usuariosVentas, setUsuariosVentas] = useState<UsuarioCatalogo[]>([])

  // modal crear
  const [openCreate, setOpenCreate] = useState(false)
  const [createNombre, setCreateNombre] = useState('')
  const [createIdLider, setCreateIdLider] = useState<number | ''>('')
  const [createMiembros, setCreateMiembros] = useState<number[]>([])
  const [createSublideres, setCreateSublideres] = useState<number[]>([])

  // modal detalle
  const [openDetail, setOpenDetail] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailEquipo, setDetailEquipo] = useState<TeamDetail | null>(null)
  const [detailMiembros, setDetailMiembros] = useState<TeamMember[]>([])
  const [nuevoMiembroId, setNuevoMiembroId] = useState<number | ''>('')
  const [nuevoSubliderId, setNuevoSubliderId] = useState<number | ''>('')

  const loadEquipos = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!idEmpresa) {
        setError('No se encontró la empresa del usuario logueado')
        setEquipos([])
        setAdminsVentas([])
        setUsuariosVentas([])
        return
      }

      const [equiposResp, admins, usuarios] = await Promise.all([
        getEquipos(idEmpresa),
        getAdminVentas(idEmpresa),
        getUsuariosVentas(idEmpresa),
      ])

      if (!equiposResp.ok) {
        setError(equiposResp.msg || 'Error al cargar equipos')
      } else {
        setEquipos(equiposResp.data)
      }

      setAdminsVentas(admins)
      setUsuariosVentas(usuarios)
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEmpresa])

  const filtrados = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return equipos

    return equipos.filter((e) =>
      [e.equipo, e.lider ?? ''].join(' ').toLowerCase().includes(term),
    )
  }, [equipos, search])

  const paginados = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filtrados.slice(start, start + ROWS_PER_PAGE)
  }, [filtrados, page])

  const handleOpenCreate = () => {
    setCreateNombre('')
    setCreateIdLider('')
    setCreateMiembros([])
    setCreateSublideres([])
    setOpenCreate(true)
  }

  const handleCreateEquipo = async () => {
    if (!createNombre || !createIdLider) return

    try {
      setLoading(true)
      setError(null)

      const resp = await crearEquipo({
        equipo: createNombre,
        idUser: Number(createIdLider),
        idEmpresa,
        miembros: createMiembros.length ? createMiembros : undefined,
        sublideres: createSublideres.length ? createSublideres : undefined,
      })

      if (!resp.ok) {
        setError(resp.msg || 'Error al crear equipo')
        return
}

      setOpenCreate(false)
      setCreateMiembros([])
      setCreateSublideres([])
      await loadEquipos()
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message || 'Error al crear equipo')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetail = async (idEquipo: number) => {
    setOpenDetail(true)
    setDetailEquipo(null)
    setDetailMiembros([])
    setNuevoMiembroId('')
    setNuevoSubliderId('')

    try {
      setDetailLoading(true)
      const resp = await getEquipoDetalle(idEquipo)

      if (!resp.ok) {
        setError(resp.msg || 'Error al obtener detalle')
        return
      }

      setDetailEquipo(resp.equipo)
      setDetailMiembros(resp.miembros)
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message || 'Error al obtener detalle')
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshDetalle = async () => {
    if (!detailEquipo) return

    const detalle = await getEquipoDetalle(detailEquipo.id)
    if (detalle.ok) setDetailMiembros(detalle.miembros)
  }

  const handleAddMiembro = async () => {
    if (!detailEquipo || nuevoMiembroId === '') return

    try {
      setDetailLoading(true)
      const resp = await agregarMiembroEquipo({
        idEquipo: detailEquipo.id,
        idUser: Number(nuevoMiembroId),
        rolEquipo: 2,
      })

      if (resp.ok) {
        await refreshDetalle()
        setNuevoMiembroId('')
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const handleAddSublider = async () => {
    if (!detailEquipo || nuevoSubliderId === '') return

    try {
      setDetailLoading(true)
      const resp = await agregarMiembroEquipo({
        idEquipo: detailEquipo.id,
        idUser: Number(nuevoSubliderId),
        rolEquipo: 1,
      })

      if (resp.ok) {
        await refreshDetalle()
        setNuevoSubliderId('')
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const handleRemoveMiembro = async (idUser: number) => {
    if (!detailEquipo) return

    try {
      setDetailLoading(true)
      await eliminarMiembroEquipo({ idEquipo: detailEquipo.id, idUser })
      setDetailMiembros((prev) => prev.filter((m) => m.idUser !== idUser))
    } finally {
      setDetailLoading(false)
    }
  }

  const handleChangeRol = async (idUser: number, rolEquipo: 1 | 2) => {
    if (!detailEquipo) return

    try {
      setDetailLoading(true)
      await cambiarRolEquipo({ idEquipo: detailEquipo.id, idUser, rolEquipo })
      await refreshDetalle()
    } finally {
      setDetailLoading(false)
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return '-'
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString()
  }

  const totalEquipos = equipos.length

  return {
    ROWS_PER_PAGE,

    // data
    equipos,
    adminsVentas,
    usuariosVentas,

    // ui state
    loading,
    error,
    setError,
    search,
    setSearch,
    page,
    setPage,

    filtrados,
    paginados,

    // create modal
    openCreate,
    setOpenCreate,
    createNombre,
    setCreateNombre,
    createIdLider,
    setCreateIdLider,
    createMiembros,
    setCreateMiembros,
    createSublideres,
    setCreateSublideres,
    handleOpenCreate,
    handleCreateEquipo,

    // detail modal
    openDetail,
    setOpenDetail,
    detailLoading,
    detailEquipo,
    detailMiembros,
    nuevoMiembroId,
    setNuevoMiembroId,
    nuevoSubliderId,
    setNuevoSubliderId,
    handleOpenDetail,
    handleAddMiembro,
    handleAddSublider,
    handleRemoveMiembro,
    handleChangeRol,

    // reload
    loadEquipos,

    formatDate,
    totalEquipos,
  }
}