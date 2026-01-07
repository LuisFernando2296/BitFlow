import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Container,
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

  // Si ya hay usuario guardado, mandarlo directo al dashboard
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

  // 👇 Aquí ya cubrimos los dos casos: que falle o que no venga user
  if (!res.ok || !res.user) {
    setError(res.msg || 'Error al iniciar sesión')
    setLoading(false)
    return
  }

  // A partir de aquí TypeScript ya sabe que res.user NO es undefined
  setLoading(false)

  if (res.user.mustChangePass === 1) {
    navigate('/first-login/change-password')
  } else {
    navigate('/dashboard')
  }
}

  return (
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
        <Box component="img" src="/logo.png" alt="Logo" sx={{ maxWidth: 280, width: '60%' }} />
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
  )
}
