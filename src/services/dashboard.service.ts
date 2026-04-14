import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { testAccountFilter } from './filters'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

export async function getDashboardStats(db: NodePgDatabase, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const courseWatchtimeQuery = `
    SELECT SUM(((CAST(lp.watched AS numeric) * CAST(l.duration as numeric)) / 100)/60) as total_minutes
    FROM users u
    JOIN profiles p ON u.id = p.user_id
    JOIN lesson_profile lp ON p.id = lp.profile_id
    JOIN lessons l ON lp.lesson_id = l.id
    WHERE u.deleted_at IS NULL
      AND lp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${testAccountFilter}
      AND p.deleted_at IS NULL
      AND l.deleted_at IS NULL
      AND u.verified_at IS NOT NULL
  `
  const homeworkWatchtimeQuery = `
    SELECT SUM(CAST(l.duration AS numeric) / 60) as total_minutes
    FROM student_progress sp
    JOIN lessons l ON sp.lesson_id = l.id
    JOIN users u ON sp.user_id = u.id
    WHERE u.deleted_at IS NULL
      AND sp.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${testAccountFilter}
      AND u.verified_at IS NOT NULL
  `
  const classroomsQuery = `
    SELECT COUNT(*) as total
    FROM classrooms c
    JOIN users u ON u.id = c.teacher_id
    WHERE u.deleted_at IS NULL
      AND u.verified_at IS NOT NULL
      AND c.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${testAccountFilter}
  `
  const homeworksQuery = `
    SELECT COUNT(*) as total
    FROM homeworks h
    JOIN classrooms c ON h.classroom_id = c.id
    JOIN users u ON c.teacher_id = u.id
    WHERE h.created_at BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
      ${testAccountFilter}
  `

  const [courseWatchtime, homeworkWatchtime, classrooms, homeworks] = await Promise.all([
    db.execute(sql.raw(courseWatchtimeQuery)),
    db.execute(sql.raw(homeworkWatchtimeQuery)),
    db.execute(sql.raw(classroomsQuery)),
    db.execute(sql.raw(homeworksQuery)),
  ])

  return {
    courseWatchtime: { total: Number((courseWatchtime.rows[0] as any)?.total_minutes || 0), thisWeek: 0 },
    homeworkWatchtime: { total: Number((homeworkWatchtime.rows[0] as any)?.total_minutes || 0), thisWeek: 0 },
    classrooms: { total: Number((classrooms.rows[0] as any)?.total || 0), thisWeek: 0 },
    homeworks: { total: Number((homeworks.rows[0] as any)?.total || 0), thisWeek: 0 },
  }
}

export async function getChartData(db: NodePgDatabase, type: string, period: string) {
  let interval: string, dateTrunc: string, labelCount: number, labels: string[]

  switch (period) {
    case 'days':
      interval = '7 days'; dateTrunc = 'day'; labelCount = 7
      labels = Array.from({ length: labelCount }, (_, i) => dayjs().subtract(labelCount - 1 - i, 'day').format('DD/MM'))
      break
    case 'weeks':
      interval = '4 weeks'; dateTrunc = 'week'; labelCount = 4
      labels = Array.from({ length: labelCount }, (_, i) => {
        const weekStart = dayjs().subtract(labelCount - 1 - i, 'week').startOf('isoWeek')
        const weekEnd = dayjs().subtract(labelCount - 1 - i, 'week').endOf('isoWeek')
        return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM')}`
      })
      break
    default:
      interval = '6 months'; dateTrunc = 'month'; labelCount = 6
      labels = Array.from({ length: labelCount }, (_, i) => dayjs().subtract(labelCount - 1 - i, 'month').format('MMM'))
  }

  const processResults = (results: Record<string, unknown>[], valueField: string) => {
    const dataMap = new Map<string, number>()
    results.forEach(r => {
      const key = dayjs(r.period as string).startOf(dateTrunc === 'day' ? 'day' : dateTrunc === 'week' ? 'isoWeek' : 'month').format('YYYY-MM-DD')
      dataMap.set(key, (dataMap.get(key) || 0) + Number(r[valueField] || 0))
    })
    return Array.from({ length: labelCount }).map((_, i) => {
      const dateKey = dayjs().subtract(labelCount - 1 - i, dateTrunc === 'day' ? 'day' : dateTrunc as dayjs.ManipulateType)
      const periodKey = dateKey.startOf(dateTrunc === 'day' ? 'day' : dateTrunc === 'week' ? 'isoWeek' : 'month').format('YYYY-MM-DD')
      return dataMap.get(periodKey) || 0
    })
  }

  if (type === 'users') {
    const query = `
      SELECT DATE_TRUNC('${dateTrunc}', u.created_at) as period, COUNT(*) as count
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '${interval}' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
      ${testAccountFilter}
      GROUP BY period ORDER BY period`
    const results = await db.execute(sql.raw(query))
    const data = processResults(results.rows as Record<string, unknown>[], 'count')
    return { labels, series: [{ data, label: 'User Accounts Created' }] }
  }

  const homeworkQuery = `
    SELECT DATE_TRUNC('${dateTrunc}', sp.created_at) as period, SUM(CAST(l.duration AS numeric) / 3600) as total_hours
    FROM student_progress sp
    JOIN lessons l ON sp.lesson_id = l.id
    JOIN users u ON sp.user_id = u.id
    WHERE sp.created_at >= NOW() - INTERVAL '${interval}' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL
    ${testAccountFilter}
    GROUP BY period ORDER BY period`
  const courseQuery = `
    SELECT DATE_TRUNC('${dateTrunc}', lp.created_at) as period, SUM(((CAST(lp.watched AS numeric) * CAST(l.duration as numeric)) / 100)/3600) as total_hours
    FROM users u
    JOIN profiles p ON u.id = p.user_id
    JOIN lesson_profile lp ON p.id = lp.profile_id
    JOIN lessons l ON lp.lesson_id = l.id
    WHERE lp.created_at >= NOW() - INTERVAL '${interval}' AND u.deleted_at IS NULL AND u.verified_at IS NOT NULL AND p.deleted_at IS NULL AND l.deleted_at IS NULL
    ${testAccountFilter}
    GROUP BY period ORDER BY period`

  const [homeworkResults, courseResults] = await Promise.all([
    db.execute(sql.raw(homeworkQuery)),
    db.execute(sql.raw(courseQuery)),
  ])

  const homeworkData = processResults(homeworkResults.rows as Record<string, unknown>[], 'total_hours').map(h => Math.round(h))
  const courseData = processResults(courseResults.rows as Record<string, unknown>[], 'total_hours').map(c => Math.round(c))
  const totalData = homeworkData.map((h, i) => Math.round(h + courseData[i]))

  return {
    labels,
    series: [
      { data: homeworkData, label: 'Homework Watchtime (Hours)', color: '#10B981' },
      { data: courseData, label: 'Course Watchtime (Hours)', color: '#F59E0B' },
      { data: totalData, label: 'Total Watchtime (Hours)', color: '#4e8ad2' },
    ],
  }
}
