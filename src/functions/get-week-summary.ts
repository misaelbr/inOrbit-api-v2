import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault('America/Sao_Paulo')
dayjs.extend(weekOfYear)

interface getWeekSummaryRequest {
  userId: string
  weekStartsAt: Date
}

export async function getWeekSummary({
  userId,
  weekStartsAt,
}: getWeekSummaryRequest) {
  const firstDayOfWeek = weekStartsAt
  const lastDayOfWeek = dayjs(weekStartsAt).endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(
        and(
          lte(goals.createdAt, lastDayOfWeek),
          gte(goals.createdAt, firstDayOfWeek),
          eq(goals.userId, userId)
        )
      )
  )

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql /*sql*/`
          DATE(${goalCompletions.createdAt} AT TIME ZONE 'America/Sao_Paulo')
        `.as('completedAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goals.userId, userId)
        )
      )
      .orderBy(goalCompletions.createdAt)
  )

  const goalsCompletedWeekByWeekDay = db
    .$with('goals_completed_week_by_week_day')
    .as(
      db
        .select({
          completetedAtDate: goalsCompletedInWeek.completedAtDate,
          completions: sql /*sql*/`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ${goalsCompletedInWeek.id},
                'title', ${goalsCompletedInWeek.title},
                'completedAt', ${goalsCompletedInWeek.completedAt}
              )
            )
          `.as('completions'),
        })
        .from(goalsCompletedInWeek)
        .groupBy(goalsCompletedInWeek.completedAtDate)
        .orderBy(desc(goalsCompletedInWeek.completedAtDate))
    )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >

  const result = await db
    .with(
      goalsCreatedUpToWeek,
      goalsCompletedInWeek,
      goalsCompletedWeekByWeekDay
    )
    .select({
      completed: sql /*sql*/`(
        SELECT 
          COUNT(*)
        FROM ${goalsCompletedInWeek}
      )`
        .mapWith(Number)
        .as('completed'),
      total: sql /*sql*/`(
        SELECT
          SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency})
        FROM ${goalsCreatedUpToWeek}
      )`
        .mapWith(Number)
        .as('total'),
      goalsPerDay: sql /*sql*/<GoalsPerDay>`(
        JSON_OBJECT_AGG(
          ${goalsCompletedWeekByWeekDay.completetedAtDate},
          ${goalsCompletedWeekByWeekDay.completions}
        )
      )`,
    })
    .from(goalsCompletedWeekByWeekDay)

  return {
    summary: result[0],
  }
}
