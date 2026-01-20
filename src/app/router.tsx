// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'

import Login from '../pages/Login'
import NavbarGlobal from '../components/layout/NavbarGlobal'

// Páginas del sistema
import DashboardPage from '../modules/dashboard'
import NotFound from '../pages/NotFound'
import UsuariosPage from '../modules/rrhh/Usuarios'
import AgregarUsuarioPage from '../modules/rrhh/AgregarUsuario'
import FirstLoginChangePassword from '../pages/FirstLoginChangePassword'
import CargaLeads from '../modules/ventas/CargaLeads'
import ProspectosPage from '../modules/ventas/ProspectosPage'
import EquiposPage from '../modules/ventas/EquiposPage'
import UsuarioMetricasPage from '../modules/ventas/UsuarioMetricasPage'


export const router = createBrowserRouter([
  // LOGIN (Ruta principal)
  {
    path: '/',
    element: <Login />,
  },

  {
    path: '/first-login/change-password',
    element: <FirstLoginChangePassword />,
  },

  // DASHBOARD
  {
    path: '/dashboard',
    element: (
      <NavbarGlobal>
        <DashboardPage />
      </NavbarGlobal>
    ),
  },

  // ⭐ RECURSOS HUMANOS
  {
    path: '/rrhh/usuarios',
    element: (
      <NavbarGlobal>
        <UsuariosPage />
      </NavbarGlobal>
    ),
  },
  {
    path: '/rrhh/usuarios/nuevo',
    element: (
      <NavbarGlobal>
        <AgregarUsuarioPage />
      </NavbarGlobal>
    ),
  },

  // ⭐ VENTAS (alineado con tu menú)
  {
    path: '/ventas/upload-leads',
    element: (
      <NavbarGlobal>
        <CargaLeads />
      </NavbarGlobal>
    ),
  },
  {
    path: '/ventas/leads',
    element: (
      <NavbarGlobal>
        <ProspectosPage />
      </NavbarGlobal>
    ),
  },
  {
    path: '/ventas/registro',
    element: (
      <NavbarGlobal>
        <div>Registro de ventas (placeholder)</div>
      </NavbarGlobal>
    ),
  },
  {
    path: '/ventas/equipos',
    element: (
      <NavbarGlobal>
        <EquiposPage />
      </NavbarGlobal>
    ),
  },

  {
  path: '/ventas/usuario-metricas/:idUser',
  element: (
      <NavbarGlobal>
        <UsuarioMetricasPage />,
      </NavbarGlobal>
    ),
  },

  // NOT FOUND
  {
    path: '*',
    element: <NotFound />,
  },
])
