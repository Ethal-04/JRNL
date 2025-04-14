import { createObjectCsvWriter } from 'csv-writer';
import { Entry } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { entries, type InsertEntry } from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const ENTRIES_FILE = path.join(DATA_DIR, 'entries.csv');

export class CsvStorage {
  private async readEntries(): Promise<Entry[]> {
    if (!fs.existsSync(ENTRIES_FILE)) {
      return [];
    }

    return new Promise((resolve) => {
      const entries: Entry[] = [];
      fs.createReadStream(ENTRIES_FILE)
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

  private async writeEntries(entries: Entry[]) {
    const csvWriter = createObjectCsvWriter({
      path: ENTRIES_FILE,
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

  async getEntries(): Promise<Entry[]> {
    return this.readEntries();
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    const entries = await this.readEntries();
    return entries.find(entry => entry.id === id);
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const entries = await this.readEntries();
    const id = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;

    const entry: Entry = {
      ...insertEntry,
      id,
      date: new Date(),
      prompt: insertEntry.prompt ?? null,
      emotions: insertEntry.emotions ?? []
    };

    entries.push(entry);
    await this.writeEntries(entries);
    return entry;
  }

  async updateEntry(id: number, updateEntry: Partial<InsertEntry>): Promise<Entry | undefined> {
    const entries = await this.readEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) return undefined;

    const updated: Entry = {
      ...entries[index],
      ...updateEntry,
      prompt: updateEntry.prompt ?? entries[index].prompt,
      emotions: updateEntry.emotions ?? entries[index].emotions
    };

    entries[index] = updated;
    await this.writeEntries(entries);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    const entries = await this.readEntries();
    const filtered = entries.filter(entry => entry.id !== id);

    if (filtered.length === entries.length) {
      return false;
    }

    await this.writeEntries(filtered);
    return true;
  }
}

export const storage = new CsvStorage();