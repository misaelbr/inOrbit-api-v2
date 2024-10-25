import { describe, expect, it } from 'vitest'
import { makeUser } from '../../tests/factories/make-user'
import { makeGoal } from '../../tests/factories/make-goal'
import { makeGoalCompletion } from '../../tests/factories/make-goal-completion'
import { undoGoalCompletion } from './undo-goal-completion'
import { db } from '../db'
import { goalCompletions, users } from '../db/schema'
import { eq } from 'drizzle-orm'

describe('undo goal completion', () => {
  it('should be able to undo a goal completion and reduce experience', async () => {
    const user = await makeUser()
    const goal = await makeGoal({ userId: user.id })
    const goalCompletion = await makeGoalCompletion({ goalId: goal.id })

    // Obtem experiência inicial do usuário
    const initialUser = await db
      .select({ experience: users.experience })
      .from(users)
      .where(eq(users.id, user.id))
    const initialExperience = initialUser[0].experience

    // Chama a função de undo
    await undoGoalCompletion({
      userId: user.id,
      goalCompletionId: goalCompletion.id,
    })

    // Verifica se o goalCompletion foi deletado
    const deletedGoalCompletion = await db
      .select()
      .from(goalCompletions)
      .where(eq(goalCompletions.id, goalCompletion.id))
    expect(deletedGoalCompletion.length).toBe(0)

    // Verifica se a experiência foi reduzida corretamente
    const updatedUser = await db
      .select({ experience: users.experience })
      .from(users)
      .where(eq(users.id, user.id))
    expect(updatedUser[0].experience).toBe(initialExperience - 5)
  })

  it('should not be able to undo a goal completion from another user', async () => {
    const user = await makeUser()
    const otherUser = await makeUser()
    const goal = await makeGoal({ userId: otherUser.id })
    const goalCompletion = await makeGoalCompletion({ goalId: goal.id })

    await expect(
      undoGoalCompletion({
        userId: user.id,
        goalCompletionId: goalCompletion.id,
      })
    ).rejects.toThrow('User not authorized to undo this goal completion')
  })
})
