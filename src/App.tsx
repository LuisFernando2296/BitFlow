import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import AppHeader from './components/AppHeader'

export default function AppLayout() {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppHeader />
      <Outlet />
    </Box>
  )
}
