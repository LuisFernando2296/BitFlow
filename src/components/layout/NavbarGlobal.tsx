// 👇 React
import { useState, type ReactNode, type MouseEvent } from 'react'

// 👇 MUI
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'

// 👇 Theme SOLO tipo
import type { Theme } from '@mui/material/styles'

// 👇 Íconos
import MenuIcon from '@mui/icons-material/Menu'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

// 👇 Router
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

// 👇 Auth service
import { clearUser, getUser } from '../../services/authService'
import type { User } from '../../services/authService'

// 👇 MUI Menu
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

type Props = {
  children: ReactNode
}

const drawerWidth = 240

// Paleta BitFlow aprox
const COLORS = {
  primary: '#16A34A', // verde principal
  darkBg: '#050816', // casi negro
  sidebarBg: '#0B1220', // sidebar
  textMuted: '#9CA3AF',
}

// ---------------- TIPOS PARA EL MENÚ ----------------

// ------------- TIPOS PARA EL MENÚ ----------------
type MenuItemConfig =
  | {
      type: 'item'
      label: string
      icon: ReactNode
      path: string
    }
  | {
      type: 'group'
      label: string
      icon: ReactNode
      id: string
      children: {
        label: string
        path: string
      }[]
    }


// Config base del menú
const menuConfig: MenuItemConfig[] = [
  {
    type: 'item',
    label: 'Dashboard',
    icon: <SpaceDashboardRoundedIcon />,
    path: '/dashboard',
  },
  {
    type: 'group',
    label: 'Recursos Humanos',
    icon: <GroupRoundedIcon />,
    id: 'rrhh',
    children: [
      {
        label: 'Usuarios',
        path: '/rrhh/usuarios',
      },
      {
        label: 'Agregar usuario',
        path: '/rrhh/usuarios/nuevo',
      },
    ],
  },
  {
    type: 'group',
    label: 'Ventas',
    icon: <PointOfSaleRoundedIcon />,
    id: 'ventas',
    children: [
      {
        label: 'Cargar leads',
        path: '/ventas/upload-leads',
      },
      {
        label: 'Prospectos',
        path: '/ventas/leads',
      },
      {
        label: 'Registro de ventas',
        path: '/ventas/registro',
      },
      {
        label: 'Equipos de Ventas',
        path: '/ventas/equipos',
      },
    ],
  },
]

// ---------------- LÓGICA DE MENÚ POR ROL/PUESTO ----------------

function getMenuForRole(user: User | null): MenuItemConfig[] {
  if (!user) {
    // Si no hay user (caso raro), solo Dashboard
    return menuConfig.filter(item => item.type === 'item' && item.path === '/dashboard')
  }

  // Master → ve todo
  if (user.idRol === 1) {
    return menuConfig
  }

  const isAdminVentas = user.idRol === 2 && user.idPuesto === 1
  const isUsuarioVentas = user.idRol === 3 && user.idPuesto === 1

  const filtered: MenuItemConfig[] = []

  for (const item of menuConfig) {
    // Dashboard: siempre disponible para estos roles
    if (item.type === 'item' && item.path === '/dashboard') {
      filtered.push(item)
      continue
    }

    if (item.type === 'group') {
      // RRHH
      if (item.id === 'rrhh') {
        if (isAdminVentas) {
          // Solo "Agregar usuario"
          const childAgregar = item.children.find(
            child => child.path === '/rrhh/usuarios/nuevo',
          )
          if (childAgregar) {
            filtered.push({
              ...item,
              children: [childAgregar],
            })
          }
        }
        // Usuario de ventas no ve RRHH
        continue
      }

      // Ventas
    if (item.id === 'ventas') {
      // Admin de ventas → ve TODO ventas
      if (isAdminVentas) {
        filtered.push(item)
      }

      // Usuario de ventas → SOLO prospectos
      if (isUsuarioVentas) {
        const prospectos = item.children.find(
          child => child.path === '/ventas/leads',
        )

        if (prospectos) {
          filtered.push({
            ...item,
            children: [prospectos],
          })
        }
      }

      continue
    }

    }
  }

  // Otros roles: solo Dashboard por seguridad
  if (filtered.length === 0) {
    return menuConfig.filter(item => item.type === 'item' && item.path === '/dashboard')
  }

  return filtered
}

// ---------------- COMPONENTE PRINCIPAL ----------------

export default function NavbarGlobal({ children }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const user = getUser()
  const fullName = user ? `${user.nombre ?? ''} ${user.apellido ?? ''}`.trim() : 'Usuario'
  const empresaNombre = user?.empresa ?? 'Empresa'
  const menuForUser = getMenuForRole(user)

  // Drawer lateral (sidebar)
  const [open, setOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    ventas: false,
    rrhh: false,
  })

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const isOpen = !!prev[id]
      // Cierra todos y solo abre el clickeado
      return isOpen ? {} : { [id]: true }
    })
  }

  // Estado para el menú del avatar
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleOpenMenu = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    clearUser()
    handleCloseMenu()
    navigate('/')
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: COLORS.sidebarBg,
        color: 'white',
      }}
    >
      {/* Logo / título */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 2.5,
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="BitFlow"
          sx={{ width: 40, height: 40, objectFit: 'contain' }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            BitFlow
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
            {empresaNombre}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {/* Menú lateral */}
      <List sx={{ mt: 1, px: 1, flexGrow: 1 }}>
        {menuForUser.map(item => {
          // ITEM simple (Dashboard)
          if (item.type === 'item') {
            const active = location.pathname.startsWith(item.path)

            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                sx={{
                  mb: 0.5,
                  borderRadius: 3,
                  color: active ? 'white' : COLORS.textMuted,
                  bgcolor: active ? COLORS.primary : 'transparent',
                  '&:hover': {
                    bgcolor: active ? COLORS.primary : 'rgba(148,163,184,0.12)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? 'white' : COLORS.textMuted,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            )
          }

          // GROUP (RRHH, Ventas)
          const anyChildActive = item.children.some(child =>
            location.pathname.startsWith(child.path),
          )
          const openGroup = openGroups[item.id] ?? false

          return (
            <Box key={item.id}>
              <ListItemButton
                onClick={() => toggleGroup(item.id)}
                sx={{
                  mb: 0.5,
                  borderRadius: 3,
                  color: anyChildActive ? 'white' : COLORS.textMuted,
                  bgcolor: anyChildActive ? COLORS.primary : 'transparent',
                  '&:hover': {
                    bgcolor: anyChildActive ? COLORS.primary : 'rgba(148,163,184,0.12)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: anyChildActive ? 'white' : COLORS.textMuted,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: anyChildActive ? 700 : 500,
                  }}
                />
                {openGroup ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openGroup} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mb: 0.5 }}>
                  {item.children.map(child => {
                    const activeChild = location.pathname.startsWith(child.path)
                    return (
                      <ListItemButton
                        key={child.path}
                        component={RouterLink}
                        to={child.path}
                        sx={{
                          ml: 4,
                          mb: 0.25,
                          borderRadius: 2,
                          color: activeChild ? 'white' : COLORS.textMuted,
                          bgcolor: activeChild ? 'rgba(22,163,74,0.22)' : 'transparent',
                          '&:hover': {
                            bgcolor: activeChild
                              ? 'rgba(22,163,74,0.32)'
                              : 'rgba(148,163,184,0.12)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: 13,
                            fontWeight: activeChild ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    )
                  })}
                </List>
              </Collapse>
            </Box>
          )
        })}
      </List>

      {/* Footer chiquito del sidebar */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
          © {new Date().getFullYear()} BitFlow, V 1.0.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: '#F3F4F6' }}>
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: '#111827',
          borderBottom: '1px solid #E5E7EB',
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 56,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700}>
              Dashboard
            </Typography>
          </Box>

          {/* Acciones derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Trigger del menú */}
            <div onClick={handleOpenMenu} style={{ cursor: 'pointer' }}>
              <Avatar
                sx={{
                  bgcolor: COLORS.primary,
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {user ? `${user.nombre?.charAt(0) ?? ''}${user.apellido?.charAt(0) ?? ''}` : 'U'}
              </Avatar>
            </div>

            {/* Menú del avatar (fuera del div para que cierre bien) */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 150,
                  borderRadius: 2,
                },
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>{fullName}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            zIndex: 2000,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 7, // espacio por AppBar
          minWidth: 0,
          bgcolor: '#F3F4F6',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
