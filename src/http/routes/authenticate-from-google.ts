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
        querystring: z
          .object({
            code: z.string(),
          })
          .refine(v => !v.code || v.code.length < 1, {
            message: 'code is required',
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
      const { code } = request.query

      const { token } = await authenticateFromGoogleCode({ code })

      if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      return reply.status(201).send({ token })
    }
  )
}
