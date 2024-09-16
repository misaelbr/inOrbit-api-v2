import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { undoGoalCompletion } from '../../functions/undo-goal-completion'

export const undoCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/completions/:goalCompletionId/undo',
    {
      schema: {
        params: z.object({
          goalCompletionId: z.string(),
        }),
      },
    },
    async request => {
      const { goalCompletionId } = request.params

      await undoGoalCompletion({ goalCompletionId })

      return { success: true }
    }
  )
}
