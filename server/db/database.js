import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, 'marshal_erp.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

// In-memory KV store emulator (matches Cloudflare KV bindings interface)
const memoryKV = new Map();

export const kv = {
  async get(key, type = 'text') {
    const val = memoryKV.get(key);
    if (!val) return null;
    if (type === 'json') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  },
  async put(key, value, options = {}) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    memoryKV.set(key, serialized);
    if (options.expirationTtl) {
      setTimeout(() => memoryKV.delete(key), options.expirationTtl * 1000);
    }
    return true;
  },
  async delete(key) {
    return memoryKV.delete(key);
  },
  async list({ prefix = '' } = {}) {
    const keys = [];
    for (const k of memoryKV.keys()) {
      if (k.startsWith(prefix)) keys.push({ name: k });
    }
    return { keys };
  }
};

export default db;
