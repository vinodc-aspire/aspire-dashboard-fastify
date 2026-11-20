import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export async function getCurriculums(db: NodePgDatabase) {
  const result = await db.execute(sql`
    SELECT id, short_name, name
    FROM curriculums
    WHERE enabled = true
    ORDER BY id
  `)
  return (result.rows as Record<string, unknown>[]).map(row => ({
    id: Number(row.id),
    short_name: String(row.short_name),
    name: String(row.name),
  }))
}
