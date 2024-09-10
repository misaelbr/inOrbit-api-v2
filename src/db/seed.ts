import dayjs from 'dayjs'
import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'Fazer exercícios', desiredWeeklyFrequency: 3 },
      { title: 'Estudar inglês', desiredWeeklyFrequency: 7 },
    ])
    .returning()

  const startoOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createdAt: startoOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startoOfWeek.add(1, 'day').toDate() },
    { goalId: result[2].id, createdAt: startoOfWeek.add(3, 'day').toDate() },
  ])
}

seed().finally(() => client.end())
