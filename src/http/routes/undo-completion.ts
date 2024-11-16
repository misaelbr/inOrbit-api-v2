import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { undoGoalCompletion } from '../../functions/undo-goal-completion'
import { authenticateUserHook } from '../hooks/authenticate-user'

export const undoCompletionRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/completions/:goalCompletionId/undo',
    {
      onRequest: [authenticateUserHook],
      schema: {
        tags: ['goals'],
        description: 'Undo goal completion',
        operationId: 'undoCompletion',
        params: z.object({
          goalCompletionId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, response) => {
      const userId = request.user.sub
      const { goalCompletionId } = request.params

      await undoGoalCompletion({ userId, goalCompletionId })

      return response.status(204).send()
    }
  )
}
