import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { loginRequest, getUser } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [trialModalOpen, setTrialModalOpen] = useState(false)
  const [trialMessage, setTrialMessage] = useState('')

  useEffect(() => {
    const user = getUser()

    if (user) {
      if (user.mustChangePass === 1) {
        navigate('/first-login/change-password')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await loginRequest(email, password, remember)
    console.log('RESPUESTA LOGIN:', res)

    setLoading(false)

    if (!res.ok || !res.user) {
      if (res.code === 'TRIAL_ENDED') {
        setTrialMessage(
          res.msg ||
            'El periodo de prueba de tu empresa ha finalizado. Para continuar utilizando BitFlow CRM, ponte en contacto con nuestro equipo.'
        )
        setTrialModalOpen(true)
        return
      }

      setError(res.msg || 'Error al iniciar sesión')
      return
    }

    if (res.user.mustChangePass === 1) {
      navigate('/first-login/change-password')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
        }}
      >
        {/* Panel izquierdo */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#000',
            color: '#fff',
            p: 6,
          }}
        >
          <Box
            component="img"
            src="/logoBitflow.png"
            alt="Logo"
            sx={{ maxWidth: 280, width: '60%' }}
          />
        </Box>

        {/* Panel derecho */}
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', py: 6 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Identifícate
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tus credenciales para continuar en tu cuenta.
            </Typography>

            <Box component="form" onSubmit={onSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Correo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                />

                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">Recordarme</Typography>}
                  />

                  <Link href="#" underline="hover" variant="body2">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Stack>

                <Button size="large" type="submit" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 6, color: 'text.secondary' }}>
              <Typography variant="caption">
                © {new Date().getFullYear()} BitFlow. All Rights Reserved.
              </Typography>

              <Stack direction="row" gap={2} sx={{ mt: 1 }}>
                <Link href="#" underline="hover" variant="caption">
                  Terms and Conditions
                </Link>
                <Link href="#" underline="hover" variant="caption">
                  Privacy Policy
                </Link>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Dialog
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={800}>
          Periodo de prueba finalizado
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            {trialMessage}
          </Typography>

          <Typography sx={{ mt: 2 }} fontWeight={600}>
            Puedes comunicarte con el equipo de BitFlow para renovar tu acceso.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setTrialModalOpen(false)} variant="outlined">
            Cerrar
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              window.open(
                'https://wa.me/525591976244?text=Hola%2C%20mi%20periodo%20de%20prueba%20de%20BitFlow%20ha%20finalizado%20y%20quiero%20renovar%20mi%20acceso.',
                '_blank'
              )
            }}
          >
            Contactar a BitFlow
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}