import { NavLink, Outlet } from 'react-router'
import { AppHeader } from './AppHeader'

const LINKS = [
  { to: 'disciplinas', label: 'Disciplinas' },
  { to: 'professores', label: 'Professores' },
  { to: 'turmas', label: 'Turmas' },
]

export function RegistrarLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader title="Secretaria de Graduação" />
      <div className="flex flex-1">
        <nav className="w-56 shrink-0 border-r border-slate-200 bg-white p-3">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-50 font-medium text-blue-800' : 'text-slate-700 hover:bg-slate-100'}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
