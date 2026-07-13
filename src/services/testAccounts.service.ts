import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import bcrypt from 'bcryptjs'

export async function getTestAccounts(db: NodePgDatabase) {
  const result = await db.execute(sql.raw(`
    SELECT u.id, u.email, asd.student_name AS name, u.role, asd.curriculum_id, u.created_at
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    WHERE u.is_test_account = true
    ORDER BY u.created_at DESC
  `))
  return (result.rows as Record<string, unknown>[]).map(row => ({
    id: String(row.id),
    email: row.email,
    name: row.name || row.email,
    role: row.role,
    curriculum_id: row.curriculum_id,
    created_at: row.created_at,
  }))
}

export async function searchUserByEmail(db: NodePgDatabase, email: string) {
  const result = await db.execute(sql`
    SELECT u.id, u.email, asd.student_name AS name, u.role
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    WHERE u.email = ${email}
      AND u.deleted_at IS NULL
    LIMIT 1
  `)
  if (!result.rows.length) return null
  const row = result.rows[0] as Record<string, unknown>
  return {
    id: String(row.id),
    email: row.email,
    name: row.name || row.email,
    role: row.role,
  }
}

export async function createTestAccount(
  db: NodePgDatabase,
  data: { email: string; password: string; name: string; role: string; curriculum: number; grade?: number }
) {
  const { email, password, name, role, curriculum, grade } = data

  // Check for duplicate email
  const existing = await db.execute(sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `)
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered') as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Insert user
  const userResult = await db.execute(sql`
    INSERT INTO users (email, password, role, is_test_account, verified_at, created_at, updated_at)
    VALUES (${email}, ${hashedPassword}, ${role}, true, NOW(), NOW(), NOW())
    RETURNING id
  `)
  const userId = (userResult.rows[0] as { id: bigint }).id

  // Insert additional_signup_data (NOT NULL columns require placeholder values for test accounts)
  await db.execute(sql`
    INSERT INTO additional_signup_data (user_id, student_name, curriculum_id, user_type, subjects, school_year, age, purpose, interesting_activities, created_at, updated_at)
    VALUES (${userId}::bigint, ${name}, ${curriculum}, ${role}, '[]', ${grade ?? 1}, 0, '[]', '[]', NOW(), NOW())
  `)

  // Insert profile (gender and born_at are NOT NULL with no defaults)
  await db.execute(sql`
    INSERT INTO profiles (user_id, name, class, gender, born_at, created_at, updated_at)
    VALUES (${userId}::bigint, ${name}, ${grade ?? 1}, false, '2000-01-01', NOW(), NOW())
  `)

  return { id: String(userId), email, name, role, curriculum_id: curriculum, created_at: new Date() }
}

export async function toggleTestAccount(
  db: NodePgDatabase,
  userId: string,
  isTestAccount: boolean
) {
  const result = await db.execute(sql`
    UPDATE users
    SET is_test_account = ${isTestAccount}, updated_at = NOW()
    WHERE id = ${BigInt(userId)}
    RETURNING id, email, is_test_account
  `)
  if (!result.rows.length) {
    const err = new Error('User not found') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }
  const row = result.rows[0] as Record<string, unknown>
  return { id: String(row.id), email: row.email, is_testaccount: row.is_test_account }
}

export async function bulkMarkTestAccounts(db: NodePgDatabase, emails: string[]) {
  const normalized = Array.from(
    new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.length > 0))
  )

  if (normalized.length === 0) {
    const err = new Error('At least one email is required') as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  const found = await db.execute(sql`
    SELECT u.id, u.email, asd.student_name AS name, u.is_test_account
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    WHERE LOWER(u.email) = ANY(${normalized}::text[])
      AND u.deleted_at IS NULL
  `)

  const byEmail = new Map<string, { id: string; name: unknown; is_test_account: boolean }>()
  for (const row of found.rows as Record<string, unknown>[]) {
    byEmail.set(String(row.email).toLowerCase(), {
      id: String(row.id),
      name: row.name,
      is_test_account: Boolean(row.is_test_account),
    })
  }

  const toMarkIds: string[] = []
  for (const email of normalized) {
    const match = byEmail.get(email)
    if (match && !match.is_test_account) {
      toMarkIds.push(match.id)
    }
  }

  if (toMarkIds.length > 0) {
    await db.execute(sql`
      UPDATE users
      SET is_test_account = true, updated_at = NOW()
      WHERE id = ANY(${toMarkIds}::bigint[])
    `)
  }

  return normalized.map(email => {
    const match = byEmail.get(email)
    if (!match) {
      return { email, status: 'not_found' as const }
    }
    if (match.is_test_account) {
      return { email, status: 'already_test_account' as const, id: match.id, name: match.name ?? email }
    }
    return { email, status: 'marked' as const, id: match.id, name: match.name ?? email }
  })
}
