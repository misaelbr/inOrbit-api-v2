import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateFromGoogleCode } from '../../functions/authenticate-from-google-code'

function isEmpty(val: string): boolean {
  return val === undefined || val == null || val.length <= 0
}

export const authenticateFromGoogleRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/auth/google',
    {
      schema: {
        tags: ['auth'],
        description: 'Authenticate user from Google',
        operationId: 'authenticateFromGoogle',
        querystring: z.object({
          auth: z.string().optional(),
        }),
        // body: z.object({
        //   code: z.string(),
        // }),
        response: {
          201: z.object({ token: z.string() }),
          401: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { auth } = request.query

      if (!auth) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const { token } = await authenticateFromGoogleCode({ code: auth })

      return reply.status(201).send({ token })
    }
  )
}
