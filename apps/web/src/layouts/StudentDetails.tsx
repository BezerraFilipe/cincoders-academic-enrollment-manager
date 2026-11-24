import { useAuth } from '../features/auth/auth-context'
import { useCurrentUser } from '../features/auth/use-current-user'

export function StudentDetails() {
  const { user } = useAuth()
  const { data } = useCurrentUser()
  const student = data?.student

  return (
    <dl className="mt-1 flex flex-col gap-0.5 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
      <div className="flex gap-1">
        <dt className="sr-only">E-mail</dt>
        <dd className="truncate">{data?.email ?? user?.email}</dd>
      </div>
      {student && (
        <>
          <div className="flex gap-1">
            <dt>Matrícula:</dt>
            <dd>{student.registrationNumber}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Curso:</dt>
            <dd>{student.course.name}</dd>
          </div>
        </>
      )}
    </dl>
  )
}
