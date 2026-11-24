import { useState } from 'react'

interface ConfirmableDeleteProps {
  itemLabel: string
  onConfirm: () => void
  isDeleting: boolean
  disabled: boolean
}

export function ConfirmableDelete({
  itemLabel,
  onConfirm,
  isDeleting,
  disabled,
}: ConfirmableDeleteProps) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        aria-label={`Excluir ${itemLabel}`}
        className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        Excluir
      </button>
    )
  }

  return (
    <span className="inline-flex gap-3">
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        aria-label={`Confirmar exclusão de ${itemLabel}`}
        className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50"
      >
        {isDeleting ? 'Excluindo...' : 'Confirmar'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isDeleting}
        className="text-sm text-slate-600 hover:underline"
      >
        Cancelar
      </button>
    </span>
  )
}
