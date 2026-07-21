export default function PageHead({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="eyebrow text-[var(--ink-soft)]">// {eyebrow}</div>}
      <h1 className="display mt-1 text-2xl sm:text-3xl">{title}</h1>
      {children && <p className="mt-1 text-sm text-[var(--ink-soft)]">{children}</p>}
    </div>
  )
}
