import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { emailFilter } from './filters'

export async function getTeacherReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const query = `
    WITH teacher_stats AS (
      SELECT u.id as teacher_id,
        COUNT(DISTINCT c.id) as total_classrooms,
        COUNT(DISTINCT cs.student_id) as total_students,
        COUNT(DISTINCT h.id) as total_homeworks,
        COUNT(DISTINCT hl.id) as total_lessons
      FROM users u
      LEFT JOIN classrooms c ON u.id = c.teacher_id
      LEFT JOIN classroom_student cs ON c.id = cs.classroom_id
      LEFT JOIN homeworks h ON c.id = h.classroom_id
      LEFT JOIN homework_lesson hl ON h.id = hl.homework_id
      WHERE u.role = 'teacher' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
        AND u.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        ${emailFilter}
      GROUP BY u.id
    ),
    lesson_assignments AS (
      SELECT c.teacher_id,
        SUM((SELECT COUNT(*) FROM homework_lesson WHERE homework_id = h.id) *
            (SELECT COUNT(*) FROM classroom_student WHERE classroom_id = c.id)) as total_lesson_assignments
      FROM classrooms c JOIN homeworks h ON c.id = h.classroom_id GROUP BY c.teacher_id
    ),
    watch_time AS (
      SELECT c.teacher_id,
        COALESCE(SUM(CAST(l.duration AS DECIMAL(10,2))) / 60, 0) as total_watch_time
      FROM classrooms c
      JOIN homeworks h ON c.id = h.classroom_id
      JOIN homework_lesson hl ON h.id = hl.homework_id
      JOIN lessons l ON hl.lesson_id = l.id
      JOIN student_progress sp ON h.id = sp.homework_id AND hl.lesson_id = sp.lesson_id
      GROUP BY c.teacher_id
    ),
    teacher_activity AS (
      SELECT c.teacher_id,
        COUNT(DISTINCT CASE WHEN h.created_at >= NOW() - INTERVAL '7 days' THEN h.id END) as recent_homeworks_created,
        COUNT(DISTINCT CASE WHEN sp.created_at >= NOW() - INTERVAL '7 days' THEN sp.id END) as recent_student_activities
      FROM classrooms c
      LEFT JOIN homeworks h ON c.id = h.classroom_id
      LEFT JOIN student_progress sp ON h.id = sp.homework_id
      GROUP BY c.teacher_id
    ),
    homeworks_created AS (
      SELECT u.id as teacher_id, COUNT(DISTINCT h.id) as homeworks_created
      FROM users u
      LEFT JOIN classrooms c ON u.id = c.teacher_id
      LEFT JOIN homeworks h ON c.id = h.classroom_id
      WHERE u.role = 'teacher' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
        AND u.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        ${emailFilter}
      GROUP BY u.id
    )
    SELECT u.id as teacher_id,
      COALESCE(asd.student_name, u.email) as teacher_name,
      u.email as teacher_email,
      ts.total_classrooms, ts.total_students, ts.total_homeworks, ts.total_lessons,
      COALESCE(la.total_lesson_assignments, 0) as total_lesson_assignments,
      ROUND(COALESCE(wt.total_watch_time, 0)::numeric, 2) as total_watch_time,
      COALESCE(ta.recent_homeworks_created, 0) as recent_homeworks_created,
      COALESCE(ta.recent_student_activities, 0) as recent_student_activities,
      COALESCE(hc.homeworks_created, 0) as homeworks_created
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    LEFT JOIN teacher_stats ts ON u.id = ts.teacher_id
    LEFT JOIN lesson_assignments la ON u.id = la.teacher_id
    LEFT JOIN watch_time wt ON u.id = wt.teacher_id
    LEFT JOIN teacher_activity ta ON u.id = ta.teacher_id
    LEFT JOIN homeworks_created hc ON u.id = hc.teacher_id
    WHERE u.role = 'teacher' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
      AND u.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${emailFilter}
    ORDER BY u.email
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(item => ({
    ...item,
    teacher_id: String(item.teacher_id),
    total_classrooms: Number(item.total_classrooms),
    total_students: Number(item.total_students),
    total_homeworks: Number(item.total_homeworks),
    total_lessons: Number(item.total_lessons),
    total_lesson_assignments: Number(item.total_lesson_assignments),
    total_watch_time: Math.round(Number(item.total_watch_time)),
    recent_homeworks_created: Number(item.recent_homeworks_created),
    recent_student_activities: Number(item.recent_student_activities),
    homeworks_created: Number(item.homeworks_created),
  }))
}
