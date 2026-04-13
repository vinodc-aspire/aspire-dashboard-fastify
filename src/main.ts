import { buildServer } from './server'
import * as dotenv from 'dotenv'
dotenv.config()

async function gracefulShutdown({ app }: { app: Awaited<ReturnType<typeof buildServer>> }) {
  await app.close()
}

async function main() {
  const app = await buildServer()

  await app.listen({
    port: Number(process.env.PORT) || 3001,
    host: '0.0.0.0',
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => gracefulShutdown({ app }))
  }
}

main()
