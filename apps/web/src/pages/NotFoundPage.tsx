import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="text-slate-600">O endereço acessado não existe.</p>
      <Link to="/" className="text-blue-700 underline">
        Voltar para o início
      </Link>
    </main>
  )
}
