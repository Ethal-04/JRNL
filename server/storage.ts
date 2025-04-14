
import { createObjectCsvWriter } from 'csv-writer';
import { Entry } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

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

  async createEntry(entry: Omit<Entry, 'id' | 'date'>): Promise<Entry> {
    const entries = await this.readEntries();
    const id = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;

    const newEntry: Entry = {
      ...entry,
      id,
      date: new Date(),
      emotions: entry.emotions ?? []
    };

    entries.push(newEntry);
    await this.writeEntries(entries);
    return newEntry;
  }

  async updateEntry(id: number, updates: Partial<Entry>): Promise<Entry | undefined> {
    const entries = await this.readEntries();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return undefined;

    entries[index] = {
      ...entries[index],
      ...updates,
      id: entries[index].id,
      date: entries[index].date
    };

    await this.writeEntries(entries);
    return entries[index];
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
