interface ErrorWithRetryProps {
  message?: string
  onRetry: () => void
  isRetrying?: boolean
}

export function ErrorWithRetry({
  message = 'Não foi possível se comunicar com o servidor.',
  onRetry,
  isRetrying = false,
}: ErrorWithRetryProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
      >
        {isRetrying ? 'Tentando...' : 'Tentar novamente'}
      </button>
    </div>
  )
}
