import { Box, Container, Typography } from '@mui/material'


export default function NotFound() {
return (
<Container maxWidth="sm">
<Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
<div style={{ textAlign: 'center' }}>
<Typography variant="h2" fontWeight={900}>404</Typography>
<Typography color="text.secondary">Página no encontrada</Typography>
</div>
</Box>
</Container>
)
}