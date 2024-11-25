import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { oAuthLinkedAccounts, users } from '../db/schema'
import {
  getAccessTokenFromCode,
  getUserFromAccessToken,
} from '../modules/google-oauth'
import { authenticateUser } from '../modules/auth'
import { createUser } from './create-user'
import { check } from 'drizzle-orm/mysql-core'

interface authenticateFromGoogleCodeRequest {
  code: string
}

export async function authenticateFromGoogleCode({
  code,
}: authenticateFromGoogleCodeRequest) {
  const accessToken = await getAccessTokenFromCode(code)

  if (!accessToken) {
    throw new Error('Invalid accessToken')
  }

  const googleUser = await getUserFromAccessToken(accessToken)

  const linkedAccount = await db
    .select()
    .from(oAuthLinkedAccounts)
    .where(
      and(
        eq(oAuthLinkedAccounts.issuer, 'google'),
        eq(oAuthLinkedAccounts.externalAccountId, googleUser.id),
        eq(oAuthLinkedAccounts.externalAccountEmail, googleUser.email)
      )
    )

  if (linkedAccount.length > 0) {
    const token = await authenticateUser(linkedAccount[0].userId)
    return { token }
  }

  const checkUser = await db
    .select()
    .from(users)
    .where(eq(users.email, googleUser.email))

  let userId: string

  const userExists = checkUser.length > 0

  if (userExists) {
    userId = checkUser[0].id
  } else {
    const { user } = await createUser({
      name: googleUser.name,
      email: googleUser.email,
      avatarUrl: googleUser.picture,
    })
    userId = user.id
  }

  await db.insert(oAuthLinkedAccounts).values({
    userId,
    issuer: 'google',
    externalAccountId: googleUser.id.toString(),
    externalAccountEmail: googleUser.email,
  })

  const token = await authenticateUser(userId)
  return { token }
}
