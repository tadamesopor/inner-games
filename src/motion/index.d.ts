// types for the plain js motion modules, so the React app can use them
type Stop = () => void
export function isReduced(): boolean
export function forceReduced(value: boolean | null): void
export function onReducedChange(f: (reduced: boolean) => void): () => void
export function igNavigate(update: () => void, opts?: { mode?: 'full' | 'short' | 'off'; fadeTarget?: HTMLElement }): Promise<void>
export function initPageLinks(opts?: { mode?: 'full' | 'short' | 'off' }): Stop
export function initSpeelpad(root: HTMLElement, opts?: { pawn?: string }): Stop
export function initCards(root?: HTMLElement): Stop
export function initFooterReveal(footer: HTMLElement): Stop
export function initNav(nav: HTMLElement): Stop
export function initBoxscene(root: HTMLElement): Stop
export function init(scope?: ParentNode): Stop
export type Mark = { viewBox: string; inner: string }
export function loadMark(name: string): Promise<Mark>
export function markMarkup(mark: Mark): string
export function hydrateMarks(root?: ParentNode): Promise<void>
export function setPencilBase(url: string): void
export function ensurePencilDefs(): void
export function initHeroWaves(svg: SVGSVGElement): Stop
export function initHeroTable(stage: HTMLElement): Stop
