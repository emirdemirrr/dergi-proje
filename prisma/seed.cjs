const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Sistem yöneticisi',
      permissions: JSON.stringify(['manage_users', 'manage_roles'])
    }
  })

  await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Topluluk moderatörü',
      permissions: JSON.stringify(['warn_users', 'mute_users'])
    }
  })

  await prisma.role.upsert({
    where: { name: 'member' },
    update: {},
    create: { name: 'member', description: 'Normal kullanıcı' }
  })

  await prisma.badge.upsert({
    where: { name: 'first-purchase' },
    update: {},
    create: { name: 'first-purchase', icon: '🎉' }
  })
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
