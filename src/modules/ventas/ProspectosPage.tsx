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
  Checkbox,
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
} from '../../services/ventasService'

import {
  getUsuariosVentas,
  getStatusByEmpresa,
  type UsuarioCatalogo,
  type StatusCatalogo,
} from '../../services/catalogosService'

const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return '-'
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}

const ROWS_PER_PAGE = 10

function renderStatusChip(status: number, statusCatalogo: StatusCatalogo[]) {
  let color: 'default' | 'warning' | 'info' | 'success' | 'error' = 'default'
  const statusItem = statusCatalogo.find((s) => s.idStatus === status)
  const label = statusItem?.status ?? 'Desconocido'

  switch (status) {
    case 1:
      color = 'info'
      break
    case 2:
      color = 'warning'
      break
    case 3:
      color = 'success'
      break
    case 4:
      color = 'default'
      break
    case 5:
      color = 'error'
      break
    default:
      color = 'default'
  }

  return <Chip size="small" color={color} label={label} />
}

function formatRemainingTime(targetDate?: string | null) {
  if (!targetDate) return '-'

  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now

  if (diff <= 0) return 'Vencido'

  const totalMinutes = Math.floor(diff / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getCountdownInfo(p: Prospecto) {
  if (p.status === 4 && p.noContExpiresAt) {
    return {
      label: formatRemainingTime(p.noContExpiresAt),
      type: 'noContesta' as const,
    }
  }

  if (p.status === 1 && p.primerContactoExpiresAt && p.idUser) {
    return {
      label: formatRemainingTime(p.primerContactoExpiresAt),
      type: 'primerContacto' as const,
    }
  }

  return {
    label: '-',
    type: 'none' as const,
  }
}

export default function ProspectosPage() {
  const [, setNowTick] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const [user, setUser] = useState<any | null>(null)
  const [statusCatalogo, setStatusCatalogo] = useState<StatusCatalogo[]>([])
  const [loadingStatus, setLoadingStatus] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    const cargarStatus = async () => {
      const loggedUser = getUser()

      if (!loggedUser?.idEmpresa) return

      try {
        setLoadingStatus(true)
        const data = await getStatusByEmpresa(loggedUser.idEmpresa)
        setStatusCatalogo(data)
      } catch (error) {
        console.error('Error al cargar status:', error)
      } finally {
        setLoadingStatus(false)
      }
    }

    cargarStatus()
  }, [])

  const esMaster = user?.idRol === 1
  const esAdmin = user?.idRol === 2

  const [openAssign, setOpenAssign] = useState(false)
  const [assignProspecto, setAssignProspecto] = useState<Prospecto | null>(null)
  const [usuariosVentas, setUsuariosVentas] = useState<UsuarioCatalogo[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)

  const [selectedProspectos, setSelectedProspectos] = useState<number[]>([])
  const [openBulkAssign, setOpenBulkAssign] = useState(false)
  const [bulkUserId, setBulkUserId] = useState<number | null>(null)

  const [openNotas, setOpenNotas] = useState(false)
  const [notas, setNotas] = useState<NotaProspecto[]>([])
  const [notaTexto, setNotaTexto] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [loadingNotas, setLoadingNotas] = useState(false)
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [prospectoNotas, setProspectoNotas] = useState<Prospecto | null>(null)

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

  const [openEdit, setOpenEdit] = useState(false)
  const [editProspecto, setEditProspecto] = useState<Prospecto | null>(null)
  const [editFolio, setEditFolio] = useState('')
  const [editVenta, setEditVenta] = useState<string>('')
  const [editComentarios, setEditComentarios] = useState('')

  const statusOptions = useMemo(() => {
    return [
      { value: 0, label: 'Todos' },
      ...statusCatalogo.map((s) => ({
        value: s.idStatus,
        label: s.status,
      })),
    ]
  }, [statusCatalogo])

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
    if (!esMaster && !esAdmin) return

    if (!user?.idEmpresa) {
      showSnackbar('No se encontró la empresa del usuario logueado', 'error')
      return
    }

    try {
      setLoadingUsuarios(true)
      setAssignProspecto(p)
      setSelectedUserId(null)

      const data = await getUsuariosVentas(user.idEmpresa)
      setUsuariosVentas(data)
      setOpenAssign(true)
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.msg || e.message || 'Error al cargar usuarios de ventas'
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

  const visibleIds = useMemo(() => paginados.map((p) => p.id), [paginados])

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedProspectos.includes(id))

  const someVisibleSelected =
    visibleIds.some((id) => selectedProspectos.includes(id)) &&
    !allVisibleSelected

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedProspectos((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      )
      return
    }

    setSelectedProspectos((prev) =>
      prev.filter((id) => !visibleIds.includes(id))
    )
  }

  const toggleSelectProspecto = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProspectos((prev) => Array.from(new Set([...prev, id])))
      return
    }

    setSelectedProspectos((prev) => prev.filter((item) => item !== id))
  }

  const abrirAsignacionMultiple = async () => {
    if (!esMaster && !esAdmin) return

    if (selectedProspectos.length === 0) {
      showSnackbar('Selecciona al menos un prospecto.', 'warning')
      return
    }

    if (!user?.idEmpresa) {
      showSnackbar('No se encontró la empresa del usuario logueado', 'error')
      return
    }

    try {
      setLoadingUsuarios(true)
      setBulkUserId(null)

      const data = await getUsuariosVentas(user.idEmpresa)
      setUsuariosVentas(data)
      setOpenBulkAssign(true)
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.msg ||
        e.message ||
        'Error al cargar usuarios de ventas'
      showSnackbar(msg, 'error')
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const cerrarAsignacionMultiple = () => {
    setOpenBulkAssign(false)
    setBulkUserId(null)
  }

  const guardarAsignacionMultiple = async () => {
    if (!bulkUserId) {
      showSnackbar('Selecciona un usuario de ventas.', 'warning')
      return
    }

    if (selectedProspectos.length === 0) {
      showSnackbar('Selecciona al menos un prospecto.', 'warning')
      return
    }

    try {
      setLoading(true)

      const results = await Promise.all(
        selectedProspectos.map((idProspecto) =>
          asignarProspectoManual(idProspecto, Number(bulkUserId))
        )
      )

      const failed = results.find((resp) => !resp.ok)

      if (failed) {
        showSnackbar(
          failed.msg || 'Uno o más prospectos no se pudieron asignar',
          'error'
        )
        return
      }

      showSnackbar('Prospectos asignados correctamente.', 'success')
      setSelectedProspectos([])
      cerrarAsignacionMultiple()
      await loadProspectos()
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.msg || e.message || 'Error al asignar prospectos'
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, nuevoStatus: number) => {
    try {
      setLoading(true)
      const resp = await actualizarStatusProspecto(id, nuevoStatus as any)

      if (!resp.ok) {
        showSnackbar(resp.msg || 'No se pudo actualizar el status', 'error')
        return
      }

      await loadProspectos()

      const statusLabel =
        statusCatalogo.find((s) => s.idStatus === nuevoStatus)?.status ??
        'Status actualizado'

      let msg = `Lead marcado como ${statusLabel}`

      if (nuevoStatus === 5) {
        msg = `Lead marcado como ${statusLabel} y se generó un nuevo registro`
      }

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

  const resumenStatus = useMemo(() => {
  return statusCatalogo.map((s) => ({
    idStatus: s.idStatus,
    status: s.status,
    total: prospectos.filter((p) => p.status === s.idStatus).length,
  }))
}, [prospectos, statusCatalogo])

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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Prospectos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza y administra el estado de los leads cargados al sistema.
          </Typography>
        </Box>
      </Stack>
<Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
  <Chip label={`Total: ${prospectos.length}`} size="small" />

  {resumenStatus.map((item) => (
    <Chip
      key={item.idStatus}
      label={`${item.status}: ${item.total}`}
      size="small"
      color={
        item.idStatus === 1
          ? 'info'
          : item.idStatus === 2
          ? 'warning'
          : item.idStatus === 3
          ? 'success'
          : item.idStatus === 5
          ? 'error'
          : 'default'
      }
    />
  ))}
</Stack>

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
            disabled={loadingStatus}
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

      {(esMaster || esAdmin) && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Prospectos seleccionados:{' '}
            <strong>{selectedProspectos.length}</strong>
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={selectedProspectos.length === 0 || loading}
              onClick={() => setSelectedProspectos([])}
            >
              Limpiar selección
            </Button>

            <Button
              variant="contained"
              disabled={selectedProspectos.length === 0 || loading}
              onClick={abrirAsignacionMultiple}
            >
              Asignar seleccionados
            </Button>
          </Stack>
        </Paper>
      )}

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
                {(esMaster || esAdmin) && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allVisibleSelected}
                      indeterminate={someVisibleSelected}
                      onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                    />
                  </TableCell>
                )}
                <TableCell>Nombre</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Último usuario</TableCell>
                <TableCell>Tiempo restante</TableCell>
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
              {paginados.map((p) => {
                const countdown = getCountdownInfo(p)

                return (
                  <TableRow key={p.id} hover>
                    {(esMaster || esAdmin) && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProspectos.includes(p.id)}
                          onChange={(e) =>
                            toggleSelectProspecto(p.id, e.target.checked)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{p.usuario || '-'}</TableCell>
                    <TableCell>{p.ultimoUsuario?.trim() ? p.ultimoUsuario : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={countdown.label}
                        color={
                          countdown.label === 'Vencido'
                            ? 'error'
                            : countdown.type === 'noContesta'
                            ? 'warning'
                            : countdown.type === 'primerContacto'
                            ? 'info'
                            : 'default'
                        }
                        variant={countdown.label === '-' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>{p.telefono}</TableCell>
                    <TableCell>{p.correo}</TableCell>
                    <TableCell>{p.origen || '-'}</TableCell>
                    <TableCell>{p.folio || '-'}</TableCell>
                    <TableCell>{formatCurrency(p.venta)}</TableCell>
                    <TableCell>
                      {p.fechaAlta ? new Date(p.fechaAlta).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{renderStatusChip(p.status, statusCatalogo)}</TableCell>
                    <TableCell>
                      <FormControl
                        size="small"
                        sx={{ minWidth: 160 }}
                        disabled={!esMaster && !esAdmin && [3, 4, 5].includes(p.status)}
                      >
                        <Select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, Number(e.target.value))}
                          disabled={loadingStatus}
                        >
                          {statusCatalogo.map((s) => (
                            <MenuItem key={s.id} value={s.idStatus}>
                              {s.status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip
                          title={
                            !esMaster && !esAdmin && [3, 4, 5].includes(p.status)
                              ? 'Lead en estado final, no editable'
                              : 'Editar datos de venta'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => abrirModalEdicion(p)}
                              disabled={!esMaster && !esAdmin && [3, 4, 5].includes(p.status)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {(esMaster || esAdmin) && (
                          <Tooltip title="Asignar manualmente a un usuario de ventas">
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

                        <Tooltip title="Ver / agregar notas">
                          <IconButton size="small" onClick={() => abrirModalNotas(p)}>
                            <ChatBubbleOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}

              {!loading && paginados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={(esMaster || esAdmin) ? 14 : 13} align="center">
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

      <Dialog
        open={openBulkAssign}
        onClose={cerrarAsignacionMultiple}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Asignar prospectos seleccionados</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Se asignarán <strong>{selectedProspectos.length}</strong>{' '}
              prospectos al usuario seleccionado.
            </Typography>

            <Autocomplete<UsuarioCatalogo>
              options={usuariosVentas}
              loading={loadingUsuarios}
              getOptionLabel={(option) =>
                `${option.nombre} ${option.apellido} — ${option.correo}`
              }
              value={usuariosVentas.find((u) => u.id === bulkUserId) || null}
              onChange={(_event, newValue) => {
                setBulkUserId(newValue ? newValue.id : null)
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
          <Button onClick={cerrarAsignacionMultiple}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={guardarAsignacionMultiple}
            disabled={loading || loadingUsuarios}
          >
            Asignar prospectos
          </Button>
        </DialogActions>
      </Dialog>

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
                    {n.nota && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {n.nota}
                      </Typography>
                    )}

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