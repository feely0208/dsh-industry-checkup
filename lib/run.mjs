/**
 * 深鲸行业合规体检 · 内核
 *
 * 不重复实现判据：每个行业的能力在各行业插件里（rules/*.json + 通用引擎），
 * 这里只做「选行业 → 调对应 CLI → 汇总结果」。一个面板管五个行业，避免五个图标。
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);

export const INDUSTRIES = [
  { key: 'medical', pkg: '@deepwhale-cn/dsh-industry-medical', label: '医疗', desc: '病历保存期 / 处方 / 设备网络安全 / 伦理与知情同意' },
  { key: 'tax', pkg: '@deepwhale-cn/dsh-industry-tax', label: '财税', desc: '会计凭证保存期 / 开票信息 / 税务数据出境 / 电子发票验真' },
  { key: 'hr', pkg: '@deepwhale-cn/dsh-industry-hr', label: '招聘', desc: '简历同意 / 就业歧视 / 背调授权 / 简历保存期' },
  { key: 'manufacturing', pkg: '@deepwhale-cn/dsh-industry-manufacturing', label: '制造', desc: '安全培训学时 / 特种设备 / 产品标识 / 危化品' },
  { key: 'realestate', pkg: '@deepwhale-cn/dsh-industry-realestate', label: '房产', desc: '广告承诺 / 明码标价 / 预售资金监管 / 中介备案' },
  { key: 'archive', pkg: '@deepwhale-cn/dsh-industry-archive', label: '档案', desc: '保管期限 / 电子档案四性检测 / 销毁审批 / 迁移留痕' },
  { key: 'construction', pkg: '@deepwhale-cn/dsh-industry-construction', label: '工程', desc: '施工资料归档 / 验收签认 / 特种作业持证 / 材料复检' },
];

/** 找到某个行业包的 CLI 路径（未安装则返回 null） */
export function cliOf(pkg) {
  try {
    const pkgJson = require.resolve(`${pkg}/package.json`);
    const p = join(dirname(pkgJson), 'bin', 'cli.mjs');
    return existsSync(p) ? p : null;
  } catch { return null; }
}

function 跑(cli, root) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, '--root', root, '--json'], { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, windowsHide: true });
    let out = '';
    child.stdout.on('data', (d) => { out += String(d); });
    child.stderr.on('data', (d) => { out += String(d); });
    child.on('close', () => {
      try { resolve(JSON.parse(out)); } catch { resolve({ error: out.slice(-300) }); }
    });
    child.on('error', (e) => resolve({ error: e?.message || String(e) }));
  });
}

/** 跑一个或多个行业；industries 省略 = 全部 */
export async function checkup({ root, industries } = {}) {
  const dir = String(root || '').trim();
  if (!dir) return { ok: false, error: '请填写要检查的项目目录' };
  if (!existsSync(dir)) return { ok: false, error: `目录不存在：${dir}` };
  const wants = Array.isArray(industries) && industries.length ? industries : INDUSTRIES.map((i) => i.key);
  const results = [];
  for (const ind of INDUSTRIES) {
    if (!wants.includes(ind.key)) continue;
    const cli = cliOf(ind.pkg);
    if (!cli) { results.push({ industry: ind.label, key: ind.key, installed: false, findings: [], error: `未安装 ${ind.pkg}` }); continue; }
    const r = await 跑(cli, dir);
    results.push({
      industry: ind.label, key: ind.key, installed: true,
      scannedFiles: r?.stats?.scannedFiles ?? null,
      findings: (r?.findings || []).map((f) => ({ ...f, industry: ind.label })),
      error: r?.error || '',
    });
  }
  const all = results.flatMap((r) => r.findings);
  const bySev = { high: 0, medium: 0, low: 0 };
  for (const f of all) bySev[f.severity] = (bySev[f.severity] || 0) + 1;
  return { ok: true, root: dir, results, total: all.length, summary: bySev };
}
