import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
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

import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

// ✅ servicios (ajusta rutas/nombres a tu proyecto)
import {
  getProspectosByUser,
  getNotasByRegNota,
  crearNotaByRegNota,
  actualizarStatusProspecto,
  asignarProspectoManual,
} from '../../../services/ventasService'

type UsuarioCatalogo = {
  id: number
  nombre: string
  apellido: string
  correo: string
}

type Prospecto = {
  id: number
  idUser: number | null
  nombre: string
  telefono: string | number
  correo: string
  folio?: string | null
  fechaAlta?: string | null
  origen?: string | null
  status: number
  fechaCierre?: string | null
  venta?: number | null
  comentarios?: string | null
  regNota?: string | null
  usuario?: string | null
}

type NotaProsp = {
  id: number
  idUser: number
  regNota: string
  nota?: string | null
  url?: string | null
  create_at: string
  usuario?: string
}

const ROWS_PER_PAGE = 10

const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return '-'
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}

const statusOptions = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Nuevo' },
  { value: 2, label: 'En proceso' },
  { value: 3, label: 'Cerrado' },
  { value: 4, label: 'No contesta' },
  { value: 5, label: 'Balón' },
]

function StatusPill({ status }: { status: number }) {
  const map: Record<number, { label: string; tone: string }> = {
    1: { label: 'Nuevo', tone: 'info.main' },
    2: { label: 'En proceso', tone: 'warning.main' },
    3: { label: 'Cerrado', tone: 'success.main' },
    4: { label: 'No contesta', tone: 'text.secondary' },
    5: { label: 'Balón', tone: 'error.main' },
  }
  const item = map[status] ?? { label: 'Desconocido', tone: 'text.secondary' }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.25,
        borderRadius: 999,
        border: '1px solid',
        borderColor: item.tone,
        color: item.tone,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {item.label}
    </Box>
  )
}

export default function ProspectosTableDemo(props: {
  idUser: number
  esMaster?: boolean
  usuariosVentas?: UsuarioCatalogo[]
  refreshKey?: number
  currentUserId?: number // 👈 id del usuario logueado (quien escribe notas)
}) {
  const esMaster = !!props.esMaster
  const usuariosVentas = props.usuariosVentas ?? []
  const currentUserId = props.currentUserId ?? props.idUser // fallback

  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(0)
  const [page, setPage] = useState(0)

  // snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  })

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success',
  ) => setSnackbar({ open: true, message, severity })

  const handleCloseSnackbar = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  // ✅ Cargar prospectos del usuario
  const loadProspectosUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const resp = await getProspectosByUser(props.idUser)

      if (!resp?.ok) {
        const msg = resp?.msg || 'No se pudieron cargar prospectos del usuario'
        setError(msg)
        showSnackbar(msg, 'error')
        return
      }

      setProspectos(resp.data ?? [])
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al cargar prospectos'
      setError(msg)
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // 🔁 recargar cuando cambia el usuario O refreshKey
  useEffect(() => {
    loadProspectosUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.idUser, props.refreshKey])

  // filtros
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
          String(p.telefono),
          p.correo,
          p.origen ?? '',
          p.folio ?? '',
          p.comentarios ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
    }

    return lista
  }, [prospectos, statusFilter, search])

  const paginados = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filtrados.slice(start, start + ROWS_PER_PAGE)
  }, [filtrados, page])

  // ✅ cambiar status
  const handleStatusChange = async (idProspecto: number, nuevoStatus: number) => {
    try {
      setLoading(true)
      const resp = await actualizarStatusProspecto(idProspecto, nuevoStatus as any)

      if (!resp?.ok) {
        showSnackbar(resp?.msg || 'No se pudo actualizar el status', 'error')
        return
      }

      await loadProspectosUser()

      let msg = 'Status actualizado correctamente'
      if (nuevoStatus === 3) msg = 'Lead marcado como CERRADO'
      if (nuevoStatus === 4) msg = 'Lead marcado como NO CONTESTA'
      if (nuevoStatus === 5) msg = 'Lead marcado como BALÓN y se generó un nuevo registro'

      showSnackbar(msg, 'success')
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al actualizar status'
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ───────────── Notas (por regNota)
  const [openNotas, setOpenNotas] = useState(false)
  const [notas, setNotas] = useState<NotaProsp[]>([])
  const [loadingNotas, setLoadingNotas] = useState(false)
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [notaTexto, setNotaTexto] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [prospectoNotas, setProspectoNotas] = useState<Prospecto | null>(null)

  const cargarNotas = async (regNota: string) => {
    try {
      setLoadingNotas(true)
      const resp = await getNotasByRegNota(regNota)

      if (!resp?.ok) {
        showSnackbar(resp?.msg || 'Error al cargar notas', 'error')
        return
      }

      setNotas(resp.data ?? [])
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al cargar notas'
      showSnackbar(msg, 'error')
    } finally {
      setLoadingNotas(false)
    }
  }

  const abrirModalNotas = async (p: Prospecto) => {
    if (!p.regNota) {
      showSnackbar('Este prospecto no tiene regNota asignado.', 'warning')
      return
    }
    setProspectoNotas(p)
    setOpenNotas(true)
    await cargarNotas(p.regNota)
  }

  const handleGuardarNota = async () => {
    if (!prospectoNotas?.regNota) return

    if (!notaTexto.trim() && !archivo) {
      showSnackbar('Escribe una nota o adjunta un PDF', 'warning')
      return
    }

    try {
      setGuardandoNota(true)

      const formData = new FormData()
      formData.append('idUser', String(currentUserId))
      formData.append('nota', notaTexto.trim())
      if (archivo) formData.append('file', archivo)

      const resp = await crearNotaByRegNota(prospectoNotas.regNota, formData)

      if (!resp?.ok) {
        showSnackbar(resp?.msg || 'No se pudo guardar la nota', 'error')
        return
      }

      await cargarNotas(prospectoNotas.regNota)
      setNotaTexto('')
      setArchivo(null)
      showSnackbar('Nota guardada correctamente', 'success')
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al guardar nota'
      showSnackbar(msg, 'error')
    } finally {
      setGuardandoNota(false)
    }
  }

  // ───────────── Asignación manual (opcional)
  const [openAssign, setOpenAssign] = useState(false)
  const [assignProspecto, setAssignProspecto] = useState<Prospecto | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const abrirModalAsignar = (p: Prospecto) => {
    if (!esMaster) return
    setAssignProspecto(p)
    setSelectedUserId(null)
    setOpenAssign(true)
  }

  const guardarAsignacion = async () => {
    if (!assignProspecto || !selectedUserId) {
      showSnackbar('Selecciona un usuario de ventas.', 'warning')
      return
    }
    try {
      setLoading(true)
      const resp = await asignarProspectoManual(assignProspecto.id, Number(selectedUserId))
      if (!resp?.ok) {
        showSnackbar(resp?.msg || 'No se pudo asignar el prospecto', 'error')
        return
      }
      showSnackbar('Prospecto asignado correctamente.', 'success')
      setOpenAssign(false)
      await loadProspectosUser()
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al asignar'
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* ✅ OMITIDO: Header / chips / botón tomar prospectos */}

      {/* Filtros */}
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
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ width: 170, whiteSpace: 'nowrap' }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(Number(e.target.value))
              setPage(0)
            }}
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
          onClick={() => loadProspectosUser()}
          disabled={loading}
          sx={{ ml: 0.5, px: 2.5, height: 40, textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Cargando…' : 'Actualizar'}
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
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.correo}</TableCell>
                  <TableCell>{p.origen || '-'}</TableCell>
                  <TableCell>{p.folio || '-'}</TableCell>
                  <TableCell>{formatCurrency(p.venta ?? null)}</TableCell>
                  <TableCell>{p.fechaAlta ? new Date(p.fechaAlta).toLocaleDateString() : '-'}</TableCell>

                  <TableCell>
                    <StatusPill status={p.status} />
                  </TableCell>

                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
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
                      <Tooltip title="Editar datos de venta (por conectar si quieres)">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => showSnackbar('Edición: pendiente', 'info')}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {esMaster && usuariosVentas.length > 0 && (
                        <Tooltip title="Asignar manualmente">
                          <span>
                            <IconButton size="small" onClick={() => abrirModalAsignar(p)}>
                              <PersonAddAlt1OutlinedIcon fontSize="small" />
                            </IconButton>
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
                  <TableCell colSpan={10} align="center">
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelRowsPerPage="Registros por página"
        />
      </Paper>

      {/* Modal asignar manual */}
      <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar prospecto a usuario de ventas</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {assignProspecto && (
              <Box>
                <Typography variant="subtitle2">Prospecto: {assignProspecto.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignProspecto.correo} · {assignProspecto.telefono}
                </Typography>
              </Box>
            )}

            <Autocomplete<UsuarioCatalogo>
              options={usuariosVentas}
              getOptionLabel={(option) => `${option.nombre} ${option.apellido} — ${option.correo}`}
              value={usuariosVentas.find((u) => u.id === selectedUserId) || null}
              onChange={(_event, newValue) => setSelectedUserId(newValue ? newValue.id : null)}
              renderInput={(params) => (
                <TextField {...params} label="Usuario de ventas" size="small" placeholder="Buscar..." />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarAsignacion} disabled={loading}>
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal notas */}
      <Dialog open={openNotas} onClose={() => setOpenNotas(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notas del prospecto {prospectoNotas?.nombre ?? ''}</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
                <Box key={n.id} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {n.nota && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {n.nota}
                      </Typography>
                    )}

                    {n.url && (
                      <Box mt={0.5}>
                        <Button size="small" variant="outlined" href={n.url} target="_blank">
                          Ver archivo
                        </Button>
                      </Box>
                    )}

                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, opacity: 0.75 }}>
                      {n.usuario ?? `Usuario #${n.idUser}`} · {new Date(n.create_at).toLocaleString('es-MX')}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>

          <Stack spacing={1.5}>
            <TextField
              label="Escribe una nota"
              multiline
              minRows={2}
              fullWidth
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
            />

            <Button component="label" variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
              Adjuntar PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
