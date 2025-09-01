import { prisma } from './prisma'

export async function warnUser(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { warnings: { increment: 1 } }
  })
}

export async function muteUser(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { muted: true }
  })
}

export async function addRole(userId: number, roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) throw new Error('Role not found')
  return prisma.userRole.create({ data: { userId, roleId: role.id } })
}

export async function removeRole(userId: number, roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) throw new Error('Role not found')
  return prisma.userRole.delete({ where: { userId_roleId: { userId, roleId: role.id } } })
}

export async function giveBadge(userId: number, badgeName: string) {
  const badge = await prisma.badge.upsert({
    where: { name: badgeName },
    update: {},
    create: { name: badgeName }
  })
  return prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
}

export async function deleteUser(actingUserIds: number[], targetUserId: number) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId: { in: actingUserIds } },
    include: { role: true }
  })
  const hasAdmin = userRoles.some(r => r.role.name === 'admin')
  const modCount = userRoles.filter(r => r.role.name === 'moderator').length
  if (!hasAdmin && modCount < 2) {
    throw new Error('Not enough permissions to delete user')
  }
  await prisma.userBadge.deleteMany({ where: { userId: targetUserId } })
  await prisma.userRole.deleteMany({ where: { userId: targetUserId } })
  return prisma.user.delete({ where: { id: targetUserId } })
}
