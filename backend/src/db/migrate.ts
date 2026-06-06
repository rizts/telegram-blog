import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

migrate(db, { migrationsFolder: './drizzle' }).then(() => {
  console.log('[migrate] Done');
  process.exit(0);
});
