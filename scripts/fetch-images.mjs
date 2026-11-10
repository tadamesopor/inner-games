// downloads the real InnerGames photos once and makes web versions (webp, 1600 and 800 wide)
// run: node scripts/fetch-images.mjs   (add --force to download again)
// originals go to .cache/img-src (not in git), web versions to public/assets/img
import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const BASE = 'https://innergames.nl/wp-content/uploads/'
const OUT = 'public/assets/img'
const CACHE = '.cache/img-src'
const WIDTHS = [1600, 800]
const force = process.argv.includes('--force')

// [folder/name, file after BASE]. the list comes from docs/Figma_Make_Prompt_v5 section 3
const IMAGES = [
  ['site/home-hero', '2026/03/IMG_4853-1-scaled-e1772544533859-2048x1082.jpg'],
  ['site/samen-aan-tafel', '2026/03/IMG_1563-scaled.jpeg'],
  ['site/workshops-hero', '2026/03/IMG_4842-1-2048x1365.jpg'],
  ['site/games-hero', '2026/03/IMG_4889-1-710x375.jpg'],
  ['site/trainer-hero', '2026/03/IMG_4993-scaled.jpg'],

  ['workshops/energiek-team', '2026/03/Avans-workshop-e1774535365508.jpg'],
  ['workshops/ontdek-jouw-drijfveren', '2026/03/IMG_4842-1-2048x1365.jpg'],
  ['workshops/de-klimaat-collage', '2026/02/IMG_4917-1-scaled-e1772543858639-2048x1082.jpg'],
  ['workshops/het-impact-imperium', '2026/02/unnamed-bijgesneden-e1772542268769-2048x1081.jpg'],
  ['workshops/hoofd-en-lichaam', '2026/03/PHOTO-2025-04-25-11-35-44.jpg'],
  ['workshops/hoezo-raar', '2026/01/WhatsApp-Image-2025-11-17-at-09.57.21-e1770743799840.jpeg'],
  ['workshops/positive-masculinity', '2026/02/pexels-cottonbro-7236598-2048x1065.png'],
  ['workshops/kansen-keren', '2026/02/DSC_3106-kansen-keren-e1772542529843.webp'],
  ['workshops/memorystory', '2026/09/IMG_3006-2-scaled-e1790263800689-2048x1299.jpeg'],

  ['games/elemental-five-compleet', '2026/05/The-Elemental-Five-compleet-1.png'],
  ['games/elemental-five-grondankers', '2026/08/The-Elemental-Five-grondankers.png'],
  ['games/elemental-five-kaartenset', '2026/08/The-Elemental-Five-kaarten.png'],
  ['games/elemental-five-opstelling', '2026/08/WhatsApp-Image-2026-07-06-at-12.54.42-710x375.jpeg'],
  ['games/impact-imperium', '2026/03/Impact-Imperium_Mockup-scaled-1-2048x1536.jpg'],
  ['games/sociality', '2026/03/Sociality-speeldoos-scaled-e1774361978411.png'],
  ['games/kansen-keren', '2026/03/kansenkeren.jpeg'],

  ['projects/kansenkeren-senior', '2026/10/1791211197993.jpeg'],
  ['projects/ready-to-board', '2026/10/1786627271470.jpeg'],
  ['projects/sociality-cases', '2026/10/1789629336965.jpeg'],
  ['projects/wisselwerk', '2026/10/1791562637029.jpeg'],
  ['projects/memorystory-app', '2026/09/IMG_3006-2-scaled-e1790263800689-2048x1299.jpeg'],

  ['team/arien', '2026/03/IMG_4930-450x450.jpg'],
  ['team/sanne', '2026/03/IMG_4981-450x450.jpg'],
  ['team/aron', '2026/03/IMG_4968-450x450.jpg'],
  ['team/carinda', '2026/02/carinda-portret-copy-450x450.jpg'],
  ['team/wies', '2026/02/Wies-portret-oranje-450x450.jpg'],
]

const exists = (p) => access(p).then(() => true, () => false)

async function original(file) {
  const local = join(CACHE, file)
  if (!force && (await exists(local))) return readFile(local)
  const res = await fetch(BASE + file)
  if (!res.ok) throw new Error(`${res.status} for ${file}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(dirname(local), { recursive: true })
  await writeFile(local, buf)
  return buf
}

const rows = []
for (const [name, file] of IMAGES) {
  const buf = await original(file)
  const meta = await sharp(buf).metadata()
  await mkdir(dirname(join(OUT, name)), { recursive: true })
  // never upscale: a small source gets the same file for both widths
  for (const w of WIDTHS) {
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(OUT, `${name}-${w}.webp`))
  }
  rows.push(`| \`${name}\` | ${meta.width}×${meta.height} | ${BASE}${file} |`)
  console.log('ok', name, `${meta.width}x${meta.height}`)
}

await writeFile(
  join(OUT, 'SOURCES.md'),
  `# Image sources\n\nMade by \`scripts/fetch-images.mjs\`. Each name has a \`-1600.webp\` and an \`-800.webp\` version (never upscaled).\n\n| Name | Original size | Original URL |\n|---|---|---|\n${rows.join('\n')}\n`,
)
