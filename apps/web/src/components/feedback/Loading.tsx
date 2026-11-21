interface LoadingProps {
  message?: string
}

export function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <div role="status" className="flex items-center gap-3 py-8 text-slate-600">
      <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span>{message}</span>
    </div>
  )
}
