import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals'
import z, { string } from 'zod'
import { authenticateUserHook } from '../hooks/authenticate-user'
import { getUser } from '../../functions/get-user'

export const getProfileRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/profile',
    {
      schema: {
        onRequest: [authenticateUserHook],
        tags: ['users'],
        description: 'Get authenticated user profile',
        response: {
          200: z.object({
            profile: z.object({
              id: z.string(),
              email: z.string().nullable(),
              name: z.string().nullable(),
              avatarUrl: z.string().url(),
            }),
          }),
        },
      },
    },
    async (request, response) => {
      const userId = request.user.sub
      const { user: profile } = await getUser({ userId })
      return response.status(200).send({ profile })
    }
  )
}
