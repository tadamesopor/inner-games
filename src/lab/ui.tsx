// shared bits for the motion lab demos
import { useEffect, type RefObject } from 'react'
// the split button and the pencil marks are shared with the prototype
export { PencilMark, SplitBtn } from '../motionui'

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

export type Effect = { n: string; name: string; cls: string; what: string; why: string }
