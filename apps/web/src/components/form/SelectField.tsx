import { useId, type SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder: string
}

export function SelectField({
  label,
  error,
  hint,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
        className={`rounded-md border bg-white px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-slate-300'}`}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {message && (
        <p id={messageId} className={`text-sm ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
