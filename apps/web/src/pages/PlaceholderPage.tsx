export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="text-slate-600">Em construção.</p>
    </section>
  )
}
