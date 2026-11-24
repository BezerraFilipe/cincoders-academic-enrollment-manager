import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { RootRedirect } from './components/routing/RootRedirect'
import { RegistrarLayout } from './layouts/RegistrarLayout'
import { StudentLayout } from './layouts/StudentLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProfessorFormPage } from './pages/registrar/ProfessorFormPage'
import { ProfessorsPage } from './pages/registrar/ProfessorsPage'
import { SubjectFormPage } from './pages/registrar/SubjectFormPage'
import { SubjectsPage } from './pages/registrar/SubjectsPage'
import { MyEnrollmentsPage } from './pages/student/MyEnrollmentsPage'
import { OfferingsPage } from './pages/student/OfferingsPage'
import { ProgressPage } from './pages/student/ProgressPage'

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
      { path: 'disciplinas', element: <SubjectsPage /> },
      { path: 'disciplinas/nova', element: <SubjectFormPage /> },
      { path: 'disciplinas/:id/editar', element: <SubjectFormPage /> },
      { path: 'professores', element: <ProfessorsPage /> },
      { path: 'professores/novo', element: <ProfessorFormPage /> },
      { path: 'professores/:id/editar', element: <ProfessorFormPage /> },
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
      { path: 'progresso', element: <ProgressPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
