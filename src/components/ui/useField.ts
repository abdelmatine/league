import { useState, type ChangeEvent } from 'react'

/** Blur-first validation: no error until the first blur (or `check()` on submit); once an error
 *  shows, it updates as the visitor types and clears the moment the value is fixed.
 *  `validate` returns an error message, or '' when the value is fine. */
export function useField(validate: (value: string) => string, initial = '') {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState('')
  return {
    value,
    error,
    valid: validate(value) === '',
    /** Show the error now (submit). Returns true when valid. */
    check: () => {
      const msg = validate(value)
      setError(msg)
      return msg === ''
    },
    reset: () => {
      setValue(initial)
      setError('')
    },
    /** Spread on <Field>. */
    input: {
      value,
      error,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value)
        if (error) setError(validate(e.target.value))
      },
      onBlur: () => setError(validate(value)),
    },
  }
}
