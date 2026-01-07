import { useEffect, useMemo, useState } from 'react'
import { getUser } from '../../services/authService'
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material'

import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { getNotasProspecto, crearNotaProspecto, type NotaProspecto } from '../../services/ventasService'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

import {
  getProspectos,
  actualizarStatusProspecto,
  actualizarVentaProspecto,
  asignarProspectoManual,
  type Prospecto,
  tomarProspectosLibres,
} from '../../services/ventasService'

import {
  getUsuariosVentas,
  type UsuarioCatalogo,
} from '../../services/catalogosService'

const user = getUser()
const esMaster = user?.idRol === 1
/* const esVendedor = user?.idRol === 3 && user?.idPuesto === 1 */

const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return '-'
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}

const ROWS_PER_PAGE = 10


// 🔹 NUEVO catálogo de status
const statusOptions = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Nuevo' },
  { value: 2, label: 'En proceso' },
  { value: 3, label: 'Cerrado' },
  { value: 4, label: 'No contesta' },
  { value: 5, label: 'Balón' },
]

function renderStatusChip(status: number) {
  // ampliamos el tipo de color para que acepte más opciones
  let color: 'default' | 'warning' | 'info' | 'success' | 'error' = 'default'
  let label = ''

  switch (status) {
    case 1:
      color = 'info'
      label = 'Nuevo'
      break
    case 2:
      color = 'warning'
      label = 'En proceso'
      break
    case 3:
      color = 'success'
      label = 'Cerrado'
      break
    case 4:
      color = 'default'
      label = 'No contesta'
      break
    case 5:
      color = 'error'
      label = 'Balón'
      break
    default:
      label = 'Desconocido'
  }

  return <Chip size="small" color={color} label={label} />
}

export default function ProspectosPage() {

const [openAssign, setOpenAssign] = useState(false)
const [assignProspecto, setAssignProspecto] = useState<Prospecto | null>(null)
const [usuariosVentas, setUsuariosVentas] = useState<UsuarioCatalogo[]>([])
const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
const [loadingUsuarios, setLoadingUsuarios] = useState(false)
const [openNotas, setOpenNotas] = useState(false)
const [notas, setNotas] = useState<NotaProspecto[]>([])
const [notaTexto, setNotaTexto] = useState('')
const [archivo, setArchivo] = useState<File | null>(null)
const [loadingNotas, setLoadingNotas] = useState(false)
const [guardandoNota, setGuardandoNota] = useState(false)
const [prospectoNotas, setProspectoNotas] = useState<Prospecto | null>(null)

const handleTomarProspectosLibres = async () => {
  if (!user) {
    showSnackbar('No se encontró el usuario logueado.', 'error')
    return
  }

  try {
    setLoading(true)
    const resp = await tomarProspectosLibres(user.id)

    if (!resp.ok) {
      showSnackbar(resp.msg || 'No se pudieron asignar prospectos libres.', 'error')
      return
    }

    showSnackbar(resp.msg, 'success')
    // recargar la lista para verlos ya asignados
    await loadProspectos()
  } catch (e: any) {
    const msg =
      e?.response?.data?.msg || e.message || 'Error al tomar prospectos libres.'
    showSnackbar(msg, 'error')
  } finally {
    setLoading(false)
  }
}

const cargarNotas = async (idProspecto: number) => {
  try {
    setLoadingNotas(true)
    const resp = await getNotasProspecto(idProspecto)

    if (!resp.ok) {
      showSnackbar(resp.msg || 'Error al cargar notas', 'error')
      return
    }

    setNotas(resp.data)
  } catch (e: any) {
    const msg = e?.response?.data?.msg || e.message || 'Error al cargar notas'
    showSnackbar(msg, 'error')
  } finally {
    setLoadingNotas(false)
  }
}

const abrirModalNotas = async (p: Prospecto) => {
  setProspectoNotas(p)
  setOpenNotas(true)
  await cargarNotas(p.id)
}

/* const cerrarModalNotas = () => {
  setOpenNotas(false)
  setProspectoNotas(null)
  setNotas([])
  setNotaTexto('')
} */

const handleGuardarNota = async () => {
  if (!prospectoNotas || !user) {
    showSnackbar('No se pudo identificar el usuario o el prospecto', 'error')
    return
  }

  if (!notaTexto.trim() && !archivo) {
    showSnackbar('Escribe una nota o adjunta un archivo', 'warning')
    return
  }

  try {
    setGuardandoNota(true)

    // 👇 preparamos FormData para enviar texto + PDF
    const formData = new FormData()
    formData.append('idUser', String(user.id))
    formData.append('nota', notaTexto.trim())
    if (archivo) {
      formData.append('file', archivo)
    }

    const resp = await crearNotaProspecto(prospectoNotas.id, formData)

    if (!resp.ok) {
      showSnackbar(resp.msg || 'No se pudo guardar la nota', 'error')
      return
    }

    // agregamos la nueva nota al chat
    setNotas((prev) => [...prev, resp.data])
    setNotaTexto('')
    setArchivo(null)

    showSnackbar('Nota guardada correctamente', 'success')
  } catch (e: any) {
    const msg =
      e?.response?.data?.msg || e.message || 'Error al guardar la nota'
    showSnackbar(msg, 'error')
  } finally {
    setGuardandoNota(false)
  }
}

  const abrirModalAsignar = async (p: Prospecto) => {
    if (!esMaster) return

    try {
      setLoadingUsuarios(true)
      setAssignProspecto(p)
      setSelectedUserId(null)

      const data = await getUsuariosVentas()
      setUsuariosVentas(data)
      setOpenAssign(true)
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.msg || e.message || 'Error al cargar usuarios de ventas'
      showSnackbar(msg, 'error')
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const cerrarModalAsignar = () => {
    setOpenAssign(false)
    setAssignProspecto(null)
    setSelectedUserId(null)
  }

  const guardarAsignacion = async () => {
    if (!assignProspecto || !selectedUserId) {
      showSnackbar('Selecciona un usuario de ventas para asignar el prospecto.', 'warning')
      return
    }

    try {
      setLoading(true)
      const resp = await asignarProspectoManual(assignProspecto.id, Number(selectedUserId))

      if (!resp.ok) {
        showSnackbar(resp.msg || 'No se pudo asignar el prospecto', 'error')
        return
      }

      // Actualizar localmente la lista de prospectos
      const updated = resp.data
      setProspectos((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      )

      showSnackbar('Prospecto asignado correctamente.', 'success')
      cerrarModalAsignar()
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.msg || e.message || 'Error al asignar el prospecto'
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }
  
const [snackbar, setSnackbar] = useState<{
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}>({
  open: false,
  message: '',
  severity: 'success',
})

const showSnackbar = (
  message: string,
  severity: 'success' | 'error' | 'info' | 'warning' = 'success'
) => {
  setSnackbar({ open: true, message, severity })
}

const handleCloseSnackbar = (
  _event?: React.SyntheticEvent | Event,
  reason?: string
) => {
  if (reason === 'clickaway') return
  setSnackbar((prev) => ({ ...prev, open: false }))
}

  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(0)
  const [page, setPage] = useState(0)

  // Modal edición venta/folio
  const [openEdit, setOpenEdit] = useState(false)
  const [editProspecto, setEditProspecto] = useState<Prospecto | null>(null)
  const [editFolio, setEditFolio] = useState('')
  const [editVenta, setEditVenta] = useState<string>('')
  const [editComentarios, setEditComentarios] = useState('')

  const loadProspectos = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await getProspectos({
        search: search || undefined,
        status: statusFilter || undefined,
      })
      if (!resp.ok) {
        const msg = resp.msg || 'Error al cargar prospectos'
        setError(msg)
        showSnackbar(msg, 'error')
        return
      }
      setProspectos(resp.data)
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al cargar prospectos'
      setError(msg)
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProspectos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const filtrados = useMemo(() => {
    let lista = [...prospectos]

    if (statusFilter !== 0) {
      lista = lista.filter((p) => p.status === statusFilter)
    }

    const term = search.toLowerCase().trim()
    if (term) {
      lista = lista.filter((p) =>
        [
          p.nombre,
          p.telefono,
          p.correo,
          p.origen ?? '',
          p.folio ?? '',
          p.usuario ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
    }

    return lista
  }, [prospectos, statusFilter, search])

  const paginados = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filtrados.slice(start, start + ROWS_PER_PAGE)
  }, [filtrados, page])

 const handleStatusChange = async (id: number, nuevoStatus: number) => {
  try {
    setLoading(true)
    const resp = await actualizarStatusProspecto(id, nuevoStatus as any)

    if (!resp.ok) {
      showSnackbar(resp.msg || 'No se pudo actualizar el status', 'error')
      return
    }

    // Recargar todo el listado desde backend (actualizado)
    await loadProspectos()

    // Mensaje según el status
    let msg = 'Status actualizado correctamente'

    if (nuevoStatus === 3) msg = 'Lead marcado como CERRADO'
    if (nuevoStatus === 4) msg = 'Lead marcado como NO CONTESTA'
    if (nuevoStatus === 5) msg = 'Lead marcado como BALÓN y se generó un nuevo registro'

    showSnackbar(msg, 'success')
  } catch (e: any) {
    console.error(e)
    const msg =
      e?.response?.data?.msg || e.message || 'Error al actualizar el status'
    showSnackbar(msg, 'error')
  } finally {
    setLoading(false)
  }
}

  const handleApplyFilters = () => {
    setPage(0)
    loadProspectos()
  }

  // 🔹 Actualizamos el resumen a los nuevos estados
  const resumen = useMemo(() => {
    const total = prospectos.length
    const nuevos = prospectos.filter((p) => p.status === 1).length
    const enProceso = prospectos.filter((p) => p.status === 2).length
    const cerrados = prospectos.filter((p) => p.status === 3).length
    const noContesta = prospectos.filter((p) => p.status === 4).length
    const balon = prospectos.filter((p) => p.status === 5).length
    return { total, nuevos, enProceso, cerrados, noContesta, balon }
  }, [prospectos])

  // --- Modal editar venta/folio ---
  const abrirModalEdicion = (p: Prospecto) => {
    setEditProspecto(p)
    setEditFolio(p.folio ?? '')
    setEditVenta(p.venta != null ? String(p.venta) : '')
    setEditComentarios(p.comentarios ?? '')
    setOpenEdit(true)
  }

  const cerrarModalEdicion = () => {
    setOpenEdit(false)
    setEditProspecto(null)
  }

  const guardarEdicion = async () => {
  if (!editProspecto) return

  try {
    setLoading(true)
    const body = {
      folio: editFolio || null,
      venta: editVenta !== '' ? Number(editVenta) : null,
      comentarios: editComentarios || null,
    }

    const resp = await actualizarVentaProspecto(editProspecto.id, body)

    if (!resp.ok) {
      showSnackbar(resp.msg || 'No se pudieron guardar los datos', 'error')
      return
    }

    setProspectos((prev) =>
      prev.map((p) =>
        p.id === editProspecto.id ? { ...p, ...resp.data } : p
      )
    )

    showSnackbar('Datos de venta actualizados correctamente', 'success')
    cerrarModalEdicion()
  } catch (e: any) {
    console.error(e)
    const msg =
      e?.response?.data?.msg || e.message || 'Error al guardar los datos de venta'
    showSnackbar(msg, 'error')
  } finally {
    setLoading(false)
  }
}

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Prospectos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza y administra el estado de los leads cargados al sistema.
          </Typography>
        </Box>
          <Button
            variant="contained"
            onClick={handleTomarProspectosLibres}
            disabled={loading}
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1.3,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0px 3px 12px rgba(25,118,210,0.35)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: '0px 5px 14px rgba(21,101,192,0.45)',
              },
            }}
          >
            Tomar prospectos 
          </Button>
      </Stack>

      {/* Chips resumen */}
      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
        <Chip label={`Total: ${resumen.total}`} size="small" />
        <Chip label={`Nuevos: ${resumen.nuevos}`} size="small" color="info" />
        <Chip label={`En proceso: ${resumen.enProceso}`} size="small" color="warning" />
        <Chip label={`Cerrados: ${resumen.cerrados}`} size="small" color="success" />
        <Chip label={`No contesta: ${resumen.noContesta}`} size="small" />
        <Chip label={`Balón: ${resumen.balon}`} size="small" color="error" />
      </Stack>

      {/* Barra de filtros */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          columnGap: 1.5,
          flexWrap: 'nowrap',
        }}
      >
        <TextField
          label="Buscar por nombre, teléfono, correo, origen, folio..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ width: 170, whiteSpace: 'nowrap' }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(Number(e.target.value))}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleApplyFilters}
          disabled={loading}
          sx={{
            ml: 0.5,
            px: 2.5,
            height: 40,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            backgroundColor: (theme) => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.primary.dark,
              boxShadow: 'none',
            },
          }}
        >
          {loading ? 'Aplicando…' : 'Aplicar'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" variant="body2" mb={1}>
          {error}
        </Typography>
      )}

      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <CircularProgress size={18} />
          <Typography variant="body2">Cargando datos…</Typography>
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
                <TableCell>Nombre</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Folio</TableCell>
                <TableCell>Venta</TableCell>
                <TableCell>Fecha alta</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cambiar status</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.usuario || '-'}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.correo}</TableCell>
                  <TableCell>{p.origen || '-'}</TableCell>
                  <TableCell>{p.folio || '-'}</TableCell>
                  <TableCell>{formatCurrency(p.venta)}</TableCell>
                  <TableCell>
                    {p.fechaAlta ? new Date(p.fechaAlta).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>{renderStatusChip(p.status)}</TableCell>
                  <TableCell>
                    <FormControl
                      size="small"
                      sx={{ minWidth: 160 }}
                      disabled={!esMaster && [3, 4, 5].includes(p.status)}   // 👈 regla visual
                    >
                      <Select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, Number(e.target.value))}
                      >
                        <MenuItem value={1}>Nuevo</MenuItem>
                        <MenuItem value={2}>En proceso</MenuItem>
                        <MenuItem value={3}>Cerrado</MenuItem>
                        <MenuItem value={4}>No contesta</MenuItem>
                        <MenuItem value={5}>Balón</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
              <Stack direction="row" spacing={0.5}>
                {/* Botón editar venta (ya lo tenías) */}
                <Tooltip
                  title={
                    !esMaster && [3, 4, 5].includes(p.status)
                      ? 'Lead en estado final, no editable'
                      : 'Editar datos de venta'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => abrirModalEdicion(p)}
                      disabled={!esMaster && [3, 4, 5].includes(p.status)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* 🔹 NUEVO: Asignar manualmente (solo master) */}
                {esMaster && (
                  <Tooltip title="Asignar manualmente a un usuario de ventas">
                    <span>
                      {esMaster && (
                        <Tooltip title="">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalAsignar(p)}
                            >
                              <PersonAddAlt1OutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </span>
                  </Tooltip>
                )}

                  <Tooltip title="Ver / agregar notas">
                    <IconButton size="small" onClick={() => abrirModalNotas(p)}>
                      <ChatBubbleOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
              </Stack>
          </TableCell>
                </TableRow>
              ))}

              {!loading && paginados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay prospectos para mostrar.
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

      {/* Modal editar folio / venta / comentarios */}
      <Dialog open={openEdit} onClose={cerrarModalEdicion} maxWidth="sm" fullWidth>
        <DialogTitle>Editar datos de venta</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Folio"
              fullWidth
              value={editFolio}
              onChange={(e) => setEditFolio(e.target.value)}
            />
            <TextField
              label="Monto de venta"
              type="number"
              fullWidth
              value={editVenta}
              onChange={(e) => setEditVenta(e.target.value)}
            />
            <TextField
              label="Comentarios"
              fullWidth
              multiline
              minRows={3}
              value={editComentarios}
              onChange={(e) => setEditComentarios(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalEdicion}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEdicion} disabled={loading}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

            {/* Modal asignar manualmente a usuario de ventas (solo master) */}
      <Dialog open={openAssign} onClose={cerrarModalAsignar} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar prospecto a usuario de ventas</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {assignProspecto && (
              <Box>
                <Typography variant="subtitle2">
                  Prospecto: {assignProspecto.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignProspecto.correo} · {assignProspecto.telefono}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Origen: {assignProspecto.origen || '-'}
                </Typography>
              </Box>
            )}
            <Autocomplete<UsuarioCatalogo>
                  options={usuariosVentas}
                  loading={loadingUsuarios}
                  getOptionLabel={(option) =>
                    `${option.nombre} ${option.apellido} — ${option.correo}`
                  }
                  // valor actual según el id guardado
                  value={
                    usuariosVentas.find((u) => u.id === selectedUserId) || null
                  }
                  onChange={(_event, newValue) => {
                    setSelectedUserId(newValue ? newValue.id : null)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuario de ventas"
                      size="small"
                      placeholder="Buscar por nombre o correo..."
                    />
                  )}
                />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalAsignar}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={guardarAsignacion}
            disabled={loading || loadingUsuarios}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

        {/* MODAL DE NOTAS */}
      <Dialog
        open={openNotas}
        onClose={() => setOpenNotas(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Notas del prospecto {prospectoNotas?.nombre ?? ''}
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
          }}
        >
          {/* Chat de notas */}
          <Box
            sx={{
              maxHeight: 320,
              overflowY: 'auto',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1.5,
              bgcolor: 'background.default',
            }}
          >
            {loadingNotas && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">Cargando notas…</Typography>
              </Stack>
            )}

            {!loadingNotas && notas.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Aún no hay notas para este prospecto.
              </Typography>
            )}

            {!loadingNotas &&
              notas.map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    mb: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: n.idUser === user?.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      p: 1,
                      borderRadius: 2,
                      bgcolor:
                        n.idUser === user?.id
                          ? 'primary.main'
                          : 'grey.100',
                      color:
                        n.idUser === user?.id
                          ? 'primary.contrastText'
                          : 'text.primary',
                    }}
                  >
                    {/* Texto de la nota */}
                    {n.nota && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {n.nota}
                      </Typography>
                    )}

                    {/* Enlace al PDF si existe url */}
                    {n.url && (
                      <Box mt={0.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          color={n.idUser === user?.id ? 'inherit' : 'primary'}
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver archivo
                        </Button>
                      </Box>
                    )}

                    {/* Footer: usuario y fecha */}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                      }}
                    >
                      {n.usuario} ·{' '}
                      {new Date(n.create_at).toLocaleString('es-MX')}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>

          {/* Nueva nota + archivo */}
          <Stack spacing={1.5}>
            <TextField
              label="Escribe una nota"
              multiline
              minRows={2}
              fullWidth
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
            />

            <Button
              component="label"
              variant="outlined"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Adjuntar PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) =>
                  setArchivo(e.target.files?.[0] ?? null)
                }
              />
            </Button>

            {archivo && (
              <Typography variant="caption" color="text.secondary">
                Archivo seleccionado: {archivo.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenNotas(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarNota}
            disabled={guardandoNota || (!notaTexto.trim() && !archivo)}
          >
            {guardandoNota ? 'Guardando…' : 'Guardar nota'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
