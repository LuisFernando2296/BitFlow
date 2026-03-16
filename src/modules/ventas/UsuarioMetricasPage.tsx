// src/modules/ventas/UsuarioMetricasPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUser } from '../../services/authService'
import {
  Box,
  /* Button, */
  Chip,
  CircularProgress,
  /* Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem, */
  Paper,
  /* Select, */
  Stack,
  /* TextField, */
  Typography,
} from '@mui/material'

import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
/* import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined' */
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined'

import ProspectosTableDemo from './components/ProspectosTableDemo'
import {
  getMetricasUsuario,
  /* getProspectosLibresCount, */
  /* asignarProspectosMasivo, */
} from '../../services/ventasService'

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

type MetricasResp = {
  ok: boolean
  msg?: string
  data?: {
    user: { id: number; nombre: string; correo: string }
    equipo: string
    metricas: {
      ventasTotal: number
      ventasMes: number
      comisionSemana: number
      conversionPct: number
    }
    estadoLeads: {
      total: number
      nuevos: number
      enProceso: number
      cerrados: number
      noContesta: number
      balon: number
    }
  }
}

/* type ProspectosConteos = {
  totales: number
  libres: number
  remarcados: number
} */

/* type ModoAsignacion = 'totales' | 'libres' | 'remarcados' */

export default function UsuarioMetricasPage() {
  const { idUser } = useParams()
  const userIdNum = Number(idUser)

  // ───────────────────────── API state ─────────────────────────
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metricas, setMetricas] = useState<MetricasResp['data'] | null>(null)

  const loadMetricas = async () => {
    if (!userIdNum || Number.isNaN(userIdNum)) {
      setError('ID de usuario inválido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const resp: MetricasResp = await getMetricasUsuario(userIdNum)

      if (!resp.ok || !resp.data) {
        setError(resp.msg || 'No se pudieron cargar las métricas')
        return
      }

      setMetricas(resp.data)
    } catch (e: any) {
      const msg = e?.response?.data?.msg || e.message || 'Error al cargar métricas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ───────────────────────── Usuario actual (para notas/acciones) ─────────────────────────
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  useEffect(() => {
    setCurrentUser(getUser())
  }, [])

  const currentUserId = currentUser?.id ?? userIdNum

  useEffect(() => {
    loadMetricas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdNum])

  // ───────────────────────── Header fallback UI values ─────────────────────────
  const headerUser = useMemo(() => {
    if (!metricas) {
      return {
        id: userIdNum || 0,
        nombre: '-',
        correo: '-',
        equipo: '-',
        puesto: 'Usuario de ventas',
      }
    }
    return {
      id: metricas.user.id,
      nombre: metricas.user.nombre,
      correo: metricas.user.correo,
      equipo: metricas.equipo || '-',
      puesto: 'Usuario de ventas',
    }
  }, [metricas, userIdNum])

  const cards = useMemo(() => {
    if (!metricas) {
      return {
        ventasTotal: 0,
        ventasMes: 0,
        comisionSemana: 0,
        conversionPct: 0,
      }
    }
    return metricas.metricas
  }, [metricas])

  const estado = useMemo(() => {
    if (!metricas) {
      return {
        total: 0,
        nuevos: 0,
        enProceso: 0,
        cerrados: 0,
        noContesta: 0,
        balon: 0,
      }
    }
    return metricas.estadoLeads
  }, [metricas])

  // ───────────────────────── Snackbar ─────────────────────────
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', severity: 'success' })

  /* const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success',
  ) => setSnackbar({ open: true, message, severity }) */

  const closeSnackbar = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((p) => ({ ...p, open: false }))
  }

  // ───────────────────────── Conteos disponibles (totales/libres/remarcados) ─────────────────────────
  /* const [conteosDisponibles, setConteosDisponibles] = useState<ProspectosConteos>({
    totales: 0,
    libres: 0,
    remarcados: 0,
  })
  const [loadingDisponibles, setLoadingDisponibles] = useState(false) */

  /* const loadDisponibles = async () => {
    try {
      setLoadingDisponibles(true)
      const resp = await getProspectosLibresCount()
      if (resp.ok) setConteosDisponibles(resp.data)
    } catch (e: any) {
      showSnackbar(e?.response?.data?.msg || e.message || 'Error al cargar conteos', 'error')
    } finally {
      setLoadingDisponibles(false)
    }
  } */

  /* useEffect(() => {
    loadDisponibles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) */

  // ───────────────────────── Asignación masiva ─────────────────────────
  /* const [openAsignar, setOpenAsignar] = useState(false)
  const [asignando, setAsignando] = useState(false)

  const [modoAsignacion, setModoAsignacion] = useState<ModoAsignacion>('totales')
  const [cantidadAsignar, setCantidadAsignar] = useState<number>(10) */

  /* const disponiblesActuales = useMemo(() => {
    if (modoAsignacion === 'totales') return conteosDisponibles.totales
    if (modoAsignacion === 'libres') return conteosDisponibles.libres
    return conteosDisponibles.remarcados
  }, [modoAsignacion, conteosDisponibles])

  const labelDisponibles = useMemo(() => {
    if (modoAsignacion === 'totales') return 'Leads totales'
    if (modoAsignacion === 'libres') return 'Leads libres'
    return 'Leads remarcados'
  }, [modoAsignacion]) */

  // refrescar tabla
   const [refreshKey] = useState(0)
  /* const [refreshKey, setRefreshKey] = useState(0) */

  /* const handleAsignarMasivo = async () => {
    if (!userIdNum || !cantidadAsignar) return

    if (cantidadAsignar > disponiblesActuales) {
      showSnackbar(`Solo hay ${disponiblesActuales} disponibles en esta opción.`, 'warning')
      return
    }

    try {
      setAsignando(true)

      const resp = await asignarProspectosMasivo({
        idUser: userIdNum,
        cantidad: cantidadAsignar,
        modo: modoAsignacion,
      })

      if (!resp.ok) {
        showSnackbar(resp?.msg || 'No se pudo asignar', 'error')
        return
      }

      showSnackbar(resp.msg || 'Asignación realizada', 'success')

      // ✅ backend regresa conteos actualizados
      if (resp.data?.conteos) setConteosDisponibles(resp.data.conteos)

      setOpenAsignar(false)

      // recargar métricas y refrescar tabla
      await loadMetricas()
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      showSnackbar(e?.response?.data?.msg || e.message || 'Error al asignar prospectos', 'error')
    } finally {
      setAsignando(false)
    }
  } */

  return (
    <Box p={3} maxWidth="xl" mx="auto">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={800}>
              Métricas de usuario
            </Typography>

            <Chip
              icon={<PersonOutlineOutlinedIcon />}
              label={`ID: ${headerUser.id}`}
              size="small"
              variant="outlined"
            />

            <Chip
              icon={<Groups2OutlinedIcon />}
              label={headerUser.equipo}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {headerUser.nombre} · {headerUser.puesto} · {headerUser.correo}
          </Typography>

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Cargando métricas…
              </Typography>
            </Stack>
          )}

          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </Stack>

        {/* <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => {
              setOpenAsignar(true)
              loadDisponibles()
            }}
            sx={{ textTransform: 'none' }}
          >
            Asignar prospectos
          </Button>
        </Stack> */}
      </Stack>

      {/* Cards métricas */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2}>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <PaidOutlinedIcon fontSize="small" />
            <Typography fontWeight={700}>Ventas</Typography>
          </Stack>
          <Typography variant="h6" fontWeight={900}>
            {money(Number(cards.ventasTotal || 0))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total histórico
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <TrendingUpOutlinedIcon fontSize="small" />
            <Typography fontWeight={700}>Ventas del mes</Typography>
          </Stack>
          <Typography variant="h6" fontWeight={900}>
            {money(Number(cards.ventasMes || 0))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acumulado del mes actual
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <PaidOutlinedIcon fontSize="small" />
            <Typography fontWeight={700}>Comisiones semana</Typography>
          </Stack>
          <Typography variant="h6" fontWeight={900}>
            {money(Number(cards.comisionSemana || 0))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Semana en curso
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <QueryStatsOutlinedIcon fontSize="small" />
            <Typography fontWeight={700}>Conversión</Typography>
          </Stack>
          <Typography variant="h6" fontWeight={900}>
            {Number(cards.conversionPct || 0)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cerrados / total leads
          </Typography>
        </Paper>
      </Stack>

      {/* Leads resumen */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <CheckCircleOutlineOutlinedIcon fontSize="small" />
          <Typography fontWeight={800}>Estado de leads</Typography>
          <Box flexGrow={1} />
          <Chip label={`Total leads: ${estado.total}`} size="small" />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <Chip label={`Leads nuevos: ${estado.nuevos}`} color="info" variant="filled" />
          <Chip label={`Leads en proceso: ${estado.enProceso}`} color="warning" variant="filled" />
          <Chip label={`Leads cerrados: ${estado.cerrados}`} color="success" variant="filled" />
          <Chip label={`No contesta: ${estado.noContesta}`} variant="outlined" />
          <Chip label={`Balón: ${estado.balon}`} color="secondary" variant="filled" />
        </Stack>
      </Paper>

      {/* Tabla prospectos del usuario */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <ProspectosTableDemo
          idUser={userIdNum}
          esMaster={true}
          currentUserId={currentUserId}
          refreshKey={refreshKey}
        />
      </Paper>

      {/* Aside conteo dinámico */}
      {/* <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Box>
            <Typography fontWeight={900}>Prospectos disponibles</Typography>
            <Typography variant="body2" color="text.secondary">
              {labelDisponibles}
            </Typography>
          </Box>

          <Box flexGrow={1} />

          <Chip
            label={`Disponibles: ${loadingDisponibles ? '...' : disponiblesActuales}`}
            size="small"
          />

          {<Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            sx={{ textTransform: 'none' }}
            onClick={() => {
              setOpenAsignar(true)
              loadDisponibles()
            }}
          >
            Asignar masivamente a {headerUser.nombre.split(' ')[0] || 'usuario'}
          </Button>}
        </Stack>
      </Paper> */}

      {/* Modal asignación masiva */}
      {/* <Dialog open={openAsignar} onClose={() => setOpenAsignar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar prospectos a {headerUser.nombre}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Chip
              label={`Disponibles en esta opción: ${loadingDisponibles ? '...' : disponiblesActuales}`}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Modo de asignación</InputLabel>
              <Select
                label="Modo de asignación"
                value={modoAsignacion}
                onChange={(e) => {
                  const next = e.target.value as ModoAsignacion
                  setModoAsignacion(next)
                  setCantidadAsignar(10)
                }}
              >
                <MenuItem value="totales">Leads totales</MenuItem>
                <MenuItem value="libres">Leads libres</MenuItem>
                <MenuItem value="remarcados">Leads remarcados</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Cantidad a asignar"
              type="number"
              value={cantidadAsignar}
              onChange={(e) => setCantidadAsignar(Number(e.target.value))}
              inputProps={{ min: 1, max: disponiblesActuales }}
              helperText={`Máximo disponible: ${disponiblesActuales}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAsignar(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAsignarMasivo}
            disabled={asignando || disponiblesActuales === 0}
          >
            {asignando ? 'Asignando…' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog> */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
