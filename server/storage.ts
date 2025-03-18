import { entries, type Entry, type InsertEntry } from "@shared/schema";

export interface IStorage {
  getEntries(): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry | undefined>;
  createEntry(entry: InsertEntry): Promise<Entry>;
  updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, Entry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getEntries(): Promise<Entry[]> {
    return Array.from(this.entries.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const id = this.currentId++;
    const entry: Entry = {
      ...insertEntry,
      id,
      date: new Date(),
      prompt: insertEntry.prompt ?? null,
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateEntry(id: number, updateEntry: Partial<InsertEntry>): Promise<Entry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: Entry = {
      ...existing,
      ...updateEntry,
      prompt: updateEntry.prompt ?? existing.prompt,
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    return this.entries.delete(id);
  }
}

export const storage = new MemStorage();