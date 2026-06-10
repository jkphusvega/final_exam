import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Fetch a sample of all rows across all pages
  const all: any[] = []
  const PAGE = 1000
  let page = 0

  while (true) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .range(page * PAGE, page * PAGE + PAGE - 1)

    if (error || !data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE) break
    page++
  }

  // Get distinct 대학(원) values with char codes
  const seen = new Map<string, number>()
  all.forEach((r) => {
    const v = r['대학(원)']
    if (v !== undefined && v !== null) {
      seen.set(String(v), (seen.get(String(v)) ?? 0) + 1)
    }
  })

  // For each distinct value, show the codepoints and a count
  const valuesWithCodes = Array.from(seen.entries()).map(([val, count]) => ({
    value: val,
    count,
    codePoints: Array.from(val).map((ch) => ch.codePointAt(0)!),
    length: val.length,
  }))

  // Hardcoded targets
  const targets = ['동북아국제통상물류학부', '법학부', '공과대학', '인문대학']
  const targetCodes = targets.map((t) => ({
    target: t,
    codePoints: Array.from(t).map((ch) => ch.codePointAt(0)!),
  }))

  // Try normalized comparison
  const normalizedMatches = targets.map((t) => ({
    target: t,
    exactMatch: all.filter((r) => r['대학(원)'] === t).length,
    nfcMatch: all.filter((r) => String(r['대학(원)']).normalize('NFC') === t.normalize('NFC')).length,
    nfdMatch: all.filter((r) => String(r['대학(원)']).normalize('NFD') === t.normalize('NFD')).length,
    includesMatch: all.filter((r) => String(r['대학(원)']).includes(t.slice(0, 3))).length,
  }))

  return NextResponse.json({
    totalRows: all.length,
    distinctColleges: valuesWithCodes,
    targetCodes,
    normalizedMatches,
  })
}
