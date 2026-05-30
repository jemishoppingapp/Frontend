/**
 * Idempotent seed: create or upgrade the JEMI super-admin.
 *
 * - If no user with SEED_ADMIN_EMAIL exists: creates one with role='admin'.
 * - If a user exists: promotes them to admin and resets the password
 *   (so you can recover access if you forgot it).
 * - profile_completed is preserved — fill in the rest at /profile/complete.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Required env (in .env.local):
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD  (min 8 chars, with a letter and a number)
 *   SEED_ADMIN_NAME
 */
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

const BCRYPT_ROUNDS = 12;

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('SEED_ADMIN_PASSWORD must contain at least one letter and one number.');
  }
}

function validateEmail(email: string): void {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('SEED_ADMIN_EMAIL is not a valid email address.');
  }
}

async function main() {
  const rawEmail = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME;

  if (!rawEmail || !password || !name) {
    console.error('Missing required env vars:');
    console.error('  SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME');
    console.error('Set them in .env.local.');
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  validateEmail(email);
  validatePassword(password);

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Does this email already exist?
  const existing = await db()
    .select({
      id: schema.users.id,
      role: schema.users.role,
      profileCompleted: schema.users.profileCompleted,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing.length > 0) {
    const row = existing[0];
    const wasAdmin = row.role === 'admin';
    await db()
      .update(schema.users)
      .set({
        role: 'admin',
        password: hash,
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, row.id));

    console.log('');
    console.log(wasAdmin
      ? `  Admin password reset for ${email}`
      : `  Promoted ${email} to admin (was: ${row.role}), password reset`);
    console.log(`  profile_completed: ${row.profileCompleted ? 'yes' : 'no (visit /profile/complete after sign-in)'}`);
  } else {
    await db().insert(schema.users).values({
      email,
      password: hash,
      name: name.trim(),
      role: 'admin',
      profileCompleted: false,
    });

    console.log('');
    console.log(`  Created admin ${email}`);
    console.log(`  Sign in at /login, then visit /profile/complete to fill in phone/dept/level`);
  }

  console.log('');
  console.log('Done.');
}

main().catch((err) => {
  console.error('seed:admin failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
