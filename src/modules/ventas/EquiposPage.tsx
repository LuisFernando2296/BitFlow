// src/modules/ventas/EquiposPage.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Paper,
  Select,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
//import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

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
} from '../../services/equiposService'

import {
  getAdminVentas,
  getUsuariosVentas,
  type UsuarioCatalogo,
} from '../../services/catalogosService'

const ROWS_PER_PAGE = 10

const formatDate = (value: string | null) => {
  if (!value) return '-'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString()
}

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  // catálogos
  const [adminsVentas, setAdminsVentas] = useState<UsuarioCatalogo[]>([])
  const [usuariosVentas, setUsuariosVentas] = useState<UsuarioCatalogo[]>([])

  // modal crear equipo
  const [openCreate, setOpenCreate] = useState(false)
  const [createNombre, setCreateNombre] = useState('')
  const [createIdLider, setCreateIdLider] = useState<number | ''>('')
  const [createMiembros, setCreateMiembros] = useState<number[]>([])
  const [createSublideres, setCreateSublideres] = useState<number[]>([])

  // modal detalle / edición
  const [openDetail, setOpenDetail] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailEquipo, setDetailEquipo] = useState<TeamDetail | null>(null)
  const [detailMiembros, setDetailMiembros] = useState<TeamMember[]>([])
  const [nuevoMiembroId, setNuevoMiembroId] = useState<number | ''>('')
  //const [nuevoMiembroRol, setNuevoMiembroRol] = useState<1 | 2>(2)
  const [nuevoSubliderId, setNuevoSubliderId] = useState<number | ''>('')


  // ──────────────────────── Cargar data inicial ────────────────────────
  const loadEquipos = async () => {
    try {
      setLoading(true)
      setError(null)

      const [equiposResp, admins, usuarios] = await Promise.all([
        getEquipos(),
        getAdminVentas(),
        getUsuariosVentas(),
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
  }, [])

  // ──────────────────────── Filtros y paginación ────────────────────────
  const filtrados = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return equipos

    return equipos.filter((e) =>
      [e.equipo, e.lider ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [equipos, search])

  const paginados = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filtrados.slice(start, start + ROWS_PER_PAGE)
  }, [filtrados, page])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  // ──────────────────────── Crear equipo ────────────────────────
  const handleOpenCreate = () => {
    setCreateNombre('')
    setCreateIdLider('')
    setCreateMiembros([])
    setOpenCreate(true)
    setCreateSublideres([])
    //setNuevoMiembroRol(2)
  }

  const handleCreateEquipo = async () => {
    if (!createNombre || !createIdLider) return

    try {
      setLoading(true)
      setError(null)

      const resp = await crearEquipo({
        equipo: createNombre,
        idUser: Number(createIdLider),
        miembros: createMiembros.length ? createMiembros : undefined,
        sublideres: createSublideres.length ? createSublideres : undefined, 
      })

      if (!resp.ok) {
        setError(resp.msg || 'Error al crear equipo')
        return
      }

      setOpenCreate(false)
      setCreateMiembros([])
      await loadEquipos()
    } catch (e: any) {
      setError(e?.response?.data?.msg || e.message || 'Error al crear equipo')
    } finally {
      setLoading(false)
    }
  }

  // ──────────────────────── Detalle / miembros ────────────────────────
  const handleOpenDetail = async (idEquipo: number) => {
    setOpenDetail(true)
    setDetailEquipo(null)
    setDetailMiembros([])
    setNuevoMiembroId('')

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

  const handleAddMiembro = async () => {
  if (!detailEquipo || nuevoMiembroId === '') return
  try {
    setDetailLoading(true)
    const resp = await agregarMiembroEquipo({
      idEquipo: detailEquipo.id,
      idUser: Number(nuevoMiembroId),
      rolEquipo: 2, // ✅ miembro automático
    })
    if (!resp.ok) return

    const detalle = await getEquipoDetalle(detailEquipo.id)
    if (detalle.ok) setDetailMiembros(detalle.miembros)
    setNuevoMiembroId('')
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
      rolEquipo: 1, // ✅ sublíder automático
    })
    if (!resp.ok) return

    const detalle = await getEquipoDetalle(detailEquipo.id)
    if (detalle.ok) setDetailMiembros(detalle.miembros)
    setNuevoSubliderId('')
  } finally {
    setDetailLoading(false)
  }
}


  const handleRemoveMiembro = async (idUser: number) => {
    if (!detailEquipo) return
    try {
      setDetailLoading(true)
      await eliminarMiembroEquipo({
        idEquipo: detailEquipo.id,
        idUser,
      })
      setDetailMiembros((prev) => prev.filter((m) => m.idUser !== idUser))
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const totalEquipos = equipos.length

  // ──────────────────────── UI ────────────────────────
  return (
    <Box p={3} maxWidth="lg" mx="auto">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Equipos de ventas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona los equipos, sus líderes y sus integrantes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<GroupAddIcon />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none' }}
        >
          Nuevo equipo
        </Button>
      </Stack>

      {/* Resumen y filtros */}
      <Stack direction="row" spacing={1.5} mb={2} alignItems="center">
        <Chip label={`Total equipos: ${totalEquipos}`} size="small" />
        <Box flexGrow={1} />
        <TextField
          size="small"
          label="Buscar por nombre de equipo o líder"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 360 }}
        />
      </Stack>

      {error && (
        <Typography color="error" variant="body2" mb={1}>
          {error}
        </Typography>
      )}

      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <CircularProgress size={18} />
          <Typography variant="body2">Cargando…</Typography>
        </Stack>
      )}

      {/* Tabla */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipo</TableCell>
                <TableCell>Líder</TableCell>
                <TableCell>Fecha alta</TableCell>
                <TableCell align="center">Miembros</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginados.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.equipo}</TableCell>
                  <TableCell>{e.lider || '-'}</TableCell>
                  <TableCell>{formatDate(e.fechaAlta)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={e.totalMiembros}
                      color={e.totalMiembros > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ver información del equipo">
                        <IconButton size="small" onClick={() => handleOpenDetail(e.id)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {/* <Tooltip title="Editar integrantes del equipo">
                        <IconButton size="small" onClick={() => handleOpenDetail(e.id)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip> */}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && paginados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay equipos para mostrar.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelRowsPerPage="Registros por página"
        />
      </Paper>

      {/* Modal crear equipo */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo equipo de ventas</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre del equipo"
              fullWidth
              value={createNombre}
              onChange={(e) => setCreateNombre(e.target.value)}
            />

            {/* Select de líder */}
            <FormControl fullWidth size="small">
              <InputLabel>Líder del equipo</InputLabel>
              <Select
                label="Líder del equipo"
                value={createIdLider}
                onChange={(e) => setCreateIdLider(e.target.value as number | '')}
              >
                {adminsVentas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre} {a.apellido} ({a.correo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Select múltiple de miembros */}
            <FormControl fullWidth size="small">
              <InputLabel>Miembros del equipo</InputLabel>
              <Select
                label="Miembros del equipo"
                multiple
                value={createMiembros}
                onChange={(e) => {
                  const value = e.target.value
                  const arr =
                    typeof value === 'string'
                      ? value
                          .split(',')
                          .map((v) => Number(v.trim()))
                          .filter((n) => !Number.isNaN(n))
                      : (value as number[])

                  setCreateMiembros(arr)
                }}
                renderValue={(selected) =>
                  (selected as number[])
                    .map((id) => {
                      const u = usuariosVentas.find((x) => x.id === id)
                      return u ? `${u.nombre} ${u.apellido}` : id
                    })
                    .join(', ')
                }
              >
                {usuariosVentas.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} ({u.correo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Select múltiple de sublíderes (SOLO admins) */}
          <FormControl fullWidth size="small">
            <InputLabel>Sublíder(es)</InputLabel>
            <Select
              label="Sublíder(es)"
              multiple
              value={createSublideres}
              onChange={(e) => {
                const value = e.target.value
                const arr =
                  typeof value === 'string'
                    ? value
                        .split(',')
                        .map((v) => Number(v.trim()))
                        .filter((n) => !Number.isNaN(n))
                    : (value as number[])

                // opcional: evitar que el líder también quede como sublíder
                const leaderId = createIdLider ? Number(createIdLider) : null
                setCreateSublideres(leaderId ? arr.filter((id) => id !== leaderId) : arr)
              }}
              renderValue={(selected) =>
                (selected as number[])
                  .map((id) => {
                    const u = adminsVentas.find((x) => x.id === id)
                    return u ? `${u.nombre} ${u.apellido}` : id
                  })
                  .join(', ')
              }
            >
              {adminsVentas
                // opcional: ocultar al líder seleccionado del listado
                .filter((a) => a.id !== Number(createIdLider || 0))
                .map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre} {a.apellido} ({a.correo})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateEquipo} disabled={loading}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal detalle equipo / miembros */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {detailEquipo ? `Equipo: ${detailEquipo.equipo}` : 'Equipo de ventas'}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading && (
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <CircularProgress size={18} />
              <Typography variant="body2">Cargando detalle…</Typography>
            </Stack>
          )}

          {detailEquipo && (
            <Box mb={2}>
              <Typography variant="body2">
                <strong>Líder:</strong> {detailEquipo.lider || '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha alta:</strong> {formatDate(detailEquipo.fechaAlta)}
              </Typography>
              <Typography variant="body2">
                <strong>ID líder:</strong> {detailEquipo.idUser}
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle2" mb={1}>
            Miembros del equipo
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2} alignItems="center">
            {/* ✅ Agregar Miembro (desde usuariosVentas) */}
            <FormControl size="small" sx={{ minWidth: 280, flex: 1 }}>
              <InputLabel>Agregar miembro</InputLabel>
              <Select
                label="Agregar miembro"
                value={nuevoMiembroId}
                onChange={(e) => setNuevoMiembroId(e.target.value as number | '')}
              >
                {usuariosVentas.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} ({u.correo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleAddMiembro}
              disabled={detailLoading || !detailEquipo || nuevoMiembroId === ''}
              sx={{ textTransform: 'none', height: 40, px: 2.5, whiteSpace: 'nowrap' }}
            >
              Agregar miembro
            </Button>

            {/* ✅ Agregar Sublíder (solo adminsVentas) */}
            <FormControl size="small" sx={{ minWidth: 280, flex: 1 }}>
              <InputLabel>Agregar sublíder</InputLabel>
              <Select
                label="Agregar sublíder"
                value={nuevoSubliderId}
                onChange={(e) => setNuevoSubliderId(e.target.value as number | '')}
              >
                {adminsVentas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre} {a.apellido} ({a.correo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleAddSublider}
              disabled={detailLoading || !detailEquipo || nuevoSubliderId === ''}
              sx={{ textTransform: 'none', height: 40, px: 2.5, whiteSpace: 'nowrap' }}
            >
              Agregar sublíder
            </Button>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              maxHeight: 280,
              overflow: 'auto',
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Usuario</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell align="center">Rol</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailMiembros.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.idUser}</TableCell>
                    <TableCell>{m.nombreUsuario}</TableCell>
                    <TableCell>{m.correo || '-'}</TableCell>
                    <TableCell>{m.area || '-'}</TableCell>
                    
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={m.rolNombre ?? (m.rolEquipo === 1 ? 'Sublíder' : 'Miembro')}
                        color={m.rolEquipo === 1 ? 'primary' : 'default'}
                        variant={m.rolEquipo === 1 ? 'filled' : 'outlined'}
                      />

                      {/* Cambiar rol rápido */}
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={m.rolEquipo}
                          onChange={async (e) => {
                            if (!detailEquipo) return
                            const nuevoRol = Number(e.target.value) as 1 | 2
                            try {
                              setDetailLoading(true)
                              await cambiarRolEquipo({
                                idEquipo: detailEquipo.id,
                                idUser: m.idUser,
                                rolEquipo: nuevoRol,
                              })
                              const detalle = await getEquipoDetalle(detailEquipo.id)
                              if (detalle.ok) setDetailMiembros(detalle.miembros)
                            } catch (err) {
                              console.error(err)
                            } finally {
                              setDetailLoading(false)
                            }
                          }}
                        >
                          <MenuItem value={1}>Sublíder</MenuItem>
                          <MenuItem value={2}>Miembro</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar del equipo">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMiembro(m.idUser)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {detailMiembros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay miembros registrados en este equipo.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
