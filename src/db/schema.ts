import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text('name'),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  experience: integer('experience').notNull().default(0),
})

export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  desiredWeeklyFrequency: integer('desired_weekly_frequency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const goalCompletions = pgTable('goal_completions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  goalId: text('goal_id')
    .references(() => goals.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const oAuthLinkedAccounts = pgTable('oauth_linked_accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text('user_id').notNull(),
  issuer: text('issuer').notNull(),
  externalAccountId: text('external_account_id').notNull(),
  externalAccountEmail: text('external_account_email').notNull(),
})
