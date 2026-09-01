import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  familyId: text('family_id'),
  createdAt: integer('created_at').notNull(),
})

export const families = sqliteTable('families', {
  id: text('id').primaryKey(),
  createdByUserId: text('created_by_user_id').notNull(),
  createdAt: integer('created_at').notNull(),
})

export const familyAdults = sqliteTable('family_adults', {
  id: text('id').primaryKey(),
  familyId: text('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role').notNull(),
})

export const children = sqliteTable('children', {
  id: text('id').primaryKey(),
  familyId: text('family_id'),
  name: text('name').notNull(),
  gender: text('gender').notNull().default('menino'),
  skinTone: text('skin_tone').notNull().default('golden'),
  hairType: text('hair_type').notNull().default('wavy'),
  hairColor: text('hair_color').notNull().default('brown'),
  createdAt: integer('created_at').notNull(),
})

export const pecsCards = sqliteTable('pecs_cards', {
  id: text('id').primaryKey(),
  childId: text('child_id')
    .notNull()
    .references(() => children.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  kind: text('kind').notNull(),
  label: text('label').notNull(),
  speak: text('speak').notNull(),
  imageSrc: text('image_src').notNull(),
  tone: text('tone').notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const pottyEvents = sqliteTable('potty_events', {
  id: text('id').primaryKey(),
  childId: text('child_id')
    .notNull()
    .references(() => children.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  occurredAt: integer('occurred_at').notNull(),
})

export const stars = sqliteTable(
  'stars',
  {
    id: text('id').primaryKey(),
    childId: text('child_id')
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    kind: text('kind').notNull(),
  },
  (table) => ({
    childDateKind: uniqueIndex('stars_child_date_kind').on(
      table.childId,
      table.date,
      table.kind,
    ),
  }),
)
