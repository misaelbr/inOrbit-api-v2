import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals'
import z, { string } from 'zod'

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/pending-goals',
    {
      schema: {
        tags: ['goals'],
        description: 'Get pending goals',
        response: {
          200: z.object({
            pendingGoals: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                desiredWeeklyFrequency: z.number(),
                completionCount: z.number(),
              })
            ),
          }),
        },
      },
    },
    async (_, response) => {
      const { pendingGoals } = await getWeekPendingGoals()

      return response.status(200).send({ pendingGoals })
    }
  )
}
