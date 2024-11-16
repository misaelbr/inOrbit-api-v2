import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authenticateUserHook } from '../hooks/authenticate-user'
import { getUser } from '../../functions/get-user'
import { getUserLevelAndExperience } from '../../functions/get-user-level-and-experience'

export const getUserLevelAndExperienceRoute: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/profile/gamification',
      {
        onRequest: [authenticateUserHook],
        schema: {
          tags: ['users', 'gamification'],
          description: 'Get user experience and level',
          operationId: 'getUserLevelAndExperience',
          response: {
            200: z.object({
              experience: z.number(),
              level: z.number(),
              experienceToNextLevel: z.number(),
            }),
          },
        },
      },
      async (request, response) => {
        const userId = request.user.sub
        const { experience, level, experienceToNextLevel } =
          await getUserLevelAndExperience({ userId })
        return response
          .status(200)
          .send({ experience, level, experienceToNextLevel })
      }
    )
  }
