#!/bin/bash
# 深鲸行业合规体检 · 回归（五行业联动 / 干净样本 0 误报 / 指定行业 / 未安装提示）
set -uo pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
echo ""; echo "  深鲸行业合规体检 · 回归"
J=$(node bin/cli.mjs --root tests/fixtures/fail --json 2>/dev/null)
cnt(){ echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(len([f for f in d.get('results',[]) for x in f.get('findings',[]) if x.get('ruleId','').startswith('$1')]))" 2>/dev/null; }
[ "$(cnt MED-)" -gt 0 ] && ok "医疗命中" || bad "医疗漏报"
[ "$(cnt TAX-)" -gt 0 ] && ok "财税命中" || bad "财税漏报"
[ "$(cnt HR-)" -gt 0 ] && ok "招聘命中" || bad "招聘漏报"
[ "$(cnt MFG-)" -gt 0 ] && ok "制造命中" || bad "制造漏报"
[ "$(cnt RE-)" -gt 0 ] && ok "房产命中" || bad "房产漏报"
[ "$(cnt ARC-)" -gt 0 ] && ok "档案命中" || bad "档案漏报"
P=$(node bin/cli.mjs --root tests/fixtures/pass --json 2>/dev/null | python3 -c "import json,sys;print(json.load(sys.stdin).get('total'))")
[ "${P:-1}" = "0" ] && ok "干净样本 0 误报" || bad "干净样本误报 $P"
O=$(node bin/cli.mjs --root tests/fixtures/fail --industry tax --json 2>/dev/null | python3 -c "import json,sys;d=json.load(sys.stdin);print(len(d.get('results',[])))")
[ "${O:-0}" = "1" ] && ok "指定行业只跑一个" || bad "指定行业过滤失效：$O"
node bin/cli.mjs --list | grep -q "医疗" && ok "--list 可用" || bad "--list 缺失"
echo "  ────────────────────────────────────────"; echo "  通过 $PASS · 失败 $FAIL"; [ "$FAIL" -eq 0 ]
