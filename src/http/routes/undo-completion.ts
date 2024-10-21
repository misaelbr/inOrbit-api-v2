import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { undoGoalCompletion } from '../../functions/undo-goal-completion'

export const undoCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/completions/:goalCompletionId/undo',
    {
      schema: {
        tags: ['goals'],
        description: 'Undo goal completion',
        params: z.object({
          goalCompletionId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, response) => {
      const { goalCompletionId } = request.params

      await undoGoalCompletion({ goalCompletionId })

      return response.status(204).send()
    }
  )
}
