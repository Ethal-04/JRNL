import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/entries", async (_req, res) => {
    const entries = await storage.getEntries();
    res.json(entries);
  });

  app.get("/api/entries/:id", async (req, res) => {
    const entry = await storage.getEntry(Number(req.params.id));
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.post("/api/entries", async (req, res) => {
    const parsed = insertEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = await storage.createEntry(parsed.data);
    res.status(201).json(entry);
  });

  app.patch("/api/entries/:id", async (req, res) => {
    const parsed = insertEntrySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = await storage.updateEntry(Number(req.params.id), parsed.data);
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.delete("/api/entries/:id", async (req, res) => {
    const success = await storage.deleteEntry(Number(req.params.id));
    if (!success) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.status(204).send();
  });

  return createServer(app);
}
