// src/modules/ventas/EquiposPage.tsx
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
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
  Tooltip,
  Typography,
} from '@mui/material'

import { useEquiposPage } from './hooks/useEquiposPage'

export default function EquiposPage() {
  const {
    ROWS_PER_PAGE,

    // data
    adminsVentas,
    usuariosVentas,
    paginados,
    filtrados,

    // ui
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,

    // create
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

    // detail
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

    // helpers / totals
    totalEquipos,
    formatDate,
  } = useEquiposPage()

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
          onPageChange={(_, newPage) => setPage(newPage)}
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

            <FormControl fullWidth size="small">
              <InputLabel>Miembros del equipo</InputLabel>
              <Select
                label="Miembros del equipo"
                multiple
                value={createMiembros}
                onChange={(e) => setCreateMiembros(e.target.value as number[])}
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

            <FormControl fullWidth size="small">
              <InputLabel>Sublíder(es)</InputLabel>
              <Select
                label="Sublíder(es)"
                multiple
                value={createSublideres}
                onChange={(e) => {
                  const arr = e.target.value as number[]
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

      {/* Modal detalle equipo */}
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

          <Paper variant="outlined" sx={{ maxHeight: 280, overflow: 'auto', borderRadius: 2 }}>
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

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={m.rolEquipo}
                            onChange={(e) =>
                              handleChangeRol(m.idUser, Number(e.target.value) as 1 | 2)
                            }
                          >
                            <MenuItem value={1}>Sublíder</MenuItem>
                            <MenuItem value={2}>Miembro</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {/* Ver info del usuario */}
                        <Tooltip title="Ver métricas del usuario">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`/ventas/usuario-metricas/${m.idUser}`, '_blank')}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Eliminar del equipo */}
                        <Tooltip title="Eliminar del equipo">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMiembro(m.idUser)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {detailMiembros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
