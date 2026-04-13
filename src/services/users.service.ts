import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { emailFilter } from './filters'

function formatDateForPostgres(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export async function getAllUsers(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const startStr = formatDateForPostgres(start)
  const endStr = formatDateForPostgres(end)

  const query = `
    SELECT
      u.id,
      u.email,
      MAX(COALESCE(asd.student_name, p.name)) AS name,
      MAX(CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END) AS user_type,
      MAX(CASE WHEN u.deleted_at IS NOT NULL THEN 'Deleted' WHEN u.verified_at IS NULL THEN 'Not verified' ELSE 'Active' END) AS status,
      u.created_at,
      u.updated_at,
      MAX(CASE WHEN asd.curriculum_id = 1 OR asd.curriculum_id IS NULL THEN 'IGCSE' WHEN asd.curriculum_id = 2 THEN 'NC' WHEN asd.curriculum_id = 3 THEN 'REB' WHEN asd.curriculum_id = 4 THEN 'DRC' WHEN asd.curriculum_id = 5 THEN 'YOUTH' ELSE asd.curriculum_id::text END) AS curriculum,
      MAX(CASE WHEN asd.school_code = '1' THEN 'Manual' ELSE 'Self' END) AS user_join
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.created_at BETWEEN '${startStr}' AND '${endStr}'
    AND u.deleted_at IS NULL
    ${emailFilter}
    GROUP BY u.id, u.email, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(user => ({
    ...user,
    id: String(user.id),
    name: (user.name as string) || '-',
    user_type: user.user_type,
    curriculum: (user.curriculum as string) || '-',
    user_join: (user.user_join as string) || '-',
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }))
}

export async function getUserById(db: NodePgDatabase, userId: number) {
  const result = await db.execute(sql`
    SELECT u.id, u.email, u.created_at, u.updated_at,
           CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END AS user_type,
           CASE WHEN u.deleted_at IS NOT NULL THEN 'Deleted' WHEN u.verified_at IS NULL THEN 'Not verified' ELSE 'Active' END AS status,
           asd.age,
           CASE WHEN asd.school_code = '1' THEN 'Manual' ELSE 'Self' END AS user_join,
           CASE WHEN asd.curriculum_id = 1 OR asd.curriculum_id IS NULL THEN 'IGCSE' WHEN asd.curriculum_id = 2 THEN 'NC' WHEN asd.curriculum_id = 3 THEN 'REB' WHEN asd.curriculum_id = 4 THEN 'DRC' WHEN asd.curriculum_id = 5 THEN 'YOUTH' ELSE asd.curriculum_id::text END AS curriculum,
           COUNT(DISTINCT p.id) as profile_count
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    LEFT JOIN profiles p ON u.id = p.user_id AND p.deleted_at IS NULL
    WHERE u.id = ${BigInt(userId)}
    GROUP BY u.id, u.email, u.created_at, u.updated_at, u.role, u.deleted_at, u.verified_at, asd.age, asd.curriculum_id, asd.school_code
  `)
  return result.rows
}
