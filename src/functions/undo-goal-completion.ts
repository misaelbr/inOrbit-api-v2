import { and, count, eq, sql } from 'drizzle-orm'
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
      completionCount: count(goalCompletions.id),
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      goalId: goals.id,
    })
    .from(goals)
    .innerJoin(goalCompletions, eq(goals.id, goalCompletions.goalId))
    .where(eq(goals.userId, userId))
    .groupBy(goals.userId, goals.desiredWeeklyFrequency, goals.id)

  const [goal] = await db
    .select({ goalId: goalCompletions.goalId })
    .from(goalCompletions)
    .where(eq(goalCompletions.id, goalCompletionId))

  if (validateUserRequest.length < 1) {
    throw new Error('User not authorized to undo this goal completion')
  }

  const statsFromGoal = validateUserRequest.filter(
    stats => stats.goalId === goal.goalId
  )

  const { completionCount, desiredWeeklyFrequency } = statsFromGoal[0]

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
