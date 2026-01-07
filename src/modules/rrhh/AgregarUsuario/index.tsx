import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'

import { getUser } from '../../../services/authService'
import {
  crearUsuario,
  type CrearUsuarioPayload,
} from '../../../services/rrhhServices'
import {
  getEmpresas,
  getPuestos,
  getRoles,
  type Empresa,
  type Puesto,
  type Rol,
} from '../../../services/catalogosService'

const BRAND = '#16A34A'

export default function AgregarUsuarioPage() {
  // usuario logueado para permisos
  const currentUser = getUser()
  const currentUserRoleId = currentUser?.idRol ?? 0
  const canManageUsers = currentUserRoleId === 1 || currentUserRoleId === 2

  // catálogos
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [puestos, setPuestos] = useState<Puesto[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(false)

  // formulario
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('') // string para el input
  const [idEmpresa, setIdEmpresa] = useState<number | ''>('')
  const [idPuesto, setIdPuesto] = useState<number | ''>('')
  const [idRol, setIdRol] = useState<number | ''>('')
  const [fechaIngreso, setFechaIngreso] = useState('') // YYYY-MM-DD

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [passwordTemp, setPasswordTemp] = useState<string | null>(null)

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true)
      setError(null)
      const [emp, pue, rol] = await Promise.all([
        getEmpresas(),
        getPuestos(),
        getRoles(),
      ])
      setEmpresas(emp)
      setPuestos(pue)
      setRoles(rol)
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar catálogos')
    } finally {
      setLoadingCatalogos(false)
    }
  }

  useEffect(() => {
    if (canManageUsers) {
      cargarCatalogos()
    }
  }, [canManageUsers])

  // validación sencilla
  const validateForm = () => {
    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios')
      return false
    }
    if (!correo.trim()) {
      setError('El correo es obligatorio')
      return false
    }
    if (!idEmpresa || !idPuesto || !idRol) {
      setError('Empresa, puesto y rol son obligatorios')
      return false
    }
    if (!fechaIngreso) {
      setError('La fecha de ingreso es obligatoria')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageUsers) {
      setError('No tienes permisos para agregar usuarios')
      return
    }
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError(null)
      setSuccessMsg(null)
      setPasswordTemp(null)

      const payload: CrearUsuarioPayload = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() ? Number(telefono.trim()) : null,
        idEmpresa: Number(idEmpresa),
        idPuesto: Number(idPuesto),
        idRol: Number(idRol),
        fechalngreso: fechaIngreso, // debe ser YYYY-MM-DD
      }

      const resp = await crearUsuario(payload)

      setSuccessMsg('Usuario creado correctamente')
      setPasswordTemp(resp.password_temp ?? null)

      // limpiar formulario
      setNombre('')
      setApellido('')
      setCorreo('')
      setTelefono('')
      setIdEmpresa('')
      setIdPuesto('')
      setIdRol('')
      setFechaIngreso('')
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Error al crear usuario')
    } finally {
      setSubmitting(false)
    }
  }

  if (!canManageUsers) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Acceso restringido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tu rol no tiene permisos para agregar usuarios. Si crees que esto es un
              error, contacta al administrador del sistema.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100%',
        bgcolor: '#F3F4F6',
      }}
    >
      {/* Encabezado */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="overline" sx={{ color: BRAND, letterSpacing: 1.2 }}>
            Recursos Humanos
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Alta de usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra un nuevo usuario del equipo definiendo sus datos generales,
            empresa, puesto y rol dentro del sistema.
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: 999,
            background:
              'linear-gradient(120deg, rgba(22,163,74,0.18), rgba(22,163,74,0.04))',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PersonAddAltRoundedIcon sx={{ color: BRAND }} />
          <Box>
            <Typography variant="caption" fontWeight={600}>
              Nuevo usuario
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Revisa los datos antes de guardar al usuario
            </Typography>
          </Box>
        </Box>
      </Stack>

      {/* Layout principal */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="stretch"
      >
        {/* Formulario */}
        <Box flex={2}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.16)',
              border: '1px solid rgba(148,163,184,0.35)',
            }}
          >
            <CardHeader
              sx={{
                pb: 0,
                '& .MuiCardHeader-title': { fontSize: 16, fontWeight: 600 },
                '& .MuiCardHeader-subheader': { fontSize: 13 },
              }}
              title="Datos generales"
              subheader="Completa la información personal y los datos de acceso al sistema."
            />

            <CardContent sx={{ pt: 2.5 }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                {/* Sección: Información personal */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: 'text.secondary',
                  }}
                >
                  Información personal
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Nombre *"
                    fullWidth
                    size="small"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <TextField
                    label="Apellido *"
                    fullWidth
                    size="small"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Correo *"
                    type="email"
                    fullWidth
                    size="small"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                  <TextField
                    label="Teléfono"
                    fullWidth
                    size="small"
                    value={telefono}
                    onChange={(e) => {
                      const v = e.target.value
                      if (/^\d*$/.test(v)) setTelefono(v)
                    }}
                    helperText="Solo números, sin espacios ni guiones"
                  />
                </Stack>

                {/* Sección: Datos laborales */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 1,
                    fontWeight: 600,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: 'text.secondary',
                  }}
                >
                  Datos laborales
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Empresa *"
                    fullWidth
                    size="small"
                    value={idEmpresa}
                    onChange={(e) =>
                      setIdEmpresa(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    helperText={loadingCatalogos ? 'Cargando empresas…' : ''}
                  >
                    <MenuItem value="">Selecciona una empresa</MenuItem>
                    {empresas.map((e) => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Puesto *"
                    fullWidth
                    size="small"
                    value={idPuesto}
                    onChange={(e) =>
                      setIdPuesto(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    helperText={loadingCatalogos ? 'Cargando puestos…' : ''}
                  >
                    <MenuItem value="">Selecciona un puesto</MenuItem>
                    {puestos.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Rol *"
                    fullWidth
                    size="small"
                    value={idRol}
                    onChange={(e) =>
                      setIdRol(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    helperText={loadingCatalogos ? 'Cargando roles…' : ''}
                  >
                    <MenuItem value="">Selecciona un rol</MenuItem>
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.rol}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Fecha de ingreso *"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                  />
                </Stack>

                {/* Botones */}
                <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={1}>
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => {
                      setNombre('')
                      setApellido('')
                      setCorreo('')
                      setTelefono('')
                      setIdEmpresa('')
                      setIdPuesto('')
                      setIdRol('')
                      setFechaIngreso('')
                      setError(null)
                      setSuccessMsg(null)
                      setPasswordTemp(null)
                    }}
                  >
                    Limpiar
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || loadingCatalogos}
                    sx={{
                      bgcolor: BRAND,
                      px: 3,
                      '&:hover': { bgcolor: '#15803D' },
                    }}
                  >
                    {submitting ? 'Guardando…' : 'Guardar usuario'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Panel lateral */}
        <Box flex={1} minWidth={260}>
          <Card
            sx={{
              borderRadius: 3,
              background:
                'radial-gradient(circle at top left, rgba(22,163,74,0.22), transparent 55%)',
              border: '1px solid rgba(148,163,184,0.35)',
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Detalles de acceso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                El sistema genera automáticamente una contraseña temporal. Compártela
                con el usuario en su primer acceso y recomiéndale cambiarla.
              </Typography>

              {passwordTemp && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#020617',
                    color: 'white',
                    fontFamily: 'monospace',
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Contraseña temporal generada
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {passwordTemp}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Snackbar de éxito */}
      {successMsg && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setSuccessMsg(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSuccessMsg(null)}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {successMsg}
          </Alert>
        </Snackbar>
      )}

      {/* Snackbar de error */}
      {error && (
        <Snackbar
          open
          autoHideDuration={5000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}
