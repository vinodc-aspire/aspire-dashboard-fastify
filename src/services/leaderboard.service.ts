import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export async function getAllLeaderboard(db: NodePgDatabase) {
  const result = await db.execute(sql.raw(`
    SELECT id, teacher_id, teacher_name, region, country,
      total_points, homework_count, student_count,
      completed_homework_count, average_completion_rate
    FROM leaderboard ORDER BY total_points DESC
  `))
  return (result.rows as Record<string, unknown>[]).map((entry, index) => ({
    id: entry.id,
    teacher_id: entry.teacher_id,
    teacher_name: entry.teacher_name,
    region: entry.region,
    country: entry.country,
    points: Math.round(Number(entry.total_points)),
    homework_count: entry.homework_count,
    student_count: entry.student_count,
    completed_homework_count: entry.completed_homework_count,
    aaverage_completion_rate: Math.round(Number(entry.average_completion_rate) * 100) + '%',
    rank: index + 1,
  }))
}

export async function getLeaderboardDetails(db: NodePgDatabase, teacherId: number) {
  const entryResult = await db.execute(sql.raw(`
    SELECT id, teacher_id, teacher_name, region, country,
      total_points, homework_count, student_count,
      completed_homework_count, average_completion_rate
    FROM leaderboard WHERE teacher_id = ${teacherId} LIMIT 1
  `))
  if (!entryResult.rows.length) return null

  const data = entryResult.rows[0] as Record<string, unknown>
  const rankResult = await db.execute(sql.raw(`
    SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE total_points > ${data.total_points}
  `))

  return {
    id: data.id,
    rank: Number((rankResult.rows[0] as Record<string, unknown>).rank),
    teacher_id: data.teacher_id,
    teacher_name: data.teacher_name,
    region: data.region,
    country: data.country,
    points: Math.round(Number(data.total_points)),
    classroom_count: data.classroom_count,
    homework_count: data.homework_count,
    student_count: data.student_count,
    completed_homework_count: data.completed_homework_count,
    average_completion_rate: Math.round(Number(data.average_completion_rate) * 100) + '%',
  }
}
