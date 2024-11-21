import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateFromGithubCode } from './authenticate-from-github-code'
import { db } from '../db'
import { users } from '../db/schema'
import { and, eq, ne } from 'drizzle-orm'

import * as github from '../modules/github-oauth'
import { makeUser } from '../../tests/factories/make-user'
import { faker } from '@faker-js/faker'

describe('authenticate from github code', () => {
  beforeEach(() => {
    vi.mock('../modules/github-oauth.ts')

    vi.clearAllMocks()
  })

  it('should be able to authenticate from github code', async () => {
    vi.spyOn(github, 'getUserFromAccessToken').mockResolvedValueOnce({
      id: 123456,
      name: 'John Doe',
      email: 'johndoe@test.com',
      avatar_url: 'https://github.com/misaelbr.png',
    })

    const sut = await authenticateFromGithubCode({
      code: 'sample-github-code',
    })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'johndoe@test.com'))

    expect(userOnDb.name).toEqual('John Doe')
  })

  it('should be able to authenticate with existing github user', async () => {
    const existing = await makeUser({
      name: 'Jane Doe',
      email: 'jane@teste.com',
    })

    vi.spyOn(github, 'getUserFromAccessToken').mockResolvedValueOnce({
      id: Number(existing.id),
      name: 'John Doe',
      email: existing.email,
      avatar_url: 'https://github.com/misaelbr.png',
    })

    await db
      .delete(users)
      .where(and(eq(users.email, existing.email), ne(users.id, existing.id)))

    const sut = await authenticateFromGithubCode({
      code: 'sample-github-code',
    })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.email, existing.email))

    expect(userOnDb.name).toEqual('Jane Doe')
  })
})
