import { createContext, useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material'
import { getAppTheme } from './theme'


export const ColorModeContext = createContext({ toggleColorMode: () => {} })


export default function ColorModeProvider({ children }: PropsWithChildren) {
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
const [mode, setMode] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light')


const toggleColorMode = useCallback(() => {
setMode((m) => (m === 'light' ? 'dark' : 'light'))
}, [])


const theme = useMemo(() => getAppTheme(mode), [mode])


return (
<ColorModeContext.Provider value={{ toggleColorMode }}>
<ThemeProvider theme={theme}>
<CssBaseline />
{children}
</ThemeProvider>
</ColorModeContext.Provider>
)
}