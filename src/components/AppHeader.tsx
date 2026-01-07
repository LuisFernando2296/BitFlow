import { AppBar, Box, Toolbar, Typography, Stack, Button } from '@mui/material'
import ThemeToggle from './ThemeToggle'
import { Link as RouterLink } from 'react-router-dom'


export default function AppHeader() {
return (
<AppBar position="static" color="transparent" elevation={0}>
<Toolbar sx={{ height: 72 }}>
<Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
BitFlow
</Typography>
<Stack direction="row" gap={1} alignItems="center">
<Button component={RouterLink} to="/" color="primary">Inicio</Button>
<ThemeToggle />
</Stack>
</Toolbar>
<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />
</AppBar>
)
}