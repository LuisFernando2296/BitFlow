import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  TextField,
  Button,
  Checkbox,
  IconButton,
  CircularProgress,
} from '@mui/material'

import type { Theme } from '@mui/material/styles'

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'

import { getUser } from '../../services/authService'
import type { User } from '../../services/authService'
import { useNotes } from './hooks/useNotes'

// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// Calendario MUI X
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'

// =====================================================
// Tipos y configuración de roles
// =====================================================
type UserRole = 'master' | 'adminVentas' | 'usuarioVentas'
const currentRole: UserRole = 'master'

const ROLE_LABEL: Record<UserRole, string> = {
  master: 'Administrador maestro',
  adminVentas: 'Administrador de ventas',
  usuarioVentas: 'Usuario de ventas',
}

// =====================================================
// Datos mock de ejemplo
// =====================================================
const globalMetrics = {
  ventasDia: 530647.54,
  ventasMes: 118236.2,
  ventasTotales: 5306475.43,
  leadsAbiertos: 32,
  leadsCerrados: 17,
}

const rawLeadSources = [
  { name: 'Facebook Ads', value: 120 },
  { name: 'Instagram', value: 90 },
  { name: 'Google Ads', value: 60 },
  { name: 'Sitio Web', value: 45 },
]

const monthlySales = [
  { month: 'Ene', value: 430000 },
  { month: 'Feb', value: 470000 },
  { month: 'Mar', value: 510000 },
  { month: 'Abr', value: 560000 },
  { month: 'May', value: 590000 },
  { month: 'Jun', value: 620000 },
  { month: 'Jul', value: 660000 },
  { month: 'Ago', value: 710000 },
  { month: 'Sep', value: 740000 },
  { month: 'Oct', value: 780000 },
  { month: 'Nov', value: 820000 },
  { month: 'Dic', value: 900000 },
]

const COLORS = {
  primary: '#16A34A',
  primarySoft: 'rgba(22,163,74,0.10)',
  accentPink: '#fb7185',
  accentYellow: '#facc15',
  accentCyan: '#22c7d9',
  darkText: '#0f172a',
  mutedText: '#94a3b8',
}

const PIE_COLORS = ['#22c55e', '#0ea5e9', '#a855f7', '#f97316', '#e11d48']

// =====================================================
// Componentes pequeños reutilizables
// =====================================================
type KpiCardProps = {
  label: string
  value: string
  icon?: ReactNode
  subtitle?: string
  accentColor?: string
  bgAccent?: string
}

function KpiCard({
  label,
  value,
  icon,
  subtitle,
  accentColor = COLORS.primary,
  bgAccent = COLORS.primarySoft,
}: KpiCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
        bgcolor: 'white',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: COLORS.mutedText, fontWeight: 500 }}>
            {label}
          </Typography>

          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: bgAccent,
                color: accentColor,
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.darkText }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  })
}

type LeadDonutProps = {
  label: string
  percent: number
  color: string
}

function LeadDonutCard({ label, percent, color }: LeadDonutProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
        bgcolor: 'white',
        height: '100%',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: COLORS.mutedText, mb: 1 }}>
          {label}
        </Typography>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 90,
            height: 90,
            mx: 'auto',
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={90}
            thickness={4}
            sx={{ color: '#E5E7EB', position: 'absolute' }}
          />
          <CircularProgress
            variant="determinate"
            value={percent}
            size={90}
            thickness={4}
            sx={{ color, position: 'absolute' }}
          />

          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.darkText }}>
              {percent}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// =====================================================
// Página de Dashboard
// =====================================================
export default function DashboardPage() {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const user = getUser() as User | null
  const idUser = Number((user as any)?.id ?? (user as any)?.user?.id ?? 0)

  const { notesQuery, createNoteMutation, updateStatusMutation } = useNotes(idUser)
  const notes = (notesQuery.data ?? []).filter((n) => n.status !== 3)

  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    const text = newNote.trim()
    if (!text || !idUser) return
    createNoteMutation.mutate({ idUser, nota: text })
    setNewNote('')
  }

  const totalLeads = globalMetrics.leadsAbiertos + globalMetrics.leadsCerrados
  const totalLeadSources = rawLeadSources.reduce((acc, s) => acc + s.value, 0)

  const leadSourcePercents = useMemo(
    () =>
      rawLeadSources.map((s) => ({
        ...s,
        percent: totalLeadSources ? Math.round((s.value / totalLeadSources) * 100) : 0,
      })),
    [totalLeadSources],
  )

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        mb={4}
      >
        <Box>
          <Typography variant={isSmall ? 'h5' : 'h4'} fontWeight={800}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.mutedText, mt: 0.5 }}>
            Resumen general de ventas y comportamiento de leads.
          </Typography>
        </Box>

        <Chip
          size="small"
          label={ROLE_LABEL[currentRole]}
          sx={{ bgcolor: COLORS.primarySoft, color: COLORS.primary, fontWeight: 600 }}
        />
      </Stack>

      <Stack spacing={3}>
        {/* Fila 1 – Ventas */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Ventas del día"
              value={formatCurrency(globalMetrics.ventasDia)}
              icon={<TrendingUpRoundedIcon fontSize="small" />}
              subtitle="Monto total registrado hoy"
              accentColor={COLORS.accentYellow}
              bgAccent="rgba(250,204,21,0.15)"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Ventas del mes"
              value={formatCurrency(globalMetrics.ventasMes)}
              icon={<TrendingUpRoundedIcon fontSize="small" />}
              subtitle="Acumulado del mes en curso"
              accentColor={COLORS.accentPink}
              bgAccent="rgba(251,113,133,0.15)"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Ventas totales"
              value={formatCurrency(globalMetrics.ventasTotales)}
              icon={<TrendingUpRoundedIcon fontSize="small" />}
              subtitle="Histórico de ventas registradas"
              accentColor={COLORS.primary}
              bgAccent={COLORS.primarySoft}
            />
          </Box>
        </Stack>

        {/* Fila 2 – Leads */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Leads abiertos"
              value={globalMetrics.leadsAbiertos.toString()}
              icon={<HourglassEmptyRoundedIcon fontSize="small" />}
              subtitle="En seguimiento o pendientes"
              accentColor={COLORS.accentCyan}
              bgAccent="rgba(34,199,217,0.12)"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Leads cerrados"
              value={globalMetrics.leadsCerrados.toString()}
              icon={<CheckCircleRoundedIcon fontSize="small" />}
              subtitle="Ganados o perdidos"
              accentColor={COLORS.accentPink}
              bgAccent="rgba(251,113,133,0.15)"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <KpiCard
              label="Total de leads"
              value={totalLeads.toString()}
              icon={<GroupRoundedIcon fontSize="small" />}
              subtitle="Leads registrados en el sistema"
              accentColor={COLORS.primary}
              bgAccent={COLORS.primarySoft}
            />
          </Box>
        </Stack>

        {/* Origen + Resumen */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
          <Box sx={{ flex: 2, minWidth: 280 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Origen de los leads
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.mutedText, mb: 2, display: 'block' }}>
              Porcentaje de leads por canal de adquisición.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              {leadSourcePercents.map((src, index) => (
                <Box key={src.name} sx={{ flex: 1, minWidth: 160 }}>
                  <LeadDonutCard
                    label={src.name}
                    percent={src.percent}
                    color={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Resumen de leads
                </Typography>

                <Typography variant="body2" sx={{ color: COLORS.mutedText }}>
                  Aquí verás el comportamiento global de tus leads.
                </Typography>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: COLORS.primarySoft }}>
                  <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                    Conversión estimada
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, mt: 0.5 }}>
                    {totalLeads > 0
                      ? `${Math.round((globalMetrics.leadsCerrados / totalLeads) * 100)}%`
                      : '0%'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>

        {/* Gráfica */}
        <Box>
          <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Crecimiento de ventas mensuales
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.mutedText, mb: 2, display: 'block' }}>
                Tendencia de ventas registradas durante el año.
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Calendario + Notas/Tareas */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
          {/* Calendario */}
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Calendario
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.mutedText, mb: 2, display: 'block' }}>
                  Revisa rápidamente fechas importantes.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    sx={{ '& .MuiPickersDay-root.Mui-selected': { bgcolor: COLORS.primary } }}
                  />
                </LocalizationProvider>
              </CardContent>
            </Card>
          </Box>

          {/* Notas/Tareas */}
          <Box sx={{ flex: 1.5, minWidth: 260 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Notas y tareas pendientes
                </Typography>

                <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                  Escribe tus pendientes rápidos del día y márcalos como completados cuando los termines.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
                  <TextField
                    size="small"
                    placeholder="Ej. Llamar a leads de campaña X"
                    fullWidth
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote()
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddNote}
                    disabled={createNoteMutation.isPending || !idUser}
                    sx={{
                      whiteSpace: 'nowrap',
                      bgcolor: COLORS.primary,
                      px: 3,
                      borderRadius: 3,
                      boxShadow: '0 10px 20px rgba(22,163,74,0.18)',
                      '&:hover': { bgcolor: COLORS.primary },
                    }}
                  >
                    {createNoteMutation.isPending ? 'Agregando...' : 'Agregar'}
                  </Button>
                </Stack>

                {notesQuery.isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {notesQuery.isError && (
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    Error al cargar tareas.
                  </Typography>
                )}

                <Stack spacing={1.2} sx={{ mt: 1 }}>
                  {notes.length === 0 && !notesQuery.isLoading && (
                    <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                      No tienes tareas pendientes. ✨
                    </Typography>
                  )}

                  {notes.map((note) => {
                    const done = note.status === 2
                    return (
                      <Box
                        key={note.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.25,
                          borderRadius: 3,
                          bgcolor: done ? 'rgba(22,163,74,0.08)' : '#F9FAFB',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={done}
                            onChange={() =>
                              updateStatusMutation.mutate({
                                id: note.id,
                                idUser,
                                status: done ? 1 : 2,
                              })
                            }
                            size="small"
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: done ? 'line-through' : 'none',
                              color: done ? COLORS.mutedText : COLORS.darkText,
                              fontWeight: 500,
                            }}
                          >
                            {note.nota}
                          </Typography>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: note.id,
                              idUser,
                              status: 3,
                            })
                          }
                          sx={{ color: COLORS.mutedText }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  })}
                </Stack>

                {updateStatusMutation.isPending && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                      Actualizando...
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
