type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export function fixBigInts(obj: unknown): JsonValue {
  if (Array.isArray(obj)) return obj.map(fixBigInts) as JsonValue[]

  if (obj && typeof obj === 'object') {
    const newObj: { [key: string]: JsonValue } = {}
    for (const key in obj as Record<string, unknown>) {
      const val = (obj as Record<string, unknown>)[key]
      if (typeof val === 'bigint') {
        newObj[key] = val.toString()
      } else if (typeof val === 'object') {
        newObj[key] = fixBigInts(val)
      } else {
        newObj[key] = val as JsonValue
      }
    }
    return newObj
  }

  return obj as JsonValue
}
