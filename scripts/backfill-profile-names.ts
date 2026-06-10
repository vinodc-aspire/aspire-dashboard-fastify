import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '--search_path=nodeapi',
})

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const beforeRes = await client.query(`
      SELECT p.id AS profile_id, p.user_id, p.name AS before_name,
             (SELECT a.student_name FROM additional_signup_data a
              WHERE a.user_id = p.user_id AND a.student_name IS NOT NULL AND a.student_name <> ''
              ORDER BY a.id DESC LIMIT 1) AS new_name
      FROM profiles p
      WHERE (p.name IS NULL OR p.name = '')
        AND EXISTS (
          SELECT 1 FROM additional_signup_data a
          WHERE a.user_id = p.user_id
            AND a.student_name IS NOT NULL AND a.student_name <> ''
        )
      ORDER BY p.user_id
    `)
    console.log(`Rows that will be updated: ${beforeRes.rowCount}`)
    for (const r of beforeRes.rows) {
      console.log(`  profile_id=${r.profile_id}  user_id=${r.user_id}  ${JSON.stringify(r.before_name)} -> ${JSON.stringify(r.new_name)}`)
    }

    const updateRes = await client.query(`
      UPDATE profiles p
      SET name = sub.student_name,
          updated_at = NOW()
      FROM (
        SELECT DISTINCT ON (a.user_id) a.user_id, a.student_name
        FROM additional_signup_data a
        WHERE a.student_name IS NOT NULL AND a.student_name <> ''
        ORDER BY a.user_id, a.id DESC
      ) sub
      WHERE p.user_id = sub.user_id
        AND (p.name IS NULL OR p.name = '')
    `)
    console.log(`\nUPDATE affected rows: ${updateRes.rowCount}`)

    if (updateRes.rowCount !== beforeRes.rowCount) {
      console.error(`Mismatch — expected ${beforeRes.rowCount} but got ${updateRes.rowCount}. Rolling back.`)
      await client.query('ROLLBACK')
      process.exit(2)
    }

    await client.query('COMMIT')
    console.log('Committed.')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
