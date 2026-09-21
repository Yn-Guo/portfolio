# AGENTS.md — 个人主页仓库（D:\git-vitae-yn.github.io）

本仓库是 Yanan Guo 个人主页（基于 GitVitae 模板）的**唯一开发仓库**。
每次在这个目录开新任务时，先读本文件，再读 `PORTFOLIO_HANDOFF.md`。

## 0. 开工前必读

1. **`PORTFOLIO_HANDOFF.md`**（本目录，未纳入版本控制）——完整交接文档：当前状态、最近记录、格式约定、素材策略、下一步。
2. **`_OpenLocal.md`**（本目录，未纳入版本控制）——本地环境与日常命令备忘。
3. 读完这两个文件后再动手；改动完成后**更新 `PORTFOLIO_HANDOFF.md` 的「最近记录」**，不要另建新文档。

## 1. 环境与常用命令

- Node 24 + **pnpm ≥ 11**；依赖安装：`pnpm install`
- 本地预览：`pnpm dev` → http://localhost:3000
  （桌面快捷方式 **Portfolio Local** 等价于 `tools/local-launcher/Open-Local.cmd`：已在跑就只开浏览器，没装依赖会先 `pnpm install`）
- 检查与构建：`pnpm typecheck`、`pnpm check-config`、`pnpm lint`、`pnpm test`、`pnpm build`
- PDF 导出（**必须先有 `pnpm dev` 在运行**，脚本会在服务掉线时拒绝输出错误 PDF）：
  | 命令 | 产物 |
  |---|---|
  | `pnpm pdf:resume` | `exports/resume-en.pdf`、`resume-zh.pdf`（版式已封印） |
  | `pnpm pdf:cv-full` | `exports/cv-full-en.pdf`、`cv-full-zh.pdf`（默认单栏） |
  | `pnpm pdf:publications` | `exports/publications-en.pdf`、`publications-zh.pdf`（附件页） |
  | `pnpm pdf:portfolio-en` / `pnpm pdf:portfolio-zh` | `exports/portfolio-*.pdf`（简历+项目卡） |
- **跨盘搬迁不要复制 `node_modules`**（pnpm 硬链接会失效，出现 “Cannot find module …rollup/parseAst”）：到新位置删掉后重跑 `pnpm install`。

## 2. 目录与数据真相源

- `portfolio.config.yaml` —— **内容真相源**（个人信息、经历、项目、论文、开关如 `publishResume`）
- `src/` —— 站点代码（`src/pages/resume/` 负责简历与各 PDF 页面）
- `blog/<年>/<月>/*.md` —— 博客文章；`src/pages/blog/post.tsx` 支持 `ticker-demo` 代码块
- `ideas.md` —— 公开想法清单（idea ticker 的数据源，`tools/idea-ticker/`）；`ideas.local.md` 为私有条目
- `public/` —— 成品图与静态资源；**大素材（`.af`/`.tif`/原片）不进仓库**，放在 `D:\CV2026_secondhalf\作品集\`
- `exports/` —— PDF 交付物（已 gitignore）
- 未跟踪的本地私有文件：`resume.local.json`（含电话）、`ideas.local.md`、`_OpenLocal.md`、`PORTFOLIO_HANDOFF.md` —— **不要提交、不要写进公开面**

## 3. 硬性约束

1. **版式已封印**：简历/作品集 PDF 的版式（页数、字体、边距、抬头写法）不要再设计；只改内容数据。
2. **仓库是公开的、站点已上线**：`Yn-Guo/portfolio`（PUBLIC）+ GitHub Pages → https://yn-guo.github.io/portfolio/ ；push 到 main 即自动部署。因此进入版本控制的文件与提交历史都会公开——个人信息（电话、住址）不得写入仓库或提交历史（2026-09-21 已重写历史清除旧住址记录）。
3. **个人信息**：电话/住址只存在于未跟踪的 `resume.local.json`，导出脚本以 `&phone=` / `&location=` 注入；**不得**写进 `portfolio.config.yaml` 或任何受版本控制的文件。
4. 提交信息用英文祈使句；提交前跑 `pnpm typecheck` + `pnpm build`。
5. 沙箱权限有限：**Edge 无头导出 PDF、安装依赖、磁盘/系统设置**等需提示用户在本机终端执行。

## 4. 路径（2026-09-21 迁移后）

| 用途 | 路径 |
|---|---|
| 唯一仓库 | `D:\git-vitae-yn.github.io` |
| 公开站点 | https://yn-guo.github.io/portfolio/ （push main 自动部署） |
| 远端 origin | `https://github.com/Yn-Guo/portfolio`（PUBLIC，Pages 源） |
| 旧仓库 archive | `https://github.com/Yn-Guo/git-vitae-yn.github.io`（private，历史存档，不要往它推） |
| 资料与素材 | `D:\CV2026_secondhalf\`（作品集、投递工具包、碰碰运气、完整版/精简版…） |
| 自研 skills | `D:\_Skills\<skill>\`（一个 skill 一个目录、各自 .git；Codex 经 junction 加载） |
| 历史 | 2026-09-21 之前的记录见 `PORTFOLIO_HANDOFF.md`；其中 `E:\CV2026_secondhalf\git-vitae-yn.github.io` 即当前仓库路径（E 盘已退役） |
