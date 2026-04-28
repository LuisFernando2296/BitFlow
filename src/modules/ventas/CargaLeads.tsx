import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'

import * as XLSX from 'xlsx'

import {
  crearProspectoManual,
  importarProspectosJson,
  type ProspectoPayload,
} from '../../services/ventasService'

import {
  getUsuariosEquipoVentas,
  type UsuarioEquipoVentas,
} from '../../services/catalogosService'

const USER_KEY = 'bitflow_user'

const getLoggedUser = () => {
  const stored =
    sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY)

  return stored ? JSON.parse(stored) : null
}

type PreviewRow = {
  nombre: string
  telefono: string
  correo: string
  origen?: string
}

export default function CargaLeads() {
  const [tab, setTab] = useState<'manual' | 'masiva'>('manual')

  const [usuariosEquipo, setUsuariosEquipo] = useState<UsuarioEquipoVentas[]>([])
  const [catalogoLoading, setCatalogoLoading] = useState(false)

  const [manualIdUser, setManualIdUser] = useState<string>('')

  const [manualForm, setManualForm] = useState<ProspectoPayload>({
    nombre: '',
    telefono: '',
    correo: '',
    origen: '',
  })

  const [manualLoading, setManualLoading] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualSuccess, setManualSuccess] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [massiveIdUser, setMassiveIdUser] = useState<string>('')

  const [massiveLoading, setMassiveLoading] = useState(false)
  const [massiveError, setMassiveError] = useState<string | null>(null)
  const [massiveSuccess, setMassiveSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        setCatalogoLoading(true)

        const user = getLoggedUser()

        if (!user?.idEmpresa) return

        const data = await getUsuariosEquipoVentas(user.idEmpresa)
        setUsuariosEquipo(data)
      } catch (error) {
        console.error('Error al cargar catálogo de usuarios:', error)
      } finally {
        setCatalogoLoading(false)
      }
    }

    loadCatalogos()
  }, [])

  const handleChangeTab = (_: React.SyntheticEvent, value: 'manual' | 'masiva') => {
  setTab(value)
  setManualError(null)
  setManualSuccess(null)
  setMassiveError(null)
  setMassiveSuccess(null)
}

  const handleManualChange =
    (field: keyof ProspectoPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmitManual = async () => {
  setManualError(null)
  setManualSuccess(null)

  const user = getLoggedUser()

  if (!user?.idEmpresa) {
    setManualError('No se encontró la empresa del usuario logueado')
    return
  }

  if (!manualForm.nombre || !manualForm.telefono || !manualForm.correo) {
    setManualError('Nombre, teléfono y correo son obligatorios')
    return
  }

  const usuarioSeleccionado =
    usuariosEquipo.find((u) => String(u.id) === String(manualIdUser)) || null

  const idUser = manualIdUser ? Number(manualIdUser) : null
  const idEmpresa = Number(user.idEmpresa)
  const idEquip = usuarioSeleccionado ? Number(usuarioSeleccionado.idEquipo) : null

  try {
    setManualLoading(true)

    const payload: ProspectoPayload = {
      ...manualForm,
      idUser,
      idEmpresa,
      idEquip,
    }

    const resp = await crearProspectoManual(payload)

    if (!resp.ok) {
      setManualError(resp.msg || 'Error al guardar el prospecto')
      return
    }

    setManualSuccess('Prospecto guardado correctamente')

    setManualForm({
      nombre: '',
      telefono: '',
      correo: '',
      origen: '',
    })

    setManualIdUser('')
  } catch (error: any) {
    setManualError(
      error?.response?.data?.msg || error?.message || 'Error al guardar'
    )
  } finally {
    setManualLoading(false)
  }
}

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMassiveError(null)
    setMassiveSuccess(null)

    const selected = e.target.files?.[0]

    if (!selected) return

    setFile(selected)
    setPreviewRows([])

    const reader = new FileReader()

    reader.onload = (evt) => {
      const data = evt.target?.result
      if (!data) return

      const workbook = XLSX.read(data, { type: 'binary' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json: any[] = XLSX.utils.sheet_to_json(sheet)

      const rows: PreviewRow[] = json.map((row) => ({
        nombre: row.nombre ?? row.Nombre ?? '',
        telefono: row.telefono
          ? String(row.telefono)
          : row.Telefono
          ? String(row.Telefono)
          : '',
        correo: row.correo ?? row.Correo ?? '',
        origen: row.origen ?? row.Origen ?? 'Otros',
      }))

      setPreviewRows(rows)
    }

    reader.readAsBinaryString(selected)
  }

  const handleImportMassive = async () => {
  setMassiveError(null)
  setMassiveSuccess(null)

  const user = getLoggedUser()

  if (!user?.idEmpresa) {
    setMassiveError('No se encontró la empresa del usuario logueado')
    return
  }

  if (!file) {
    setMassiveError('Selecciona un archivo Excel')
    return
  }

  if (!previewRows.length) {
    setMassiveError('No se encontraron registros para importar')
    return
  }

  const usuarioSeleccionado =
    usuariosEquipo.find((u) => String(u.id) === String(massiveIdUser)) || null

  const idUser = massiveIdUser ? Number(massiveIdUser) : null
  const idEmpresa = Number(user.idEmpresa)
  const idEquip = usuarioSeleccionado ? Number(usuarioSeleccionado.idEquipo) : null

  try {
    setMassiveLoading(true)

    const payload: ProspectoPayload[] = previewRows.map((row) => ({
      ...row,
      idUser,
      idEmpresa,
      idEquip,
    }))

    const resp = await importarProspectosJson(payload)

    if (!resp.ok) {
      setMassiveError(resp.msg || 'Error al importar prospectos')
      return
    }

    setMassiveSuccess('Prospectos importados correctamente')
    setFile(null)
    setPreviewRows([])
    setMassiveIdUser('')
  } catch (error: any) {
    setMassiveError(
      error?.response?.data?.msg || error?.message || 'Error al importar'
    )
  } finally {
    setMassiveLoading(false)
  }
}

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Carga de leads
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Registra nuevos leads de forma individual o sube un archivo Excel para cargarlos en lote.
          </Typography>
        </Box>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            pt: 1,
            bgcolor: 'background.default',
          }}
        >
          <Tabs value={tab} onChange={handleChangeTab}>
            <Tab label="Carga manual" value="manual" />
            <Tab label="Carga masiva (Excel)" value="masiva" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {tab === 'manual' && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Registrar lead manualmente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completa la información básica del lead. El sistema registrará la fecha de alta
                  y el estado inicial automáticamente.
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={2} maxWidth={550}>
                  {manualError && <Alert severity="error">{manualError}</Alert>}
                  {manualSuccess && <Alert severity="success">{manualSuccess}</Alert>}

                  <FormControl fullWidth required>
                    <InputLabel>Asignar a usuario</InputLabel>
                    <Select
                      value={manualIdUser}
                      label="Asignar a usuario"
                      onChange={(e) => setManualIdUser(String(e.target.value))}
                      disabled={catalogoLoading}
                    >
                      {usuariosEquipo.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Nombre"
                    value={manualForm.nombre}
                    onChange={handleManualChange('nombre')}
                    required
                    fullWidth
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Teléfono"
                      value={manualForm.telefono}
                      onChange={handleManualChange('telefono')}
                      required
                      fullWidth
                    />

                    <TextField
                      label="Correo"
                      value={manualForm.correo}
                      onChange={handleManualChange('correo')}
                      required
                      fullWidth
                    />
                  </Stack>

                  <TextField
                    label="Origen"
                    value={manualForm.origen ?? ''}
                    onChange={handleManualChange('origen')}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    startIcon={manualLoading ? <CircularProgress size={18} /> : <SaveIcon />}
                    onClick={handleSubmitManual}
                    disabled={manualLoading || catalogoLoading}
                  >
                    {manualLoading ? 'Guardando...' : 'Guardar lead'}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          )}

          {tab === 'masiva' && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Carga masiva de leads desde Excel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usa la plantilla de Excel con las columnas <b>nombre, telefono, correo, origen</b>.
                  Antes de importar se mostrará una vista previa de los datos.
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={2}>
                  {massiveError && <Alert severity="error">{massiveError}</Alert>}
                  {massiveSuccess && <Alert severity="success">{massiveSuccess}</Alert>}

                  <Box>
                    <input
                      id="file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    <label htmlFor="file-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                      >
                        {file ? 'Cambiar archivo' : 'Seleccionar archivo Excel'}
                      </Button>
                    </label>

                    {file && (
                      <Typography variant="body2" mt={1}>
                        Archivo seleccionado:{' '}
                        <Typography component="span" fontWeight={600}>
                          {file.name}
                        </Typography>
                      </Typography>
                    )}
                  </Box>

                  {file && (
                    <FormControl fullWidth required>
                      <InputLabel>Asignar a usuario</InputLabel>
                      <Select
                        value={massiveIdUser}
                        label="Asignar a usuario"
                        onChange={(e) => setMassiveIdUser(String(e.target.value))}
                        disabled={catalogoLoading}
                      >
                        {usuariosEquipo.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Divider />

                  {previewRows.length > 0 && (
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Box p={2}>
                        <Typography variant="subtitle2" mb={1}>
                          Vista previa de los datos a importar ({previewRows.length} registros)
                        </Typography>

                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Nombre</TableCell>
                              <TableCell>Teléfono</TableCell>
                              <TableCell>Correo</TableCell>
                              <TableCell>Origen</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {previewRows.slice(0, 20).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell>{row.nombre}</TableCell>
                                <TableCell>{row.telefono}</TableCell>
                                <TableCell>{row.correo}</TableCell>
                                <TableCell>{row.origen || 'Otros'}</TableCell>
                              </TableRow>
                            ))}

                            {previewRows.length > 20 && (
                              <TableRow>
                                <TableCell colSpan={4}>
                                  <Typography variant="caption" color="text.secondary">
                                    Mostrando solo los primeros 20 registros…
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Paper>
                  )}

                  <Button
                    variant="contained"
                    startIcon={
                      massiveLoading ? <CircularProgress size={18} /> : <CloudUploadIcon />
                    }
                    onClick={handleImportMassive}
                    disabled={massiveLoading || !file || catalogoLoading}
                  >
                    {massiveLoading ? 'Importando...' : 'Importar prospectos'}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}