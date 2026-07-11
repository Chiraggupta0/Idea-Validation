import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'light'
  size?: 'lg' | 'md' | 'sm'
  type?: 'button' | 'submit'
  className?: string
}

export default function SkeuoButton({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'lg',
  type = 'button',
  className = '',
}: Props) {
  const cls = `btn btn-${variant} btn-${size} ${className}`
  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} className={cls}>{children}</a>
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
