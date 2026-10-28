# 深鲸行业合规体检（dsh-industry-checkup）

**什么时候用**：给某个行业的项目做上线前合规自查。用户会说「这个项目有没有医疗合规问题」「财税要注意什么」「招聘广告有没有问题」。

## 怎么用

```bash
<cli 路径> --list                                   # 列出五个行业
<cli 路径> --root <目录>                             # 全部行业
<cli 路径> --root <目录> --industry medical,tax      # 指定行业
<cli 路径> --root <目录> --json                      # 机器可读（命中退出码 1）
```

## 结构

- 判据不在这里：在各行业内核插件（medical / tax / hr / manufacturing / realestate）的 `rules/*.json`；
- 这里只做「选行业 → 调对应 CLI → 汇总」；一个面板管五个行业，不占五个图标；
- 每个命中项都带法规名称与条款出处、文件与行号、修复建议。
