import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';
import { registerCheckupApi } from './api.js';

const base = createPlugin({
  name: 'industry-checkup',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/industry-checkup.md',
  binFile: 'bin/cli.mjs',
  description: '深鲸行业合规体检：一个面板管五个行业（医疗/财税/招聘/制造/房产），按法规出处出命中与修复建议',
  whenToUse: '当用户要给某个行业的项目做上线前合规自查时使用：选行业（医疗/财税/招聘/制造/房产）→ 给目录 → 汇总命中项、法规出处与修复建议。典型说法：「帮我看这个项目有没有医疗合规问题」「财税这块要注意什么」「招聘广告有没有问题」。',
});
export const name = base.name;
export const inject = [...base.inject, 'webServer'];
export function apply(ctx) {
  base.apply(ctx);
  try { if (ctx.webServer?.register) registerCheckupApi(ctx); } catch (e) { ctx.logger?.warn?.('[industry-checkup] 面板出口注册失败: ' + (e?.message || e)); }
}
