import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'


export default function Hero() {
return (
<Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
<Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
<Box sx={{ flex: 1 }}>
<Typography variant="h3" fontWeight={800} gutterBottom>
React + TS + MUI listo para construir
</Typography>
<Typography color="text.secondary" sx={{ maxWidth: 560 }}>
Vite, Material UI, Router, React Query y Zustand. Tema oscuro/claro con un clic.
</Typography>
<Stack direction="row" spacing={2} sx={{ mt: 3 }}>
<Button size="large">Empezar</Button>
<Button size="large" variant="outlined" href="https://mui.com/" target="_blank" rel="noreferrer">Docs MUI</Button>
</Stack>
</Box>
<Card sx={{ flex: 1, maxWidth: 520 }}>
<CardContent>
<Typography variant="subtitle2" gutterBottom>Incluye</Typography>
<ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
<li>⚡️ Vite + TS</li>
<li>🎨 Material UI (MUI)</li>
<li>🔗 React Router</li>
<li>📦 React Query</li>
<li>🗂️ Zustand</li>
</ul>
</CardContent>
</Card>
</Stack>
</Box>
)
}