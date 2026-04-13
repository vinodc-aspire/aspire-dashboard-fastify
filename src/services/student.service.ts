import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { emailFilter } from './filters'

export async function getStudentReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const startISO = new Date(startDate).toISOString()
  const endISO = new Date(endDate).toISOString()

  const query = `
    SELECT u.id as student_id, u.email as student_email,
      COALESCE(asd.student_name, u.email) as student_name,
      COALESCE(COUNT(DISTINCT cs.classroom_id), 0) as total_classrooms,
      COALESCE(COUNT(DISTINCT h.id), 0) as total_homeworks_assigned,
      COALESCE(COUNT(DISTINCT CASE WHEN sp.completed = true THEN h.id END), 0) as completed_homeworks,
      COALESCE(COUNT(DISTINCT l.id), 0) as total_videos
    FROM users u
    INNER JOIN classroom_student cs ON u.id = cs.student_id
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    LEFT JOIN homeworks h ON cs.classroom_id = h.classroom_id
    LEFT JOIN homework_lesson hl ON h.id = hl.homework_id
    LEFT JOIN lessons l ON hl.lesson_id = l.id
    LEFT JOIN student_progress sp ON u.id = sp.user_id AND h.id = sp.homework_id
    WHERE u.created_at BETWEEN '${startISO}' AND '${endISO}'
      ${emailFilter}
    GROUP BY u.id, u.email, asd.student_name
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(item => ({
    ...item,
    student_id: item.student_id ? String(item.student_id) : '',
    total_classrooms: Number(item.total_classrooms),
    total_homeworks_assigned: Number(item.total_homeworks_assigned),
    completed_homeworks: Number(item.completed_homeworks),
    total_videos: Number(item.total_videos),
  }))
}
