import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

console.log('[migrate] Running migrations...');
migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.log('[migrate] Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[migrate] Failed to migrate:', err);
    process.exit(1);
  });
