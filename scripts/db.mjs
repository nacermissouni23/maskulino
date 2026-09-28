// DB helper: run migrations / queries over direct Postgres.
// Usage: node scripts/db.mjs migrate <dev|prod> | node scripts/db.mjs query <dev|prod> "select 1"
import pg from "pg";
import { readFileSync } from "fs";

const REFS = {
  dev: { ref: "qlvwrdzrcdahzfgnllmy", host: "aws-1-eu-west-1.pooler.supabase.com" },
  prod: { ref: "iwidrvkeczoowsagracz", host: "aws-1-eu-central-1.pooler.supabase.com" },
};
const PW = process.env.SUPABASE_DB_PASSWORD;
if (!PW) {
  console.error("Set SUPABASE_DB_PASSWORD first");
  process.exit(1);
}

const MIGRATIONS = {
  dev: ["0001_schema.sql", "0002_seed_base.sql", "0003_seed_catalog.sql", "0006_category_slug.sql", "0007_public_tracking.sql", "0005_storage.sql", "0004_seed_demo.sql"],
  prod: ["0001_schema.sql", "0002_seed_base.sql", "0003_seed_catalog.sql", "0006_category_slug.sql", "0007_public_tracking.sql", "0005_storage.sql"],
};

const cmd = process.argv[2];
const env = process.argv[3];
const pool = new pg.Pool({
  host: REFS[env].host,
  port: 5432,
  user: `postgres.${REFS[env].ref}`,
  password: PW,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

if (cmd === "migrate") {
  for (const f of MIGRATIONS[env]) {
    const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
    try {
      await pool.query(sql);
      console.log(`${f} OK`);
    } catch (e) {
      console.error(`${f} FAIL: ${e.message}`);
      await pool.end();
      process.exit(1);
    }
  }
} else if (cmd === "query") {
  const res = await pool.query(process.argv.slice(4).join(" "));
  console.log(JSON.stringify(res.rows, null, 2).slice(0, 4000));
}
await pool.end();
