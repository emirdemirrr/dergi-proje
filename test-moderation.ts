import { PrismaClient } from '@prisma/client'
import { addRole, removeRole, warnUser, muteUser, giveBadge, deleteUser } from './src/lib/moderation'

const prisma = new PrismaClient()

async function run() {
  const emails = ['admin@test.com', 'mod1@test.com', 'mod2@test.com', 'target@test.com']
  const users = await prisma.user.findMany({ where: { email: { in: emails } } })
  const ids = users.map(u => u.id)
  await prisma.userBadge.deleteMany({ where: { userId: { in: ids } } })
  await prisma.userRole.deleteMany({ where: { userId: { in: ids } } })
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@test.com', password: 'x' }
  })
  const mod1 = await prisma.user.upsert({
    where: { email: 'mod1@test.com' },
    update: {},
    create: { name: 'Mod1', email: 'mod1@test.com', password: 'x' }
  })
  const mod2 = await prisma.user.upsert({
    where: { email: 'mod2@test.com' },
    update: {},
    create: { name: 'Mod2', email: 'mod2@test.com', password: 'x' }
  })
  const target = await prisma.user.upsert({
    where: { email: 'target@test.com' },
    update: {},
    create: { name: 'Target', email: 'target@test.com', password: 'x' }
  })

  await addRole(admin.id, 'admin')
  await addRole(mod1.id, 'moderator')
  await addRole(mod2.id, 'moderator')
  await addRole(target.id, 'member')
  await removeRole(target.id, 'member')

  await warnUser(target.id)
  await muteUser(target.id)
  await giveBadge(target.id, 'first-purchase')

  try {
    await deleteUser([mod1.id], target.id)
  } catch (e) {
    console.log('Single moderator delete blocked')
  }

  await deleteUser([mod1.id, mod2.id], target.id)
  const remaining = await prisma.user.count()
  console.log('Remaining users:', remaining)
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect())
