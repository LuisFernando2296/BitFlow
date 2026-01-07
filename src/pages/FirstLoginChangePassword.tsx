import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { getUser, saveUser, clearUser, type User, changeInitialPassword } from '../services/authService'

const BRAND = '#16A34A'

export default function FirstLoginChangePassword() {
  const navigate = useNavigate()
  const user = getUser() as User | null

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Si no hay usuario en sesión, lo mandamos al login
  if (!user) {
    clearUser()
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!currentPass || !newPass || !confirmPass) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (newPass !== confirmPass) {
      setError('La nueva contraseña y la confirmación no coinciden')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const resp = await changeInitialPassword(
        user.id,
        currentPass,
        newPass
      )

      if (!resp.ok) {
        setError(resp.msg)
        return
      }

      setSuccess('Contraseña actualizada correctamente')

      // Actualizar usuario en storage (marcar que ya NO debe cambiar pass)
      const updatedUser: User = { ...user, mustChangePass: 0 }
      // lo guardamos en localStorage para que siga logueado
      saveUser(updatedUser, true)

      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err: any) {
      setError(err.message ?? 'Ocurrió un error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Typography
            variant="overline"
            sx={{ color: BRAND, letterSpacing: 1.2 }}
          >
            Primer acceso
          </Typography>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Cambia tu contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Es tu primer ingreso al sistema. Por seguridad, debes definir una nueva
            contraseña personal antes de continuar.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Contraseña actual"
                type="password"
                fullWidth
                size="small"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                fullWidth
                size="small"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                fullWidth
                size="small"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ bgcolor: BRAND, '&:hover': { bgcolor: '#15803D' } }}
              >
                {loading ? 'Guardando...' : 'Guardar y continuar'}
              </Button>

              <Button
                type="button"
                variant="text"
                onClick={() => {
                  clearUser()
                  navigate('/')
                }}
              >
                Cerrar sesión
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar error */}
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
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Snackbar éxito */}
      {success && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSuccess(null)}
            severity="success"
            variant="filled"
          >
            {success}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}
