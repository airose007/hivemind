import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default user
  const hashedPassword = await bcrypt.hash('HiveMind2026!', 10)
  const user = await prisma.user.upsert({
    where: { username: 'scott' },
    update: {},
    create: {
      username: 'scott',
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log('✓ Created user:', user.username)

  // Create core departments
  const departments = [
    {
      name: 'Research',
      icon: '🔬',
      description: 'Research and analysis department',
      isCore: true,
    },
    {
      name: 'Engineering',
      icon: '🛠️',
      description: 'Building and infrastructure department',
      isCore: true,
    },
    {
      name: 'Strategy',
      icon: '📊',
      description: 'Planning and strategic operations',
      isCore: true,
    },
    {
      name: 'Health/Ops',
      icon: '🏥',
      description: 'System health monitoring and operations',
      isCore: true,
    },
  ]

  const createdDepartments: any = {}
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    })
    createdDepartments[dept.name] = created
    console.log('✓ Created department:', created.name)
  }

  // Create agents
  const agents = [
    {
      name: 'Master Agent',
      role: 'master',
      model: 'opus',
      departmentId: null,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Pam',
      role: 'assistant',
      model: 'opus',
      departmentId: null,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Intelligence Router',
      role: 'router',
      model: 'haiku',
      departmentId: null,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Research Manager',
      role: 'manager',
      model: 'sonnet',
      departmentId: createdDepartments['Research'].id,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Engineering Manager',
      role: 'manager',
      model: 'sonnet',
      departmentId: createdDepartments['Engineering'].id,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Strategy Manager',
      role: 'manager',
      model: 'sonnet',
      departmentId: createdDepartments['Strategy'].id,
      healthScore: 100,
      status: 'idle',
    },
    {
      name: 'Health Monitor',
      role: 'manager',
      model: 'haiku',
      departmentId: createdDepartments['Health/Ops'].id,
      healthScore: 100,
      status: 'idle',
    },
  ]

  for (const agent of agents) {
    const created = await prisma.agent.upsert({
      where: { name: agent.name },
      update: {},
      create: agent,
    })
    console.log('✓ Created agent:', created.name)

    // Create initial health check
    await prisma.healthCheck.create({
      data: {
        agentId: created.id,
        score: 100,
        issues: [],
        metrics: {},
      },
    })

    // Create initial event
    await prisma.agentEvent.create({
      data: {
        agentId: created.id,
        type: 'started',
        message: 'Agent initialized',
        meta: {},
      },
    })
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
