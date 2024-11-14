import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authenticateUserHook } from '../hooks/authenticate-user'
import { getUser } from '../../functions/get-user'

export const getProfileRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/profile',
    {
      onRequest: [authenticateUserHook],
      schema: {
        tags: ['users'],
        description: 'Get authenticated user profile',
        operationId: 'getProfile',
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
