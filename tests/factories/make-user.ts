import type { InferSelectModel } from 'drizzle-orm'
import { db } from '../../src/db'
import { users } from '../../src/db/schema'

import { fakerPT_BR as faker } from '@faker-js/faker'

export async function makeUser(
  override: Partial<InferSelectModel<typeof users>> = {}
) {
  const [row] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      ...override,
    })
    .returning()

  return row
}
