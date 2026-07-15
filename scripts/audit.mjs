/**
 * Dependency vulnerability audit via the OSV.dev database.
 *
 * Replaces `pnpm audit`, which is permanently broken: npm retired the legacy
 * audit endpoint (HTTP 410) and every pnpm version still calls it.
 *
 * This also guards the security overrides in package.json > pnpm.overrides.
 * pnpm 11 stopped reading that field, so upgrading pnpm would silently drop
 * them and reintroduce known CVEs. This audit fails if that ever happens.
 *
 * Usage:
 *   node scripts/audit.mjs                    # prod deps, fail on any severity
 *   node scripts/audit.mjs --prod             # prod deps only (default)
 *   node scripts/audit.mjs --all              # include dev deps
 *   node scripts/audit.mjs --audit-level=high # only fail on high/critical
 */
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const includeDev = args.includes('--all')
const levelArg = args.find((a) => a.startsWith('--audit-level='))
const minLevel = levelArg ? levelArg.split('=')[1].toLowerCase() : 'low'

const ORDER = { low: 0, moderate: 1, high: 2, critical: 3 }
if (!(minLevel in ORDER)) {
  console.error(`Invalid --audit-level=${minLevel}. Use: low | moderate | high | critical`)
  process.exit(2)
}

// Collect installed packages and their resolved versions from pnpm's tree.
const listArgs = ['list', '--depth', 'Infinity', '--json']
if (!includeDev) listArgs.push('--prod')
const raw = execFileSync('pnpm', listArgs, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 256 })

const pkgs = new Map()
const walk = (deps) => {
  if (!deps || typeof deps !== 'object') return
  for (const [name, node] of Object.entries(deps)) {
    if (!node || typeof node !== 'object') continue
    if (typeof node.version === 'string' && /^\d/.test(node.version)) {
      pkgs.set(`${name}@${node.version}`, { name, version: node.version })
    }
    walk(node.dependencies)
    walk(node.optionalDependencies)
  }
}
for (const root of JSON.parse(raw)) {
  walk(root.dependencies)
  walk(root.optionalDependencies)
  if (includeDev) walk(root.devDependencies)
}

const list = [...pkgs.values()]
const scope = includeDev ? 'all' : 'prod'
console.log(`Auditing ${list.length} ${scope} package versions against OSV.dev (min severity: ${minLevel})...`)

// OSV querybatch: which installed versions are affected.
const affected = []
const CHUNK = 500
for (let i = 0; i < list.length; i += CHUNK) {
  const chunk = list.slice(i, i + CHUNK)
  const res = await fetch('https://api.osv.dev/v1/querybatch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      queries: chunk.map((p) => ({ package: { name: p.name, ecosystem: 'npm' }, version: p.version })),
    }),
  })
  if (!res.ok) {
    console.error(`OSV querybatch failed: ${res.status} ${await res.text()}`)
    process.exit(2)
  }
  const { results } = await res.json()
  results.forEach((r, idx) => {
    if (r.vulns?.length) affected.push({ pkg: chunk[idx], ids: r.vulns.map((v) => v.id) })
  })
}

// Fetch details for severity + summary.
const details = new Map()
await Promise.all(
  [...new Set(affected.flatMap((a) => a.ids))].map(async (id) => {
    const res = await fetch(`https://api.osv.dev/v1/vulns/${id}`)
    if (res.ok) details.set(id, await res.json())
  }),
)

const severityOf = (v) => {
  const s = v?.database_specific?.severity
  if (typeof s === 'string') return s.toLowerCase() === 'medium' ? 'moderate' : s.toLowerCase()
  return 'moderate' // unknown severity: treat conservatively rather than ignoring
}

const findings = []
for (const { pkg, ids } of affected) {
  for (const id of ids) {
    const v = details.get(id)
    const sev = severityOf(v)
    if (ORDER[sev] >= ORDER[minLevel]) {
      findings.push({ pkg: `${pkg.name}@${pkg.version}`, id, sev, summary: v?.summary ?? '' })
    }
  }
}

if (!findings.length) {
  console.log(`\n✔ No known vulnerabilities (severity >= ${minLevel}) in ${scope} dependencies.`)
  process.exit(0)
}

findings.sort((a, b) => ORDER[b.sev] - ORDER[a.sev])
const counts = findings.reduce((acc, f) => ((acc[f.sev] = (acc[f.sev] || 0) + 1), acc), {})
console.error(`\n✘ ${findings.length} vulnerability finding(s):\n`)
for (const f of findings) {
  console.error(`  [${f.sev.toUpperCase()}] ${f.pkg}`)
  console.error(`    ${f.id}: ${f.summary}`)
  console.error(`    https://osv.dev/vulnerability/${f.id}\n`)
}
console.error(`Summary: ${Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ')}`)
console.error(`\nFix by adding/raising a version in package.json > pnpm.overrides, then re-run pnpm install.`)
process.exit(1)
