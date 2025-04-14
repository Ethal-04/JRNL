import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";
import { authenticate, registerUser, verifyUser } from "./auth";
import passport from "passport";
import session from 'express-session';

//Simplified getCurrentUser function -  Replace with your actual authentication logic
function getCurrentUser(req: any): any {
  return req.session.user;
}


export async function registerRoutes(app: Express) {
  app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
  app.use(passport.initialize());
  app.use(passport.session());


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

  app.get("/api/entries",  (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Please login to continue' });
    }
    const { search, startDate, endDate } = req.query;
    const entries = storage.getEntries(currentUser.id);
    res.json(entries);
  });

  app.get("/api/entries/:id", (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Please login to continue' });
    }
    const entry = storage.getEntry(currentUser.id, Number(req.params.id));
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.post("/api/entries", (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Please login to continue' });
    }
    const parsed = insertEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = storage.createEntry(currentUser.id, parsed.data);
    res.status(201).json(entry);
  });

  app.patch("/api/entries/:id", (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Please login to continue' });
    }
    const parsed = insertEntrySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid entry data" });
      return;
    }

    const entry = storage.updateEntry(currentUser.id, Number(req.params.id), parsed.data);
    if (!entry) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.json(entry);
  });

  app.delete("/api/entries/:id", (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ message: 'Please login to continue' });
    }
    const success = storage.deleteEntry(currentUser.id, Number(req.params.id));
    if (!success) {
      res.status(404).json({ message: "Entry not found" });
      return;
    }
    res.status(204).send();
  });

  return createServer(app);
}