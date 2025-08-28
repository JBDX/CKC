import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: text("teacher_id").notNull().unique(), // login ID
  password: text("password").notNull(),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  members: text("members").array().notNull().default(sql`'{}'`),
  icon: text("icon").notNull(), // icon class name
  color: text("color").notNull(), // color class
  totalScore: integer("total_score").notNull().default(0),
});

export const scoreEntries = pgTable("score_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  action: text("action").notNull(),
  points: integer("points").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  scoreEntries: many(scoreEntries),
}));

export const scoreEntriesRelations = relations(scoreEntries, ({ one }) => ({
  team: one(teams, {
    fields: [scoreEntries.teamId],
    references: [teams.id],
  }),
  teacher: one(teachers, {
    fields: [scoreEntries.teacherId],
    references: [teachers.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  scoreEntries: many(scoreEntries),
}));

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  totalScore: true,
});

export const insertScoreEntrySchema = createInsertSchema(scoreEntries).omit({
  id: true,
  timestamp: true,
});

export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertScoreEntry = z.infer<typeof insertScoreEntrySchema>;
export type ScoreEntry = typeof scoreEntries.$inferSelect;

// For API responses
export type TeamWithRecentChange = Team & {
  recentChange: number;
};

export type ScoreEntryWithTeam = ScoreEntry & {
  team: Team;
};
