import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";
import { authenticate, registerUser } from "./auth";
import passport from "passport";

export async function registerRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      await registerUser(username, password);
      req.session.user = username;
      res.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const isValid = await verifyUser(username, password);
    
    if (isValid) {
      req.session.user = username;
      res.json({ message: "Logged in successfully" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  app.get("/api/entries", authenticate, async (req, res) => {
    const { search, startDate, endDate } = req.query;
    const entries = await storage.getEntries(req.user.id);
    res.json(entries);
  });

  app.get("/api/entries/:id", authenticate, async (req, res) => {
    const entry = await storage.getEntry(req.user.id, Number(req.params.id));
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.post("/api/entries", authenticate, async (req, res) => {
    const parsed = insertEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = await storage.createEntry(req.user.id, parsed.data);
    res.status(201).json(entry);
  });

  app.patch("/api/entries/:id", authenticate, async (req, res) => {
    const parsed = insertEntrySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = await storage.updateEntry(req.user.id, Number(req.params.id), parsed.data);
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.delete("/api/entries/:id", authenticate, async (req, res) => {
    const success = await storage.deleteEntry(req.user.id, Number(req.params.id));
    if (!success) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.status(204).send();
  });

  return createServer(app);
}