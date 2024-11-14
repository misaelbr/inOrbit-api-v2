import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import {
  calculateExperienceForNextLevel,
  calculateLevelFromExperience,
} from '../modules/gamification'

interface getUserLevelAndExperienceRequest {
  userId: string
}

export async function getUserLevelAndExperience({
  userId,
}: getUserLevelAndExperienceRequest) {
  const [{ experience }] = await db
    .select({
      experience: users.experience,
    })
    .from(users)
    .where(eq(users.id, userId))

  const level = calculateLevelFromExperience(experience)
  const experienceToNextLevel = calculateExperienceForNextLevel(level)

  return {
    experience,
    level,
    experienceToNextLevel,
  }
}
