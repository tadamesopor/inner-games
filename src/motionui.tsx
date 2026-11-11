// the React side of the motion pieces that the prototype and the motion lab both use.
// the look and the movement are in src/motion/ (plain css), these only write the markup.
import { useEffect, useState, type ReactNode } from 'react'
import { loadMark, markMarkup } from './motion'

/** a drawn mark from /assets/draw/<name>.svg in the pencil style */
export function PencilMark({ name, className = '' }: { name: string; className?: string }) {
  const [html, setHtml] = useState<{ viewBox: string; inner: string } | null>(null)
  useEffect(() => {
    let live = true
    loadMark(name).then((m) => live && setHtml({ viewBox: m.viewBox, inner: markMarkup(m) }))
    return () => {
      live = false
    }
  }, [name])
  return <svg className={`ig-pencil ${className}`} viewBox={html?.viewBox} aria-hidden focusable="false" dangerouslySetInnerHTML={{ __html: html?.inner ?? '' }} />
}

/** the split button: text part + arrow part, for main actions only */
export function SplitBtn({
  children,
  tone = 'orange',
  onClick,
  className = '',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  tone?: 'orange' | 'ink' | 'cream'
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${tone === 'orange' ? 'ig-btn-split' : `ig-btn-split ig-btn-split--${tone}`} disabled:opacity-50 ${className}`}
    >
      {/* two copies of the text and the arrow, for the roll on hover */}
      <span className="ig-btn-split__label">
        <span className="ig-btn-split__roll">
          <span>{children}</span>
          <span aria-hidden>{children}</span>
        </span>
      </span>
      <span className="ig-btn-split__arrow" aria-hidden>
        <span className="ig-btn-split__roll">
          <span>
            <PencilMark name="arrow" />
          </span>
          <span>
            <PencilMark name="arrow" />
          </span>
        </span>
      </span>
    </button>
  )
}
