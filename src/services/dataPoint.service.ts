import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { testAccountFilter } from './filters'

function formatMinutesToHours(totalMinutes: number | null): string {
  if (totalMinutes === null || isNaN(totalMinutes)) return '0 Hr 0 Min'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  return `${hours} Hr ${minutes} Min`
}

export async function getDataPointReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const metricsQuery = `
    SELECT
      (SELECT COUNT(h.id) FROM homeworks h
        JOIN classrooms c ON h.classroom_id = c.id JOIN users u ON c.teacher_id = u.id
        WHERE h.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          AND c.deleted_at IS NULL
          ${testAccountFilter}
      ) as "totalHomeworkCreated",
      (SELECT SUM(((CAST(lp.watched AS numeric) * CAST(l.duration as numeric)) / 100) / 60)
        FROM lesson_profile lp JOIN lessons l ON lp.lesson_id = l.id
        JOIN profiles p ON lp.profile_id = p.id JOIN users u ON p.user_id = u.id
        WHERE lp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ) as "courseLibraryWatchTime",
      (SELECT SUM(CAST(l.duration AS numeric) / 60)
        FROM student_progress sp JOIN lessons l ON sp.lesson_id = l.id JOIN users u ON sp.user_id = u.id
        WHERE sp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ) as "homeworkWatchTime"
  `

  const weeklyUsersQuery = `
    SELECT CASE WHEN asd.school_code = '1' THEN 'Manual' ELSE 'Self' END AS user_join,
      CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END AS user_type
    FROM users u LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    WHERE u.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      AND u.verified_at IS NOT NULL AND u.deleted_at IS NULL
      ${testAccountFilter}
  `

  const cumulativeUsersQuery = `
    SELECT CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END as label
    FROM users u
    WHERE u.created_at >= '2024-09-01T00:00:00.000Z' AND u.created_at <= '${end.toISOString()}'
      AND u.verified_at IS NOT NULL AND u.deleted_at IS NULL
      ${testAccountFilter}
  `

  const [metricsResult, weeklyUsersResult, cumulativeUsersResult] = await Promise.all([
    db.execute(sql.raw(metricsQuery)),
    db.execute(sql.raw(weeklyUsersQuery)),
    db.execute(sql.raw(cumulativeUsersQuery)),
  ])

  const metrics = metricsResult.rows[0] as Record<string, unknown>
  const courseLibraryWatchTime = Number(metrics.courseLibraryWatchTime) || 0
  const homeworkWatchTime = Number(metrics.homeworkWatchTime) || 0

  let selfOnboarded = 0, manualOnboarded = 0, weeklyStudents = 0, weeklyTeachers = 0
  ;(weeklyUsersResult.rows as Record<string, unknown>[]).forEach(user => {
    if (user.user_join === 'Manual') manualOnboarded++; else selfOnboarded++
    if (user.user_type === 'Student') weeklyStudents++; else weeklyTeachers++
  })

  let cumulativeStudents = 0, cumulativeTeachers = 0
  ;(cumulativeUsersResult.rows as Record<string, unknown>[]).forEach(user => {
    if (user.label === 'Student') cumulativeStudents++; else cumulativeTeachers++
  })

  return {
    metricCards: [
      { label: 'Total Watch Time', value: formatMinutesToHours(courseLibraryWatchTime + homeworkWatchTime) },
      { label: 'Course Library Watch Time', value: formatMinutesToHours(courseLibraryWatchTime) },
      { label: 'Homework Watch Time', value: formatMinutesToHours(homeworkWatchTime) },
      { label: 'Total Homework Created', value: String(Number(metrics.totalHomeworkCreated)) },
    ],
    onboardedUsers: { data: [{ id: 0, label: 'Self', value: selfOnboarded, color: '#42a5f5' }, { id: 1, label: 'Manual', value: manualOnboarded, color: '#66bb6a' }] },
    userTypes: { data: [{ id: 0, label: 'Students', value: weeklyStudents, color: '#1976d2' }, { id: 1, label: 'Teachers', value: weeklyTeachers, color: '#4caf50' }] },
    cumulativeUsers: { data: [{ id: 0, label: 'Students', value: cumulativeStudents, color: '#1976d2' }, { id: 1, label: 'Teachers', value: cumulativeTeachers, color: '#4caf50' }] },
  }
}
