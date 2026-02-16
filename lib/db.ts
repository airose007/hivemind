import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })

  // Log slow queries (>1s) in production
  client.$use(async (params, next) => {
    const start = performance.now()
    const result = await next(params)
    const duration = performance.now() - start

    if (duration > 1000) {
      console.error(
        `[SLOW QUERY] ${params.model}.${params.action} took ${duration.toFixed(0)}ms`
      )
    }

    return result
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
