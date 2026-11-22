import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

interface Common {
  size?: 'md' | 'lg'
  children: ReactNode
}
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
/** With `href` it renders a link, otherwise a `type="button"` button. */
export type ButtonProps = AsButton | AsLink

function ButtonBase({ variant, size = 'md', className = '', children, ...rest }: ButtonProps & { variant: 'gold' | 'magic' }) {
  const cls = `hx-btn hx-btn--${variant}${size === 'lg' ? ' hx-btn--lg' : ''} ${className}`
  const inner = (
    <>
      <span className="hx-btn__fx" aria-hidden="true" />
      {children}
    </>
  )
  if (rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    )
  }
  const { type = 'button', ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} className={cls} {...button}>
      {inner}
    </button>
  )
}

/** Secondary actions. */
export const GoldButton = (props: ButtonProps) => <ButtonBase variant="gold" {...props} />
/** Game actions only: PLAY, ACCEPT, LOCK IN, SEND, VIEW PROJECTS. */
export const MagicButton = (props: ButtonProps) => <ButtonBase variant="magic" {...props} />
