import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '--search_path=nodeapi',
})

async function main() {
  const client = await pool.connect()
  try {
    const countRes = await client.query(`
      SELECT COUNT(*)::int AS affected_profiles
      FROM profiles p
      WHERE (p.name IS NULL OR p.name = '')
        AND EXISTS (
          SELECT 1 FROM additional_signup_data a
          WHERE a.user_id = p.user_id
            AND a.student_name IS NOT NULL
            AND a.student_name <> ''
        )
    `)
    console.log('Profiles that would be updated:', countRes.rows[0].affected_profiles)

    const sampleRes = await client.query(`
      SELECT p.id AS profile_id, p.user_id, p.name AS current_profile_name,
             (SELECT a.student_name FROM additional_signup_data a
              WHERE a.user_id = p.user_id AND a.student_name IS NOT NULL AND a.student_name <> ''
              ORDER BY a.id DESC LIMIT 1) AS new_name_from_asd
      FROM profiles p
      WHERE (p.name IS NULL OR p.name = '')
        AND EXISTS (
          SELECT 1 FROM additional_signup_data a
          WHERE a.user_id = p.user_id
            AND a.student_name IS NOT NULL
            AND a.student_name <> ''
        )
      ORDER BY p.user_id
      LIMIT 10
    `)
    console.log('\nSample (up to 10):')
    for (const r of sampleRes.rows) {
      console.log(`  profile_id=${r.profile_id}  user_id=${r.user_id}  current=${JSON.stringify(r.current_profile_name)}  new=${JSON.stringify(r.new_name_from_asd)}`)
    }

    const multiRes = await client.query(`
      SELECT COUNT(*)::int AS users_with_multiple_asd
      FROM (
        SELECT user_id FROM additional_signup_data
        WHERE student_name IS NOT NULL AND student_name <> ''
        GROUP BY user_id HAVING COUNT(*) > 1
      ) x
    `)
    console.log('\nUsers with >1 ASD row (would use latest by id):', multiRes.rows[0].users_with_multiple_asd)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
