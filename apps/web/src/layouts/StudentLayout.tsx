import { NavLink, Outlet } from 'react-router'
import { AppHeader } from './AppHeader'
import { StudentDetails } from './StudentDetails'

const LINKS = [
  { to: 'ofertas', label: 'Ofertas' },
  { to: 'matriculas', label: 'Matrículas' },
  { to: 'progresso', label: 'Progresso' },
]

export function StudentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader title="Área do aluno" details={<StudentDetails />} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-20">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <ul className="mx-auto grid max-w-3xl grid-cols-3">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block py-3 text-center text-sm ${isActive ? 'font-semibold text-blue-800' : 'text-slate-600'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
