import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

interface UndoGoalCompletionRequest {
  userId: string
  goalCompletionId: string
}

export async function undoGoalCompletion({
  userId,
  goalCompletionId,
}: UndoGoalCompletionRequest) {
  const validateUserRequest = await db
    .select({ userId: goals.userId })
    .from(goals)
    .innerJoin(goalCompletions, eq(goals.id, goalCompletions.goalId))
    .where(
      and(eq(goals.userId, userId), eq(goalCompletions.id, goalCompletionId))
    )

  if (validateUserRequest.length < 1) {
    throw new Error('User not authorized to undo this goal completion')
  }

  await db
    .delete(goalCompletions)
    .where(and(eq(goalCompletions.id, goalCompletionId)))
}
