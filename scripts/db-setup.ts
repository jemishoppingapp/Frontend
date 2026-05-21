/**
 * Runs db/setup.sql against the configured DATABASE_URL.
 * Idempotent — re-running is safe.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Split SQL into individual statements, respecting dollar-quoted blocks
 * (DO $$ ... $$ and CREATE FUNCTION ... AS $$ ... $$ contain semicolons
 * inside their bodies that are NOT statement terminators).
 */
function splitSql(input: string): string[] {
  const cleaned = input
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart();
      return trimmed.startsWith('--') ? '' : line;
    })
    .join('\n');

  const statements: string[] = [];
  let current = '';
  let inDollarBlock = false;
  let i = 0;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (ch === '$' && cleaned[i + 1] === '$') {
      inDollarBlock = !inDollarBlock;
      current += '$$';
      i += 2;
      continue;
    }
    if (ch === ';' && !inDollarBlock) {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = '';
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  const trailing = current.trim();
  if (trailing.length > 0) statements.push(trailing);
  return statements;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set. Add it to .env.local.');
    process.exit(1);
  }
  const sqlPath = resolve(process.cwd(), 'db/setup.sql');
  const setupSql = readFileSync(sqlPath, 'utf8');

  const sql = neon(url);
  const statements = splitSql(setupSql);

  console.log(`Executing ${statements.length} statements from db/setup.sql\n`);

  for (const stmt of statements) {
    const firstLine = stmt.split('\n')[0].slice(0, 70);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sql as any)(stmt);
      console.log(`  ✓ ${firstLine}`);
    } catch (err) {
      console.error(`  ✗ FAILED: ${firstLine}`);
      throw err;
    }
  }

  console.log('\nDone. Postgres extras configured.');
}

main().catch((err) => {
  console.error('db:setup failed:', err);
  process.exit(1);
});