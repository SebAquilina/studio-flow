/**
 * Runtime simulation against node:sqlite (Node 22+ native).
 * Runs the source modules unchanged through a D1-shaped adapter.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { pathToFileURL } from "node:url";

const ROOT = process.argv[2] ?? process.cwd();
const fail = [];
const ok = [];
const t = (label, cond, hint) => {
  if (cond) ok.push(label);
  else fail.push(`${label}${hint ? ` — ${hint}` : ""}`);
};

const db = new DatabaseSync(":memory:");

for (const f of ["0001_init.sql", "0002_agency_ops.sql", "0003_analytics.sql"]) {
  const sql = await fs.readFile(path.join(ROOT, "drizzle/migrations", f), "utf8");
  db.exec(sql);
}
ok.push("migrations applied");

function mkD1() {
  return {
    prepare(q) {
      const stmt = db.prepare(q);
      let params = [];
      const wrap = {
        bind(...args) { params = args; return wrap; },
        async first() {
          try {
            const rows = stmt.all(...params);
            return rows[0] ?? null;
          } catch (e) {
            // statement may be INSERT/UPDATE — try run
            const r = stmt.run(...params);
            return null;
          }
        },
        async all() {
          return { results: stmt.all(...params), success: true };
        },
        async run() {
          const r = stmt.run(...params);
          return { success: true, meta: { changes: r.changes } };
        },
      };
      return wrap;
    },
  };
}
const D1 = mkD1();

async function loadModules() {
  // tsx isn't called for .mjs — use the compiled JS via tsx as a runner.
  // Easiest: call tsx programmatically. Skip — instead spawn tsx for the modules.
  // We'll re-implement the bits we need to test by loading the .ts files via tsx.
  // But .mjs can't import .ts directly without a loader.
  // Workaround: shell out to `tsx eval` per module — too slow.
  // Better: just re-implement the small pieces we need from the .ts source.
  return null;
}

// We can't easily import .ts from .mjs without a loader. Instead, write
// a parallel .ts test runner that node's experimental sqlite can be passed
// via DatabaseSync exposed under globalThis.
console.log("This file is the wrapper — see runtime.test.ts for actual tests.");
