import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
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

type PreviewRow = {
  nombre: string
  telefono: string
  correo: string
  origen?: string
}

export default function CargaLeads() {
  const [tab, setTab] = useState<'manual' | 'masiva'>('manual')

  // --- CARGA MANUAL ---
  const [manualForm, setManualForm] = useState<ProspectoPayload>({
    nombre: '',
    telefono: '',
    correo: '',
    origen: '',
  })
  const [manualLoading, setManualLoading] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualSuccess, setManualSuccess] = useState<string | null>(null)

  // --- CARGA MASIVA ---
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [massiveLoading, setMassiveLoading] = useState(false)
  const [massiveError, setMassiveError] = useState<string | null>(null)
  const [massiveSuccess, setMassiveSuccess] = useState<string | null>(null)

  // ------------------ HANDLERS ------------------

  const handleChangeTab = (_: React.SyntheticEvent, value: string) => {
    setTab(value as 'manual' | 'masiva')
    setManualError(null)
    setManualSuccess(null)
    setMassiveError(null)
    setMassiveSuccess(null)
  }

  // 🔹 CARGA MANUAL
  const handleManualChange =
    (field: keyof ProspectoPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setManualForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmitManual = async () => {
    setManualError(null)
    setManualSuccess(null)

    if (!manualForm.nombre || !manualForm.telefono || !manualForm.correo) {
      setManualError('Nombre, teléfono y correo son obligatorios.')
      return
    }

    try {
      setManualLoading(true)
      const resp = await crearProspectoManual(manualForm)
      if (!resp.ok) {
        setManualError(resp.msg || 'Error al guardar el prospecto')
        return
      }
      setManualSuccess('Prospecto guardado correctamente.')
      setManualForm({ nombre: '', telefono: '', correo: '', origen: '' })
    } catch (e: any) {
      setManualError(e?.response?.data?.msg || e.message || 'Error al guardar el prospecto')
    } finally {
      setManualLoading(false)
    }
  }

  // 🔹 LEER EXCEL PARA PREVIEW
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
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 0 })

      const rows: PreviewRow[] = json.map((row) => ({
        nombre: row.nombre ?? row.Nombre ?? '',
        telefono: row.telefono ? String(row.telefono) : '',
        correo: row.correo ?? row.Correo ?? '',
        origen: row.origen ?? row.Origen ?? 'Otros',
      }))

      setPreviewRows(rows)
    }

    reader.readAsBinaryString(selected)
  }

  // 🔹 ENVIAR EXCEL AL BACKEND
  const handleImportMassive = async () => {
  setMassiveError(null)
  setMassiveSuccess(null)

  if (!file) {
    setMassiveError('Selecciona un archivo Excel primero.')
    return
  }
  if (!previewRows.length) {
    setMassiveError('No se encontraron datos en el archivo.')
    return
  }

  try {
    setMassiveLoading(true)

    // mandamos al backend el arreglo de prospectos
    const resp = await importarProspectosJson(previewRows)

    if (!resp.ok) {
      setMassiveError(resp.msg || 'Error al importar prospectos')
      return
    }

    setMassiveSuccess('Prospectos importados correctamente.')
    setFile(null)
    setPreviewRows([])
  } catch (e: any) {
    setMassiveError(
      e?.response?.data?.msg || e.message || 'Error al importar prospectos'
    )
  } finally {
    setMassiveLoading(false)
  }
}


  // ------------------ UI ------------------

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      {/* Header */}
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
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
          >
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

                  <TextField
                    label="Nombre completo"
                    fullWidth
                    value={manualForm.nombre}
                    onChange={handleManualChange('nombre')}
                    required
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Teléfono"
                      fullWidth
                      value={manualForm.telefono}
                      onChange={handleManualChange('telefono')}
                      required
                    />
                    <TextField
                      label="Correo electrónico"
                      type="email"
                      fullWidth
                      value={manualForm.correo}
                      onChange={handleManualChange('correo')}
                      required
                    />
                  </Stack>

                  <TextField
                    label="Origen (opcional)"
                    fullWidth
                    value={manualForm.origen ?? ''}
                    onChange={handleManualChange('origen')}
                    placeholder="Facebook Ads, Orgánico, Recomendación..."
                    helperText="Si se deja vacío, el origen se registrará como “Otros”."
                  />

                  <Box pt={1}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={manualLoading ? <CircularProgress size={18} /> : <SaveIcon />}
                      onClick={handleSubmitManual}
                      disabled={manualLoading}
                    >
                      {manualLoading ? 'Guardando...' : 'Guardar lead'}
                    </Button>
                  </Box>
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
                  Usa la plantilla de Excel con las columnas{' '}
                  <b>nombre, telefono, correo, origen</b>. Antes de importar se mostrará
                  una vista previa de los datos.
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

                  {/* Selector de archivo */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        Las filas sin nombre, teléfono y correo serán ignoradas.
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Divider */}
                  <Divider sx={{ my: 1 }} />

                  {/* Tabla de preview */}
                  {previewRows.length > 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
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
                            {previewRows.slice(0, 20).map((row, idx) => (
                              <TableRow key={idx}>
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

                  {/* Botón para importar */}
                  <Box pt={1}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        massiveLoading ? <CircularProgress size={18} /> : <CloudUploadIcon />
                      }
                      onClick={handleImportMassive}
                      disabled={massiveLoading || !file}
                    >
                      {massiveLoading ? 'Importando...' : 'Importar prospectos'}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
