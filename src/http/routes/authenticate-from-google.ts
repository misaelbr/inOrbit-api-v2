import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateFromGoogleCode } from '../../functions/authenticate-from-google-code'

export const authenticateFromGoogleRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/auth/google',
    {
      schema: {
        tags: ['auth'],
        description: 'Authenticate user from Google',
        operationId: 'authenticateFromGoogle',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({ token: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const { token } = await authenticateFromGoogleCode({ code })

      return reply.status(201).send({ token })
    }
  )
}
