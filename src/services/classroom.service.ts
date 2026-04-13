import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { emailFilter, testAccountFilter } from './filters'

export async function getClassroomReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const query = `
    WITH homework_lessons AS (
      SELECT h.id AS homework_id, h.classroom_id, COUNT(hl.lesson_id) AS total_lessons
      FROM homeworks h JOIN homework_lesson hl ON h.id = hl.homework_id GROUP BY h.id
    ),
    student_lesson_completion AS (
      SELECT hl.classroom_id, hl.homework_id, cs.student_id, hl.total_lessons,
        COUNT(DISTINCT sp.lesson_id) AS completed_lessons
      FROM homework_lessons hl
      JOIN classroom_student cs ON hl.classroom_id = cs.classroom_id
      LEFT JOIN student_progress sp ON hl.homework_id = sp.homework_id
        AND cs.student_id = sp.user_id AND sp.completed = true
      GROUP BY hl.classroom_id, hl.homework_id, cs.student_id, hl.total_lessons
    ),
    student_homework_completion AS (
      SELECT classroom_id, student_id,
        COUNT(DISTINCT homework_id) AS total_homeworks,
        COUNT(DISTINCT CASE WHEN completed_lessons = total_lessons AND total_lessons > 0 THEN homework_id END) AS completed_homeworks
      FROM student_lesson_completion GROUP BY classroom_id, student_id
    ),
    classroom_completion AS (
      SELECT classroom_id,
        ROUND(AVG(CASE WHEN total_homeworks > 0 THEN (completed_homeworks::float / total_homeworks) * 100 ELSE 0 END)) AS avg_completion_rate
      FROM student_homework_completion GROUP BY classroom_id
    )
    SELECT c.id AS class_id, c.name AS classroom_name, u.email AS teacher_email,
      COALESCE(asd.student_name, u.email) as teacher_name,
      COUNT(DISTINCT cs.student_id) AS total_student,
      COUNT(DISTINCT h.id) AS total_homeworks,
      COUNT(DISTINCT hl.lesson_id) AS total_videos,
      COALESCE(cc.avg_completion_rate, 0) AS homework_completion_rate
    FROM classrooms c
    JOIN users u ON u.id = c.teacher_id
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    LEFT JOIN classroom_student cs ON cs.classroom_id = c.id
    LEFT JOIN homeworks h ON h.classroom_id = c.id
    LEFT JOIN homework_lesson hl ON hl.homework_id = h.id
    LEFT JOIN classroom_completion cc ON c.id = cc.classroom_id
    WHERE u.deleted_at IS NULL AND u.verified_at IS NOT NULL
      AND c.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${emailFilter}
      ${testAccountFilter}
    GROUP BY c.id, c.name, u.email, cc.avg_completion_rate, asd.student_name
    ORDER BY c.id
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(item => ({
    ...item,
    class_id: item.class_id ? String(item.class_id) : null,
    total_student: Number(item.total_student),
    total_homeworks: Number(item.total_homeworks),
    total_videos: Number(item.total_videos),
    homework_completion_rate: Number(item.homework_completion_rate).toFixed(2) + '%',
  }))
}
