import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { emailFilter, testAccountFilter } from './filters'

export async function getWatchtimeReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const query = `
    WITH query1 AS (
      SELECT u.id, u.email, u.role, asd.school_code,
        COUNT(DISTINCT p.id) as profile_count,
        SUM(((CAST(lp.watched AS numeric) * CAST(l.duration as numeric)) / 100)/60) as total_watched_minutes_q1,
        u.verified_at, u.created_at
      FROM users u
      LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN lesson_profile lp ON p.id = lp.profile_id
      LEFT JOIN lessons l ON lp.lesson_id = l.id
      WHERE u.deleted_at IS NULL
        AND lp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        ${emailFilter}
        ${testAccountFilter}
        AND u.verified_at IS NOT NULL
      GROUP BY u.id, asd.school_code
    ),
    query2 AS (
      SELECT u.id AS student_id, u.email, u.created_at AS registration_date,
        COUNT(DISTINCT p.id) AS profile_count,
        STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS classroom_names,
        COUNT(DISTINCT c.id) AS number_of_classrooms,
        COUNT(DISTINCT h.id) AS number_of_homeworks_assigned,
        COUNT(DISTINCT hl.id) AS number_of_lessons,
        COUNT(DISTINCT sp.lesson_id) AS lessons_attempted_count,
        ROUND(COALESCE(SUM(CASE WHEN sp.lesson_id IS NOT NULL THEN CAST(l.duration AS numeric) ELSE 0 END) / 60, 0), 2) AS total_lesson_duration_in_minutes,
        (
          SELECT ROUND(COALESCE(SUM(CAST(l2.duration AS numeric)), 0) / 60, 2)
          FROM student_progress sp2 JOIN lessons l2 ON sp2.lesson_id = l2.id
          WHERE sp2.user_id = u.id AND sp2.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        ) AS total_watched_lesson_duration_in_minutes
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id AND p.deleted_at IS NULL
      LEFT JOIN classroom_student cs ON u.id = cs.student_id
      LEFT JOIN classrooms c ON cs.classroom_id = c.id
      LEFT JOIN homeworks h ON c.id = h.classroom_id
      LEFT JOIN homework_lesson hl ON h.id = hl.homework_id
      LEFT JOIN lessons l ON hl.lesson_id = l.id
      LEFT JOIN student_progress sp ON u.id = sp.user_id AND l.id = sp.lesson_id
      WHERE u.deleted_at IS NULL
        AND sp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
        ${emailFilter}
        ${testAccountFilter}
      GROUP BY u.id, u.email, u.created_at
    )
    SELECT COALESCE(q1.id, q2.student_id) AS user_id, COALESCE(q1.email, q2.email) AS email,
      CASE WHEN LOWER(q1.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END AS user_type,
      CASE WHEN q1.school_code = '1' THEN 'Manual' ELSE 'Self' END AS user_join,
      COALESCE(q1.profile_count, q2.profile_count) AS profile_count,
      q1.total_watched_minutes_q1, q1.verified_at,
      COALESCE(q1.created_at, q2.registration_date) AS created_at,
      q2.classroom_names, q2.number_of_classrooms, q2.number_of_homeworks_assigned,
      q2.number_of_lessons, q2.total_lesson_duration_in_minutes,
      q2.lessons_attempted_count, q2.total_watched_lesson_duration_in_minutes
    FROM query1 q1
    FULL OUTER JOIN query2 q2 ON q1.id = q2.student_id
    ORDER BY email
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(item => ({
    user_id: item.user_id ? String(item.user_id) : null,
    email: (item.email as string) ?? '',
    user_type: (item.user_type as string) ?? '',
    user_join: (item.user_join as string) ?? '',
    profile_count: item.profile_count != null ? Number(item.profile_count) : null,
    created_at: item.created_at,
    verified_at: item.verified_at,
    total_watched_minutes_q1: item.total_watched_minutes_q1 != null ? Math.round(Number(item.total_watched_minutes_q1)) : null,
    total_lesson_duration_in_minutes: item.total_lesson_duration_in_minutes != null ? Math.round(Number(item.total_lesson_duration_in_minutes)) : null,
    total_watched_lesson_duration_in_minutes: item.total_watched_lesson_duration_in_minutes != null ? Math.round(Number(item.total_watched_lesson_duration_in_minutes)) : null,
    number_of_classrooms: item.number_of_classrooms != null ? Number(item.number_of_classrooms) : null,
    number_of_homeworks_assigned: item.number_of_homeworks_assigned != null ? Number(item.number_of_homeworks_assigned) : null,
    number_of_lessons: item.number_of_lessons != null ? Number(item.number_of_lessons) : null,
    lessons_attempted_count: item.lessons_attempted_count != null ? Number(item.lessons_attempted_count) : null,
    classroom_names: (item.classroom_names as string) || '',
  }))
}

export async function getZeroActivityReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const query = `
    SELECT u.id AS user_id, COALESCE(p."name", '') AS name, u.email, u.created_at, u.verified_at,
      CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END AS user_type,
      COALESCE(MAX(CASE WHEN a.school_code = '1' THEN 'Manual' ELSE 'Self' END), 'Self') AS user_join
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN additional_signup_data a ON u.id = a.user_id
    WHERE u.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      AND u.verified_at IS NOT NULL AND u.deleted_at IS NULL
      ${emailFilter}
      ${testAccountFilter}
      AND NOT EXISTS (
        SELECT 1 FROM student_progress sp
        WHERE sp.user_id = u.id AND sp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      )
      AND NOT EXISTS (SELECT 1 FROM lesson_profile lp WHERE lp.profile_id = p.id)
    GROUP BY u.id, p."name", u.email, u.created_at, u.verified_at, u.role
    ORDER BY u.updated_at DESC
  `

  const result = await db.execute(sql.raw(query))
  return (result.rows as Record<string, unknown>[]).map(user => ({
    ...user,
    user_id: user.user_id ? String(user.user_id) : null,
  }))
}
