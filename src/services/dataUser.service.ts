import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { testAccountFilter } from './filters'

function formatMinutesToHours(totalMinutes: number | null): string {
  if (totalMinutes === null || isNaN(totalMinutes as number)) return '0 Hr 0 Min'
  const hours = Math.floor((totalMinutes as number) / 60)
  const minutes = Math.round((totalMinutes as number) % 60)
  return `${hours} Hr ${minutes} Min`
}

function formatDateForPostgres(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export async function getUserDataReport(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const startStr = formatDateForPostgres(start)
  const endStr = formatDateForPostgres(end)
  const cumulativeStart = new Date('2024-09-01T00:00:00.000Z')
  const cumulativeStartStr = formatDateForPostgres(cumulativeStart)
  const cumulativeEndStr = formatDateForPostgres(end)

  const lastWeekWatchQuery = `
    SELECT
      COALESCE((SELECT SUM(((CAST(lp.watched AS numeric) * CAST(l.duration AS numeric)) / 100) / 60)
        FROM lesson_profile lp JOIN lessons l ON lp.lesson_id = l.id
        JOIN profiles p ON lp.profile_id = p.id JOIN users u ON p.user_id = u.id
        WHERE lp.created_at BETWEEN '${startStr}' AND '${endStr}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ), 0) +
      COALESCE((SELECT SUM(CAST(l.duration AS numeric) / 60)
        FROM student_progress sp JOIN lessons l ON sp.lesson_id = l.id JOIN users u ON sp.user_id = u.id
        WHERE sp.created_at BETWEEN '${startStr}' AND '${endStr}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ), 0) AS "lastWeekWatchMinutes"
  `

  const totalWatchQuery = `
    SELECT
      COALESCE((SELECT SUM(((CAST(lp.watched AS numeric) * CAST(l.duration AS numeric)) / 100) / 60)
        FROM lesson_profile lp JOIN lessons l ON lp.lesson_id = l.id
        JOIN profiles p ON lp.profile_id = p.id JOIN users u ON p.user_id = u.id
        WHERE lp.created_at BETWEEN '${cumulativeStartStr}' AND '${endStr}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ), 0) +
      COALESCE((SELECT SUM(CAST(l.duration AS numeric) / 60)
        FROM student_progress sp JOIN lessons l ON sp.lesson_id = l.id JOIN users u ON sp.user_id = u.id
        WHERE sp.created_at BETWEEN '${cumulativeStartStr}' AND '${endStr}'
          AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
          ${testAccountFilter}
      ), 0) AS "totalWatchMinutes"
  `

  const weeklyUsersQuery = `
    SELECT CASE WHEN u.verified_at IS NOT NULL THEN 'activated' ELSE 'not_verified' END AS status
    FROM users u
    WHERE u.created_at BETWEEN '${startStr}' AND '${endStr}'
      AND u.deleted_at IS NULL
      ${testAccountFilter}
  `

  const cumulativeUsersQuery = `
    SELECT CASE WHEN LOWER(u.role) = 'teacher' THEN 'Teacher' ELSE 'Student' END AS label
    FROM users u
    WHERE u.created_at BETWEEN '${cumulativeStartStr}' AND '${cumulativeEndStr}'
      AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
      ${testAccountFilter}
  `

  const [lastWeekWatchResult, totalWatchResult, weeklyUsersResult, cumulativeUsersResult] = await Promise.all([
    db.execute(sql.raw(lastWeekWatchQuery)),
    db.execute(sql.raw(totalWatchQuery)),
    db.execute(sql.raw(weeklyUsersQuery)),
    db.execute(sql.raw(cumulativeUsersQuery)),
  ])

  const lastWeekWatchMinutes = Number((lastWeekWatchResult.rows[0] as Record<string, unknown>)?.lastWeekWatchMinutes) || 0
  const totalWatchMinutes = Number((totalWatchResult.rows[0] as Record<string, unknown>)?.totalWatchMinutes) || 0

  let activatedCount = 0, notVerifiedCount = 0
  ;(weeklyUsersResult.rows as Record<string, unknown>[]).forEach(row => {
    if (row.status === 'activated') activatedCount++; else notVerifiedCount++
  })

  let studentCount = 0, teacherCount = 0
  ;(cumulativeUsersResult.rows as Record<string, unknown>[]).forEach(row => {
    if (row.label === 'Teacher') teacherCount++; else studentCount++
  })

  return {
    statCards: [
      { label: "Last week's total Watchminutes", value: formatMinutesToHours(lastWeekWatchMinutes), period: '' },
      { label: 'Total watchminutes', value: formatMinutesToHours(totalWatchMinutes), period: 'since 1st Sep 2024' },
    ],
    weeklyUserBreakdown: [
      { name: 'Accounts Activated', value: activatedCount },
      { name: 'Accounts Not Verified', value: notVerifiedCount },
    ],
    userBreakdown: [
      { name: 'Students', value: studentCount },
      { name: 'Teachers', value: teacherCount },
    ],
  }
}
