import { afterEach, expect, test } from 'vitest'
import { createServer, type ViteDevServer } from 'vite'
import { createApp } from '../server/app.js'

let vite: ViteDevServer | undefined

afterEach(async () => {
  await vite?.close()
  vite = undefined
})

test('API responds over HTTP', async () => {
  const app = createApp()

  try {
    const address = await app.listen({ port: 0, host: '127.0.0.1' })
    const response = await fetch(`${address}/health`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  } finally {
    await app.close()
  }
})

test('frontend serves the application page', async () => {
  vite = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await vite.listen()

  const address = vite.resolvedUrls?.local[0]
  expect(address).toBeDefined()

  const response = await fetch(address!)
  expect(response.status).toBe(200)
  expect(await response.text()).toContain('<title>Календарь звонков</title>')
})
