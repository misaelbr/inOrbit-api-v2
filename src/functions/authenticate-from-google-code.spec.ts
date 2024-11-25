import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateFromGoogleCode } from './authenticate-from-google-code'
import { db } from '../db'
import { users } from '../db/schema'
import { and, eq, ne } from 'drizzle-orm'

import * as google from '../modules/google-oauth'
import { makeUser } from '../../tests/factories/make-user'

describe('authenticate from google code', () => {
  beforeEach(() => {
    vi.mock('../modules/google-oauth.ts')

    vi.clearAllMocks()
  })

  it('should be able to authenticate from google code', async () => {
    vi.spyOn(google, 'getUserFromAccessToken').mockResolvedValueOnce({
      id: '123456',
      name: 'John Doe',
      email: 'johndoe@test.com',
      picture:
        'https://lh3.googleusercontent.com/ogw/AF2bZyg3TbtKmeA3-q-YcUkHdpCsi_NXWw1DZIVjzEaSaNyrOdgA=s124-c-mo',
    })

    vi.spyOn(google, 'getAccessTokenFromCode').mockResolvedValueOnce(
      'umtokemdetestes'
    )

    const sut = await authenticateFromGoogleCode({
      code: 'sample-google-code',
    })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'johndoe@test.com'))

    expect(userOnDb.name).toEqual('John Doe')
  })

  it('should be able to authenticate with existing google user', async () => {
    const existing = await makeUser({
      name: 'Jane Doe',
      email: 'jane@teste.com',
    })

    vi.spyOn(google, 'getUserFromAccessToken').mockResolvedValueOnce({
      id: existing.id,
      name: 'John Doe',
      email: existing.email,
      picture:
        'https://lh3.googleusercontent.com/ogw/AF2bZyg3TbtKmeA3-q-YcUkHdpCsi_NXWw1DZIVjzEaSaNyrOdgA=s124-c-mo',
    })

    vi.spyOn(google, 'getAccessTokenFromCode').mockResolvedValueOnce(
      'umtokemdetestes'
    )

    await db
      .delete(users)
      .where(and(eq(users.email, existing.email), ne(users.id, existing.id)))

    const sut = await authenticateFromGoogleCode({
      code: 'sample-google-code',
    })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.email, existing.email))

    expect(userOnDb.name).toEqual('Jane Doe')
  })
})
