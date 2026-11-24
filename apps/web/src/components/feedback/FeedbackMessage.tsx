export interface Feedback {
  type: 'success' | 'error'
  message: string
}

interface FeedbackMessageProps {
  feedback: Feedback
  onDismiss: () => void
}

export function FeedbackMessage({ feedback, onDismiss }: FeedbackMessageProps) {
  const isError = feedback.type === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-md p-3 text-sm ${
        isError ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
      }`}
    >
      <p>{feedback.message}</p>
      <button type="button" onClick={onDismiss} aria-label="Fechar mensagem" className="font-bold">
        ×
      </button>
    </div>
  )
}
