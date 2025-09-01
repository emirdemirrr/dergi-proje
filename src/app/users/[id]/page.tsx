import { prisma } from '@/lib/prisma'

export default async function UserProfile({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) },
    include: {
      roles: { include: { role: true } },
      badges: { include: { badge: true } }
    }
  })

  if (!user) {
    return <div className="p-8">User not found</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl">{user.name}</h1>
      {user.bio && <p className="mt-2">{user.bio}</p>}
      <div className="mt-4">
        <h2 className="font-semibold">Roles</h2>
        <ul>
          {user.roles.map(ur => (
            <li key={ur.roleId}>{ur.role.name}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="font-semibold">Badges</h2>
        <ul>
          {user.badges.map(ub => (
            <li key={ub.badgeId}>{ub.badge.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
