import { readFile, readdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

import { kPrismaDir } from "../constants.js";
import { type Logger } from "../utils/logger.ts";

const kMigrationsDir = `${kPrismaDir}/migrations`;
const kMigrationTableName = "_migrations";
const kCreateMigrationTable = `CREATE TABLE IF NOT EXISTS "${kMigrationTableName}" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
)`;
const kListMigrations = `SELECT migration_name FROM ${kMigrationTableName} ORDER BY started_at`;
const kCreateMigration = `INSERT INTO ${kMigrationTableName} (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const decoder = new TextDecoder("utf-8");
const kIgnoredNames = ["migration_lock.toml", ".DS_Store"];

export class Migrator {
  #db: DatabaseSync;
  #logger: Logger;

  constructor(databasePath: string, logger: Logger) {
    this.#db = new DatabaseSync(databasePath);
    this.#logger = logger.child({ name: "migrator" });
  }

  async runMigrations() {
    const migrations = (await readdir(kMigrationsDir))
      .filter((name) => !kIgnoredNames.includes(name))
      .sort();

    this.#db.exec(kCreateMigrationTable);

    const existingMigrations = this.#db
      .prepare(kListMigrations)
      .all()
      .map((row) => row.migration_name);

    const insert = this.#db.prepare(kCreateMigration);
    for (const migration of migrations) {
      if (existingMigrations.includes(migration)) {
        this.#logger.info(`Skipping migration ${migration}, already applied.`);
        continue;
      }
      const startedAt = Date.now();
      const migrationPath = `${kMigrationsDir}/${migration}/migration.sql`;
      const sqlBuffer = await readFile(migrationPath);
      const sql = decoder.decode(sqlBuffer);
      this.#db.exec(sql);

      const finishedAt = Date.now();
      const checksum = await crypto.subtle.digest("SHA-256", sqlBuffer);
      insert.run(
        crypto.randomUUID(),
        Buffer.from(checksum).toString("hex"),
        finishedAt,
        migration,
        "",
        null,
        startedAt,
        1,
      );
    }
  }

  [Symbol.dispose]() {
    this.#logger.info("Closing database connection");
    this.#db.close();
  }
}
