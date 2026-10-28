#!/usr/bin/env node
/**
 * 深鲸行业合规体检 CLI
 *   dsh-industry-checkup --root <目录> [--industry medical,tax] [--json]
 *   dsh-industry-checkup --list
 */
import { checkup, INDUSTRIES } from '../lib/run.mjs';

const args = process.argv.slice(2);
const get = (n) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : ''; };
const has = (n) => args.includes(n);

if (has('--list')) { for (const i of INDUSTRIES) console.log(`${i.key.padEnd(14)} ${i.label}\t${i.desc}`); process.exit(0); }
const root = get('--root');
if (!root) { console.error('用法：dsh-industry-checkup --root <目录> [--industry medical,tax] [--json]'); process.exit(2); }
const inds = get('--industry') ? get('--industry').split(',').map((s) => s.trim()).filter(Boolean) : [];
const r = await checkup({ root, industries: inds });
if (!r.ok) { console.error('❌', r.error); process.exit(1); }
if (has('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(r.total ? 1 : 0); }
console.log(`体检完成：${r.total} 项（高危 ${r.summary.high} / 中危 ${r.summary.medium}）`);
for (const g of r.results) {
  if (!g.installed) { console.log(`\n【${g.industry}】未安装（${g.error}）`); continue; }
  console.log(`\n【${g.industry}】${g.findings.length} 项`);
  for (const f of g.findings) console.log(`  - [${f.severity}] ${f.ruleId}\n    ${f.file}:${f.line}  ${f.evidence}\n    → ${f.advice}`);
}
process.exit(r.total ? 1 : 0);
