import { createTheme } from '@mui/material/styles'


export const getAppTheme = (mode: 'light' | 'dark') =>
createTheme({
palette: {
mode,
primary: { main: mode === 'dark' ? '#7dd3fc' : '#1976d2' },
secondary: { main: mode === 'dark' ? '#f6d365' : '#9c27b0' },
background: {
default: mode === 'dark' ? '#0b0f14' : '#f7f9fc',
paper: mode === 'dark' ? '#0f1520' : '#ffffff',
},
},
typography: {
fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
},
components: {
MuiButton: {
defaultProps: { variant: 'contained' },
styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } },
},
MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
},
})