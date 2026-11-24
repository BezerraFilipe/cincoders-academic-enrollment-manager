export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
      {message}
    </p>
  )
}
