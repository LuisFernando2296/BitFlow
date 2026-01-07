import { Container, Box } from '@mui/material'
import Hero from './Hero'


export default function Home() {
return (
<Container maxWidth="lg" sx={{ py: 4 }}>
<Hero />
<Box sx={{ borderTop: (t) => `1px solid ${t.palette.divider}`, mt: 6, pt: 4 }}>
{/* Zona para tus siguientes secciones */}
</Box>
</Container>
)
}