import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

interface getUserRequest {
  userId: string
}

export async function getUser({ userId }: getUserRequest) {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))

  const user = result[0]

  return { user }
}
