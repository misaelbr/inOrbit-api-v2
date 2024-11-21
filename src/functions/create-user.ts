import { db } from '../db'
import { users } from '../db/schema'

interface createUserRequest {
  name: string
  email: string
  avatarUrl: string
}

export async function createUser({
  name,
  email,
  avatarUrl,
}: createUserRequest) {
  const [result] = await db
    .insert(users)
    .values({ name, email, avatarUrl })
    .returning()

  return { user: result }
}
