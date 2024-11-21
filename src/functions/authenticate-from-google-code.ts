import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { oAuthLinkedAccounts, users } from '../db/schema'
import {
  getAccessTokenFromCode,
  getUserFromAccessToken,
} from '../modules/google-oauth'
import { authenticateUser } from '../modules/auth'
import { createUser } from './create-user'

interface authenticateFromGoogleCodeRequest {
  code: string
}

export async function authenticateFromGoogleCode({
  code,
}: authenticateFromGoogleCodeRequest) {
  const accessToken = await getAccessTokenFromCode(code)
  const googleUser = await getUserFromAccessToken(accessToken)

  const result = await db
    .select()
    .from(oAuthLinkedAccounts)
    .where(
      and(
        eq(oAuthLinkedAccounts.issuer, 'google'),
        eq(oAuthLinkedAccounts.externalAccountId, googleUser.id),
        eq(oAuthLinkedAccounts.externalAccountEmail, googleUser.email)
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
    .where(eq(users.email, googleUser.email))

  const userExists = checkUser.length > 0

  if (userExists) {
    const [insertedAccount] = await db
      .insert(oAuthLinkedAccounts)
      .values({
        userId: checkUser[0].id,
        issuer: 'google',
        externalAccountId: googleUser.id.toString(),
        externalAccountEmail: googleUser.email,
      })
      .returning()

    const token = await authenticateUser(insertedAccount.userId)
    return { token }
  }

  const { user } = await createUser({
    name: googleUser.name,
    email: googleUser.email,
    avatarUrl: googleUser.picture,
  })

  const token = await authenticateUser(user.id)

  return { token }
}
