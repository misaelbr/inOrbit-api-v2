import { describe, expect, it } from 'vitest'
import { createUser } from './create-user'
import { faker } from '@faker-js/faker'

describe('create user', () => {
  it('should be able to create a user', async () => {
    const result = await createUser({
      email: 'johndoe@test.com',
      name: 'John Doe',
      avatarUrl: faker.image.avatarGitHub(),
    })
    expect(result).toEqual({
      user: expect.objectContaining({
        id: expect.any(String),
        email: 'johndoe@test.com',
        name: 'John Doe',
        avatarUrl: expect.stringContaining('github'),
      }),
    })
  })
})
