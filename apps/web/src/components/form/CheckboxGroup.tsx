import { useId } from 'react'

interface CheckboxGroupProps {
  legend: string
  options: { value: number; label: string }[]
  selected: number[]
  onChange: (selected: number[]) => void
  error?: string
  emptyMessage: string
}

export function CheckboxGroup({
  legend,
  options,
  selected,
  onChange,
  error,
  emptyMessage,
}: CheckboxGroupProps) {
  const errorId = useId()

  const toggle = (value: number) =>
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    )

  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>
      {options.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div
          className={`max-h-48 overflow-y-auto rounded-md border p-2 ${error ? 'border-red-500' : 'border-slate-300'}`}
        >
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 px-1 py-1 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  )
}
