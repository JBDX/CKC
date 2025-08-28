import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScoreEntrySchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  teacherId: z.string().min(1, "L'identifiant est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await storage.initializeDefaultData();

  // Get all teams with recent changes for public view
  app.get("/api/teams", async (_req, res) => {
    try {
      const teams = await storage.getTeamsWithRecentChanges();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des équipes" });
    }
  });

  // Get recent score entries for activities feed
  app.get("/api/recent-activities", async (_req, res) => {
    try {
      const activities = await storage.getRecentScoreEntries(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des activités" });
    }
  });

  // Teacher login
  app.post("/api/login", async (req, res) => {
    try {
      const { teacherId, password } = loginSchema.parse(req.body);
      
      const teacher = await storage.getTeacherByTeacherId(teacherId);
      if (!teacher || teacher.password !== password) {
        return res.status(401).json({ message: "Identifiant ou mot de passe incorrect" });
      }

      // In a real app, you'd set up proper session management
      res.json({ 
        message: "Connexion réussie",
        teacher: { id: teacher.id, teacherId: teacher.teacherId }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  // Create score entry (restricted)
  app.post("/api/score-entries", async (req, res) => {
    try {
      const entryData = insertScoreEntrySchema.parse(req.body);
      
      // Validate team exists
      const team = await storage.getTeam(entryData.teamId);
      if (!team) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }

      // Validate teacher exists
      const teacher = await storage.getTeacher(entryData.teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Enseignant non trouvé" });
      }

      const scoreEntry = await storage.createScoreEntry(entryData);
      res.json({ 
        message: "Score bien saisi !",
        scoreEntry 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating score entry:", error);
      res.status(500).json({ message: "Erreur lors de la saisie du score" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
