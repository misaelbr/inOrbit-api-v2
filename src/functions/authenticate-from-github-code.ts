import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import {
  getAccessTokenFromCode,
  getUserFromAccessToken,
} from '../modules/github-oauth'
import { authenticateUser } from '../modules/auth'

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
    .from(users)
    .where(eq(users.externalAccountId, githubUser.id))

  const userAlreadExists = result.length > 0

  let userId: string | null

  if (userAlreadExists) {
    userId = result[0].id
  } else {
    const [insertedUser] = await db
      .insert(users)
      .values({
        name: githubUser.name,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        externalAccountId: githubUser.id,
      })
      .returning()

    userId = insertedUser.id
  }

  const token = await authenticateUser(userId)

  return { token }
}
