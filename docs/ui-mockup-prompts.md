# CZCMS 界面视觉稿提示词

## 控制台首页 V1

- 输出文件：`frontend/src/assets/ai-image-studio/cms-dashboard-v1.png`
- 生成方式：千弈生图项目级工作流，`gpt-image-2`
- 画布：1536 × 1024
- 类型：高保真中文桌面后台UI

### Prompt

```text
Use case: ui-mockup
Asset type: high-fidelity desktop web admin dashboard screenshot for a multilingual CMS
Primary request: Create a polished Chinese-language CMS control panel interface that looks production-ready, professional, steady, clear, efficient, modern, and restrained. This is a realistic product UI, not concept art.
Scene/backdrop: full 1536x1024 desktop application viewport, pure white main canvas, very light cool-gray secondary surfaces, thin neutral borders, no device frame and no surrounding environment.
Composition/framing: compact left sidebar around 220px, slim top utility bar, spacious but information-dense main area. Use a 12-column grid. Avoid a repetitive grid of identical cards. Use one broad operational overview region, one narrow action rail, and a structured recent-content table below.
Color palette: restrained cobalt blue accent inspired by oklch(0.650 0.160 250), pure white background, cool steel-gray surfaces, deep slate text with strong contrast, muted gray secondary text. Green only for success, amber only for warning, red only for failures. Accent occupies less than 10% of the screen.
Typography: one clean modern Chinese sans-serif family, crisp readable labels, compact product typography, no display font.
Left navigation text, rendered verbatim in Chinese: "控制台", "站点管理", "语言管理", "内容管理", "模板管理", "SEO中心", "URL与伪静态", "媒体中心", "发布管理", "任务中心", "用户与权限", "系统设置". Highlight only "控制台".
Top bar text, rendered verbatim: brand wordmark "CZCMS", site selector "全球站", search placeholder "搜索内容、URL或任务", notification icon, avatar and "管理员".
Main header text, rendered verbatim: "控制台" and supporting line "掌握站点、内容与发布状态". Primary action button: "新建内容".
Operational status strip: four compact metrics with exact labels "待审核 12", "待翻译 18", "发布失败 2", "缓存命中率 96%"; keep numbers practical, not oversized hero metrics.
Main overview region title: "站点运行概览". Show a restrained 7-day traffic and publish trend chart, language distribution with small chips "英语", "德语", "法语", "西班牙语", "意大利语", "荷兰语", and a site health line "服务正常".
Right action rail title: "需要处理". Include three actionable rows with exact text "2个发布任务失败", "德语模板待检查", "3条内容等待审核", each with a clear small action button.
Lower table title: "最近发布". Columns: "内容", "语言", "站点", "状态", "发布时间", "操作". Use five plausible rows, language chips, green "已发布", amber "待审核", and compact kebab menus.
Bottom system health row: exact labels "数据库正常", "队列正常", "搜索索引正常", "最近备份 08:30".
Interaction qualities: familiar enterprise admin patterns, clear focus states implied, accessible contrast, 8px corner radius, mostly flat surfaces, subtle structural shadow only for dropdown or top layer, 16-24px spacing rhythm.
Constraints: all visible interface labels must be Chinese and spelled accurately; no English filler except the wordmark CZCMS and language codes if needed; no fake logos; no watermark; no gradients; no glassmorphism; no dark theme; no oversized numbers; no decorative illustration; no excessive rounded floating cards; no nested cards; no purple; no neon; no text overflow; no browser chrome.
```

