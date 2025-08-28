import { 
  teachers, 
  teams, 
  scoreEntries,
  type Teacher, 
  type InsertTeacher,
  type Team,
  type InsertTeam,
  type ScoreEntry,
  type InsertScoreEntry,
  type TeamWithRecentChange,
  type ScoreEntryWithTeam
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  // Teachers
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;

  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeamsWithRecentChanges(): Promise<TeamWithRecentChange[]>;
  getTeam(id: string): Promise<Team | undefined>;
  updateTeamScore(teamId: string, scoreChange: number): Promise<void>;

  // Score Entries
  createScoreEntry(entry: InsertScoreEntry): Promise<ScoreEntry>;
  getRecentScoreEntries(limit?: number): Promise<ScoreEntryWithTeam[]>;
  getTeamScoreEntriesThisWeek(teamId: string): Promise<ScoreEntry[]>;

  // Initialization
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }

  async getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.teacherId, teacherId));
    return teacher || undefined;
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const [teacher] = await db
      .insert(teachers)
      .values(insertTeacher)
      .returning();
    return teacher;
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamsWithRecentChanges(): Promise<TeamWithRecentChange[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allTeams = await this.getAllTeams();
    
    const teamsWithChanges = await Promise.all(
      allTeams.map(async (team) => {
        const weeklyEntries = await this.getTeamScoreEntriesThisWeek(team.id);
        const recentChange = weeklyEntries.reduce((sum, entry) => sum + entry.points, 0);
        
        return {
          ...team,
          recentChange
        };
      })
    );

    return teamsWithChanges;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async updateTeamScore(teamId: string, scoreChange: number): Promise<void> {
    await db
      .update(teams)
      .set({
        totalScore: sql`${teams.totalScore} + ${scoreChange}`
      })
      .where(eq(teams.id, teamId));
  }

  async createScoreEntry(entry: InsertScoreEntry): Promise<ScoreEntry> {
    const [scoreEntry] = await db
      .insert(scoreEntries)
      .values(entry)
      .returning();

    // Update team total score
    await this.updateTeamScore(entry.teamId, entry.points);

    return scoreEntry;
  }

  async getRecentScoreEntries(limit: number = 10): Promise<ScoreEntryWithTeam[]> {
    const entries = await db
      .select({
        id: scoreEntries.id,
        teamId: scoreEntries.teamId,
        teacherId: scoreEntries.teacherId,
        action: scoreEntries.action,
        points: scoreEntries.points,
        timestamp: scoreEntries.timestamp,
        team: teams
      })
      .from(scoreEntries)
      .innerJoin(teams, eq(scoreEntries.teamId, teams.id))
      .orderBy(desc(scoreEntries.timestamp))
      .limit(limit);

    return entries;
  }

  async getTeamScoreEntriesThisWeek(teamId: string): Promise<ScoreEntry[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return await db
      .select()
      .from(scoreEntries)
      .where(
        sql`${scoreEntries.teamId} = ${teamId} AND ${scoreEntries.timestamp} >= ${oneWeekAgo}`
      )
      .orderBy(desc(scoreEntries.timestamp));
  }

  async initializeDefaultData(): Promise<void> {
    // Check if teams already exist
    const existingTeams = await this.getAllTeams();
    if (existingTeams.length > 0) {
      return; // Data already initialized
    }

    // Create default teams
    const defaultTeams = [
      {
        name: "Les Aigles",
        members: ["Emma", "Lucas", "Chloé", "Antoine"],
        icon: "fas fa-eagle",
        color: "blue"
      },
      {
        name: "Les Lions", 
        members: ["Sophie", "Thomas", "Léa", "Maxime"],
        icon: "fas fa-crown",
        color: "orange"
      },
      {
        name: "Les Dauphins",
        members: ["Camille", "Hugo", "Marie", "Paul"], 
        icon: "fas fa-fish",
        color: "cyan"
      },
      {
        name: "Les Tigres",
        members: ["Julia", "Nathan", "Sarah", "Victor"],
        icon: "fas fa-fire", 
        color: "yellow"
      }
    ];

    for (const team of defaultTeams) {
      await db.insert(teams).values(team);
    }

    // Create a default teacher
    await db.insert(teachers).values({
      teacherId: "ENS001",
      password: "password123"
    });
  }
}

export const storage = new DatabaseStorage();
