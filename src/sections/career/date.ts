const month = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Content dates for display: '2023-04' -> 'Apr 2023'; a bare year stays as it is. */
export function formatMonth(date: string) {
  const [y, m] = date.split('-').map(Number)
  return m ? month.format(Date.UTC(y, m - 1)) : String(y)
}
