import { promises as fs } from "fs";
import path from "path";
import type { Repository } from "./repo";
import type { Branch, Offer, Settings, ValuationRequest } from "../types";
import { defaultSettings, seedBranches, seedOffers } from "./seed";

/**
 * File-backed store for local development / single-server hosting.
 * Falls back to memory when the filesystem is read-only (e.g. serverless).
 */
interface Db {
  settings: Settings;
  branches: Branch[];
  offers: Offer[];
  requests: ValuationRequest[];
}

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");
export const UPLOAD_DIR = path.join(DIR, "uploads");

let memory: Db | null = null;
let writable = true;

/** Always re-read the file: route handlers and pages may run in separate module instances. */
async function load(): Promise<Db> {
  if (writable) {
    try {
      const db = JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
      db.settings = { ...defaultSettings, ...db.settings };
      memory = db;
      return db;
    } catch {
      /* first run: fall through to seed */
    }
  }
  if (!memory) memory = { settings: defaultSettings, branches: seedBranches, offers: seedOffers, requests: [] };
  return memory;
}

async function save(db: Db) {
  memory = db;
  if (!writable) return;
  try {
    await fs.mkdir(DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, FILE);
  } catch {
    writable = false;
  }
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) list.unshift(item);
  else list[i] = item;
}

export const localRepo: Repository = {
  async getSettings() {
    return (await load()).settings;
  },
  async saveSettings(s) {
    const db = await load();
    db.settings = { ...s, updatedAt: new Date().toISOString() };
    await save(db);
    return db.settings;
  },
  async listBranches(all) {
    const b = (await load()).branches;
    return all ? b : b.filter((x) => x.active);
  },
  async upsertBranch(b) {
    const db = await load();
    upsert(db.branches, b);
    await save(db);
  },
  async deleteBranch(id) {
    const db = await load();
    db.branches = db.branches.filter((b) => b.id !== id);
    await save(db);
  },
  async listOffers(all) {
    const o = (await load()).offers;
    return all ? o : o.filter((x) => x.active);
  },
  async upsertOffer(o) {
    const db = await load();
    upsert(db.offers, o);
    await save(db);
  },
  async deleteOffer(id) {
    const db = await load();
    db.offers = db.offers.filter((o) => o.id !== id);
    await save(db);
  },
  async listRequests() {
    return (await load()).requests;
  },
  async createRequest(r) {
    const db = await load();
    db.requests.unshift(r);
    await save(db);
  },
  async updateRequest(id, patch) {
    const db = await load();
    const r = db.requests.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
    await save(db);
  },
  async deleteRequest(id) {
    const db = await load();
    db.requests = db.requests.filter((r) => r.id !== id);
    await save(db);
  },
  async uploadPhoto(name, data) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(data));
    return name;
  },
  async photoUrl(key) {
    return `/api/admin/photo/${encodeURIComponent(key)}`;
  },
};
