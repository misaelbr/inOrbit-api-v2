import type { InferSelectModel } from 'drizzle-orm'
import { db } from '../../src/db'
import { goals } from '../../src/db/schema'

import { fakerPT_BR as faker } from '@faker-js/faker'

export async function makeGoal(
  override: Partial<InferSelectModel<typeof goals>> &
    Pick<InferSelectModel<typeof goals>, 'userId'>
) {
  const [row] = await db
    .insert(goals)
    .values({
      title: faker.lorem.word(),
      desiredWeeklyFrequency: faker.number.int({ min: 1, max: 7 }),
      ...override,
    })
    .returning()

  return row
}
