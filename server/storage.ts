
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { entries, type Entry, type InsertEntry } from "@shared/schema";

const STORAGE_DIR = 'data';

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

export interface IStorage {
  getEntries(userId: string): Promise<Entry[]>;
  getEntry(userId: string, id: number): Promise<Entry | undefined>;
  createEntry(userId: string, entry: InsertEntry): Promise<Entry>;
  updateEntry(userId: string, id: number, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(userId: string, id: number): Promise<boolean>;
}

export class CsvStorage implements IStorage {
  private getUserFile(userId: string) {
    return path.join(STORAGE_DIR, `${userId}.csv`);
  }

  private async readEntries(userId: string): Promise<Entry[]> {
    const filePath = this.getUserFile(userId);
    if (!fs.existsSync(filePath)) {
      return [];
    }

    return new Promise((resolve) => {
      const entries: Entry[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          entries.push({
            ...row,
            id: parseInt(row.id),
            date: new Date(row.date),
            emotions: row.emotions ? JSON.parse(row.emotions) : []
          });
        })
        .on('end', () => {
          resolve(entries);
        });
    });
  }

  private async writeEntries(userId: string, entries: Entry[]) {
    const csvWriter = createObjectCsvWriter({
      path: this.getUserFile(userId),
      header: [
        { id: 'id', title: 'id' },
        { id: 'title', title: 'title' },
        { id: 'content', title: 'content' },
        { id: 'date', title: 'date' },
        { id: 'prompt', title: 'prompt' },
        { id: 'emotions', title: 'emotions' }
      ]
    });

    await csvWriter.writeRecords(entries.map(entry => ({
      ...entry,
      emotions: JSON.stringify(entry.emotions)
    })));
  }

  async getEntries(userId: string): Promise<Entry[]> {
    return this.readEntries(userId);
  }

  async getEntry(userId: string, id: number): Promise<Entry | undefined> {
    const entries = await this.readEntries(userId);
    return entries.find(entry => entry.id === id);
  }

  async createEntry(userId: string, insertEntry: InsertEntry): Promise<Entry> {
    const entries = await this.readEntries(userId);
    const id = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    
    const entry: Entry = {
      ...insertEntry,
      id,
      date: new Date(),
      prompt: insertEntry.prompt ?? null,
      emotions: insertEntry.emotions ?? []
    };

    entries.push(entry);
    await this.writeEntries(userId, entries);
    return entry;
  }

  async updateEntry(userId: string, id: number, updateEntry: Partial<InsertEntry>): Promise<Entry | undefined> {
    const entries = await this.readEntries(userId);
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return undefined;

    const updated: Entry = {
      ...entries[index],
      ...updateEntry,
      prompt: updateEntry.prompt ?? entries[index].prompt,
      emotions: updateEntry.emotions ?? entries[index].emotions
    };

    entries[index] = updated;
    await this.writeEntries(userId, entries);
    return updated;
  }

  async deleteEntry(userId: string, id: number): Promise<boolean> {
    const entries = await this.readEntries(userId);
    const filtered = entries.filter(entry => entry.id !== id);
    
    if (filtered.length === entries.length) {
      return false;
    }

    await this.writeEntries(userId, filtered);
    return true;
  }
}

export const storage = new CsvStorage();
