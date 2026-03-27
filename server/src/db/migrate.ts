import pool from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrate = async () => {
  try {
    const migrationFile = path.join(__dirname, 'migration_dm_link_metadata.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    
    console.log('Running migration:');
    console.log(sql);
    
    await pool.query(sql);
    console.log('Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
