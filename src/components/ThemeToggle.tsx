import { useContext } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ColorModeContext } from '../theme/ColorModeContext'
import { useTheme } from '@mui/material/styles'


export default function ThemeToggle() {
const { toggleColorMode } = useContext(ColorModeContext)
const theme = useTheme()
const isDark = theme.palette.mode === 'dark'


return (
<Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'}>
<IconButton onClick={toggleColorMode} color="inherit" size="small">
{isDark ? <LightModeIcon /> : <DarkModeIcon />}
</IconButton>
</Tooltip>
)
}