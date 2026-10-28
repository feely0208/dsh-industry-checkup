# 深鲸行业合规体检（@deepwhale-cn/dsh-industry-checkup）

一个面板管五个行业：**医疗 / 财税 / 招聘 / 制造 / 房产**。选行业 → 给项目目录 → 出命中项、法规出处与修复建议。

判据不在这个包里，而在各行业内核插件（`dsh-industry-*`）的 `rules/*.json`；这里只做汇总，避免重复实现。

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-industry-checkup
```

## 用法

```bash
dsh-industry-checkup --list
dsh-industry-checkup --root ./his --industry medical
dsh-industry-checkup --root ./project --json     # 命中退出码 1，可接 CI
```

面板：侧栏「深鲸行业合规体检」。
