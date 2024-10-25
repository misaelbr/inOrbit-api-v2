import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals, users } from '../db/schema'

interface UndoGoalCompletionRequest {
  userId: string
  goalCompletionId: string
}

export async function undoGoalCompletion({
  userId,
  goalCompletionId,
}: UndoGoalCompletionRequest) {
  const validateUserRequest = await db
    .select({
      userId: goals.userId,
      completionCount: sql`COUNT(${goalCompletions.id})`.as('completionCount'),
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
    })
    .from(goals)
    .innerJoin(goalCompletions, eq(goals.id, goalCompletions.goalId))
    .where(
      and(eq(goals.userId, userId), eq(goalCompletions.id, goalCompletionId))
    )
    .groupBy(goals.userId, goals.desiredWeeklyFrequency)

  if (validateUserRequest.length < 1) {
    throw new Error('User not authorized to undo this goal completion')
  }

  const { completionCount, desiredWeeklyFrequency } = validateUserRequest[0]

  const isGoalCompleted = completionCount === desiredWeeklyFrequency
  const experienceToSubtract = isGoalCompleted ? 7 : 5

  await db.transaction(async tx => {
    await tx
      .delete(goalCompletions)
      .where(eq(goalCompletions.id, goalCompletionId))

    await tx
      .update(users)
      .set({
        experience: sql`${users.experience} - ${experienceToSubtract}`,
      })
      .where(eq(users.id, userId))
  })
}
