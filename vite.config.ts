import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// only for `npm run dev`: /api/submit runs the same function as on Vercel (api/submit.ts), with the env
// vars from .env.local. so the test mode can be tried on your own laptop without `vercel dev`
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use('/api/submit', async (req, res) => {
        let raw = ''
        for await (const chunk of req) raw += chunk
        let body: unknown = raw
        try {
          body = JSON.parse(raw)
        } catch {
          /* the function answers 400 */
        }
        const { default: handler } = await server.ssrLoadModule('/api/submit.ts')
        const out = {
          status(code: number) {
            res.statusCode = code
            return out
          },
          json(data: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          },
        }
        await handler({ method: req.method, headers: req.headers, body }, out)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})
