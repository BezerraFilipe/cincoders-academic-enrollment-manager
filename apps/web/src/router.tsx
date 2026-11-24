import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { RootRedirect } from './components/routing/RootRedirect'
import { RegistrarLayout } from './layouts/RegistrarLayout'
import { StudentLayout } from './layouts/StudentLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { MyEnrollmentsPage } from './pages/student/MyEnrollmentsPage'
import { OfferingsPage } from './pages/student/OfferingsPage'

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/status', element: <HomePage /> },
  {
    path: '/secretaria',
    element: (
      <ProtectedRoute role="REGISTRAR">
        <RegistrarLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="disciplinas" replace /> },
      { path: 'disciplinas', element: <PlaceholderPage title="Disciplinas" /> },
      { path: 'professores', element: <PlaceholderPage title="Professores" /> },
      { path: 'turmas', element: <PlaceholderPage title="Turmas" /> },
    ],
  },
  {
    path: '/aluno',
    element: (
      <ProtectedRoute role="STUDENT">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="ofertas" replace /> },
      { path: 'ofertas', element: <OfferingsPage /> },
      { path: 'matriculas', element: <MyEnrollmentsPage /> },
      { path: 'progresso', element: <PlaceholderPage title="Progresso no curso" /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
