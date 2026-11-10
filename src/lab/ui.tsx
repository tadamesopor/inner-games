// shared bits for the motion lab demos
import { useEffect, useState, type RefObject } from 'react'
import { loadMark, markMarkup } from '../motion'

/** starts a plain js effect on an element while it's switched on */
export function useEffectInit<T extends HTMLElement>(ref: RefObject<T>, init: (el: T) => () => void, on: boolean) {
  useEffect(() => {
    if (!on || !ref.current) return
    return init(ref.current)
  }, [on, init, ref])
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="lab-switch">
      <span className="lab-switch__track" aria-hidden />
      <span className="text-[13px]">{on ? 'aan' : 'uit'}</span>
    </button>
  )
}

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

export type Effect = { n: string; name: string; cls: string; what: string; why: string }
