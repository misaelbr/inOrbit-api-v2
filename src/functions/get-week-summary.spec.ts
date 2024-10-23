import { describe, expect, it } from 'vitest'
import { makeUser } from '../../tests/factories/make-user'
import { makeGoal } from '../../tests/factories/make-goal'
import { makeGoalCompletion } from '../../tests/factories/make-goal-completion'
import { getWeekSummary } from './get-week-summary'
import dayjs from 'dayjs'

describe('get week summary', () => {
  it('should be able to get week summary', async () => {
    const weekStartsAt = dayjs(new Date(2024, 9, 20))
      .startOf('week')
      .toDate()

    const user = await makeUser()
    const goal1 = await makeGoal({
      userId: user.id,
      title: 'Meditar',
      desiredWeeklyFrequency: 2,
      createdAt: weekStartsAt,
    })
    const goal2 = await makeGoal({
      userId: user.id,
      title: 'Nadar',
      desiredWeeklyFrequency: 1,
      createdAt: weekStartsAt,
    })
    const goal3 = await makeGoal({
      userId: user.id,
      title: 'Ler',
      desiredWeeklyFrequency: 3,
      createdAt: weekStartsAt,
    })

    await makeGoalCompletion({
      goalId: goal1.id,
      createdAt: dayjs(weekStartsAt).add(2, 'days').toDate(),
    })
    await makeGoalCompletion({
      goalId: goal2.id,
      createdAt: dayjs(weekStartsAt).add(2, 'days').toDate(),
    })
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(1, 'days').toDate(),
    })
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(3, 'days').toDate(),
    })

    const result = await getWeekSummary({
      userId: user.id,
      weekStartsAt,
    })

    // summary: {
    //   completed: number;
    //   total: number;
    //   goalsPerDay: Record<string, {
    //       id: string;
    //       title: string;
    //       completedAt: string;
    //   }[]

    expect(result).toEqual({
      summary: {
        completed: 4,
        total: 6,
        goalsPerDay: {
          '2024-10-23': expect.arrayContaining([
            expect.objectContaining({ title: 'Ler' }),
          ]),
          '2024-10-22': expect.arrayContaining([
            expect.objectContaining({ title: 'Nadar' }),
            expect.objectContaining({ title: 'Meditar' }),
          ]),
          '2024-10-21': expect.arrayContaining([
            expect.objectContaining({ title: 'Ler' }),
          ]),
        },
      },
    })
  })
})
