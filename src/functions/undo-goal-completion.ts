import { eq } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

interface UndoGoalCompletionRequest {
  goalCompletionId: string
}

export async function undoGoalCompletion({
  goalCompletionId,
}: UndoGoalCompletionRequest) {
  const result = await db
    .delete(goalCompletions)
    .where(eq(goalCompletions.id, goalCompletionId))
}
