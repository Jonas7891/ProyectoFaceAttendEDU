import { pgTable, serial, integer, bigint, varchar, timestamp } from 'drizzle-orm/pg-core';
// Academic schema example — 7 tables
export const school = pgTable('school', { schoolId: serial('school_id').primaryKey(), name: varchar('name').notNull() });
