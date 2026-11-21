import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface Common {
  label: string
  /** Shown in the reserved line under the control; takes the place of `hint`. */
  error?: string
  hint?: string
}
type InputProps = Common & InputHTMLAttributes<HTMLInputElement> & { multiline?: false }
type AreaProps = Common & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true }

/** Label above, control, then a message line whose height is always reserved (no layout jump). */
export function Field({ label, error = '', hint = '', multiline, className = '', id, ...rest }: InputProps | AreaProps) {
  const auto = useId()
  const fieldId = id ?? auto
  const msgId = `${fieldId}-msg`
  const aria = { id: fieldId, className: 'hx-input', 'aria-invalid': error ? true : undefined, 'aria-describedby': msgId }
  return (
    <div className={`hx-field ${className}`}>
      <label htmlFor={fieldId} className="hx-field__label">
        {label}
      </label>
      {multiline ? (
        <textarea {...aria} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...aria} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      <p id={msgId} className="hx-field__msg" data-error={error ? '' : undefined} aria-live="polite">
        {error || hint}
      </p>
    </div>
  )
}
