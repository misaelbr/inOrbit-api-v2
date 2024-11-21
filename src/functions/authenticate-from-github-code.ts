import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { oAuthLinkedAccounts, users } from '../db/schema'
import {
  getAccessTokenFromCode,
  getUserFromAccessToken,
} from '../modules/github-oauth'
import { authenticateUser } from '../modules/auth'
import { createUser } from './create-user'

interface authenticateFromGithubCodeRequest {
  code: string
}

interface AccessTokenResponse {
  access_token: string
}

export async function authenticateFromGithubCode({
  code,
}: authenticateFromGithubCodeRequest) {
  const accessToken = await getAccessTokenFromCode(code)
  const githubUser = await getUserFromAccessToken(accessToken)

  const result = await db
    .select()
    .from(oAuthLinkedAccounts)
    .where(
      and(
        eq(oAuthLinkedAccounts.issuer, 'github'),
        eq(oAuthLinkedAccounts.externalAccountId, githubUser.id.toString()),
        eq(oAuthLinkedAccounts.externalAccountEmail, githubUser.email)
      )
    )

  const accountAlreadLinked = result.length > 0

  let userId: string | null

  if (accountAlreadLinked) {
    userId = result[0].userId
    const token = await authenticateUser(userId)

    return { token }
  }

  const checkUser = await db
    .select()
    .from(users)
    .where(eq(users.email, githubUser.email))

  const userExists = checkUser.length > 0

  if (userExists) {
    const [insertedAccount] = await db
      .insert(oAuthLinkedAccounts)
      .values({
        userId: checkUser[0].id,
        issuer: 'github',
        externalAccountId: githubUser.id.toString(),
        externalAccountEmail: githubUser.email,
      })
      .returning()

    const token = await authenticateUser(insertedAccount.userId)
    return { token }
  }

  const { user } = await createUser({
    name: githubUser.name || '',
    email: githubUser.email,
    avatarUrl: githubUser.avatar_url,
  })

  const token = await authenticateUser(user.id)

  return { token }
}
