import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  TablePagination,
  Card,
  CardHeader,
  CardContent,
  InputAdornment,
} from '@mui/material'

import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'

import { getUser } from '../../../services/authService'
import { getPuestos } from '../../../services/catalogosService'

import {
  getUsuariosRRHH,
  desactivarUsuario,
  actualizarUsuario,
  type UsuarioRRHH,
  type Puesto,
} from '../../../services/rrhhServices'

const BRAND = '#16A34A'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRRHH[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔐 Permisos por rol (solo idRol 1 o 2 pueden gestionar)
  const currentUser = getUser()
  const currentUserRoleId = currentUser?.idRol ?? 0
  
   const currentUserEmpresaId = currentUser?.idEmpresa ?? 0
  const canManageUsers = currentUserRoleId === 1 || currentUserRoleId === 2

  // ✏️ Edición
  const [openEdit, setOpenEdit] = useState(false)
  const [editingUser, setEditingUser] = useState<UsuarioRRHH | null>(null)
  const [editCorreo, setEditCorreo] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editPuestoId, setEditPuestoId] = useState<number | ''>('')

  const [puestos, setPuestos] = useState<Puesto[]>([])
  const [loadingPuestos, setLoadingPuestos] = useState(false)

  // 🔍 Buscador
  const [search, setSearch] = useState('')

  // 📄 Paginación (10 por página fijo)
  const [page, setPage] = useState(0)
  const rowsPerPage = 10

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsuariosRRHH()
      setUsuarios(data)
      setPage(0)
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const cargarPuestos = async () => {
    try {
      setLoadingPuestos(true)
      const data = await getPuestos(currentUserEmpresaId)
      setPuestos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPuestos(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const handleOpenEdit = (user: UsuarioRRHH) => {
    setEditingUser(user)
    setEditCorreo(user.correo)
    setEditTelefono(
      user.telefono !== null && user.telefono !== undefined
        ? String(user.telefono)
        : '',
    )
    setEditPuestoId(user.idPuesto ?? '')
    setOpenEdit(true)
    cargarPuestos()
  }

  const handleCloseEdit = () => {
    setOpenEdit(false)
    setEditingUser(null)
  }

  const handleDesactivar = async (id: number) => {
    if (!canManageUsers) {
      alert('No tienes permisos para desactivar usuarios')
      return
    }

    const conf = window.confirm('¿Seguro que deseas desactivar este usuario?')
    if (!conf) return

    try {
      await desactivarUsuario(id)
      await cargarUsuarios()
    } catch (err: any) {
      alert(err.message ?? 'Ocurrió un error al desactivar el usuario')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    if (!canManageUsers) {
      alert('No tienes permisos para editar usuarios')
      return
    }

    if (!editPuestoId || typeof editPuestoId !== 'number') {
      alert('Debes seleccionar un puesto válido')
      return
    }

    try {
      await actualizarUsuario(editingUser.id, {
        correo: editCorreo,
        telefono: editTelefono ? Number(editTelefono) : null,
        idPuesto: editPuestoId,
      })

      handleCloseEdit()
      await cargarUsuarios()
    } catch (err: any) {
      alert(err.message ?? 'Ocurrió un error al actualizar el usuario')
    }
  }

  const renderStatusChip = (status: number) => {
    if (status === 1) {
      return (
        <Chip
          label="Activo"
          size="small"
          color="success"
          sx={{ fontSize: 11, height: 22 }}
        />
      )
    }
    return (
      <Chip
        label="Inactivo"
        size="small"
        sx={{
          fontSize: 11,
          height: 22,
          bgcolor: '#E5E7EB',
        }}
      />
    )
  }

  const renderRolChip = (rol: string | null) => {
    if (!rol) return '-'
    const color =
      rol.toLowerCase().includes('admin') || rol.toLowerCase().includes('master')
        ? 'primary'
        : 'default'

    return (
      <Chip
        label={rol}
        size="small"
        color={color as any}
        sx={{ fontSize: 11, height: 22 }}
      />
    )
  }

  // 🔍 Filtrado por buscador
  const searchLower = search.toLowerCase().trim()
  const filtered = usuarios.filter((u) => {
    if (!searchLower) return true

    const values = [
      u.nombre,
      u.apellido,
      u.telefono,
      u.correo,
      u.empresa,
      u.puesto,
      u.rol,
    ]

    return values.some((v) => {
      if (v === null || v === undefined) return false
      return String(v).toLowerCase().includes(searchLower)
    })
  })

  // 📄 Paginación sobre los filtrados
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  useEffect(() => {
    setPage(0)
  }, [search])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#F3F4F6',
        minHeight: '100%',
      }}
    >
      {/* Encabezado */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={2.5}
        spacing={2}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: BRAND, letterSpacing: 1.2 }}
          >
            Recursos Humanos
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Usuarios del sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta y administra los usuarios que tienen acceso al CRM.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Contador de usuarios */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 999,
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(15,23,42,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <PeopleAltRoundedIcon sx={{ fontSize: 20, color: BRAND }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Usuarios registrados
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                {usuarios.length}
              </Typography>
            </Box>
          </Box>

          {/* 🔍 Buscador */}
          <TextField
            size="small"
            placeholder="Buscar por nombre, correo, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 260, bgcolor: 'white' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 18px 45px rgba(15,23,42,0.18)',
            border: '1px solid rgba(148,163,184,0.3)',
          }}
        >
          <CardHeader
            sx={{
              pb: 0,
              '& .MuiCardHeader-title': { fontSize: 15, fontWeight: 600 },
              '& .MuiCardHeader-subheader': { fontSize: 12 },
            }}
            title="Listado de usuarios"
            subheader={
              filtered.length === usuarios.length
                ? `Mostrando ${usuarios.length} usuarios`
                : `Mostrando ${filtered.length} de ${usuarios.length} usuarios`
            }
          />
          <CardContent sx={{ pt: 1.5 }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: 520,
                borderRadius: 2,
                border: '1px solid rgba(226,232,240,0.9)',
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Puesto</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: 'rgba(249,250,251,0.7)',
                        },
                      }}
                    >
                      <TableCell>{u.nombre}</TableCell>
                      <TableCell>{u.apellido}</TableCell>
                      <TableCell>{u.telefono ?? '-'}</TableCell>
                      <TableCell>{u.correo}</TableCell>
                      <TableCell>{renderStatusChip(u.status)}</TableCell>
                      <TableCell>{u.empresa}</TableCell>
                      <TableCell>{u.puesto}</TableCell>
                      <TableCell>{renderRolChip(u.rol)}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip
                            title={
                              canManageUsers
                                ? 'Editar usuario'
                                : 'No tienes permisos para editar'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(u)}
                                disabled={!canManageUsers}
                              >
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={
                              canManageUsers
                                ? 'Desactivar usuario'
                                : 'No tienes permisos para desactivar'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDesactivar(u.id)}
                                disabled={!canManageUsers || u.status !== 1}
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 2 }}
                        >
                          No hay usuarios que coincidan con la búsqueda.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      )}

      {/* Modal para editar */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Correo"
              value={editCorreo}
              onChange={(e) => setEditCorreo(e.target.value)}
              fullWidth
            />
            <TextField
              label="Teléfono"
              value={editTelefono}
              onChange={(e) => setEditTelefono(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Puesto"
              value={editPuestoId}
              onChange={(e) =>
                setEditPuestoId(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              fullWidth
              helperText={loadingPuestos ? 'Cargando puestos...' : ''}
            >
              <MenuItem value="">Seleccione un puesto</MenuItem>
              {puestos.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
