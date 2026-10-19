# 六语言网站检查与修复

请求：检查整个网站的页面缺口、功能入口与 UI，先提出方案，再实施修复。2026-10-15。

Mode: Read for support pages; preserve existing market identity and all supplied topic/article copy.
THESIS: every navigation or enquiry action reaches a useful real destination.
OWN-WORLD: existing country fonts and palettes; white reading field, flat rows, restrained borders.
STORY: discover service/industry, understand the scope, prepare an enquiry, find privacy and site information.
FIRST VIEWPORT: clear localized page title, useful explanation and a direct next step.
FORM: server-rendered support pages; native links; responsive contact form using the existing CMS inbox.

## 检查发现与方案（修改前）

静态抓取 118 个实际发现的 URL；其中 14 个目标 404，200 个引用资源全部成功。首页和已发现页面均一个 H1。六国语言首页桌面/390px手机、代表性专题/内容页已检查：未发现文档横向溢出、可见坏图或未标记输入框。手机服务横向列表属于可滚动局部区域，不计为页面溢出。

1. P1：14 个隐私、Cookie、条款、法定信息或联系入口 404。方案：补充六语言原生支持页面与现有别名；已发布 CMS 页面优先。未知公司法定名称、地址和邮箱不编造；暂行说明标记缺少运营者资料并 noindex，正式法律文本仍待用户提供。
2. P1：263 个锚点引用不存在，涉及 8 类锚点，多数是非首页导航假设所有首页都使用英文 ID。方案：按语言生成真实首页区块 URL；关于/联系入口使用独立页面。
3. P1：德语首页存在 logistics@example.com；旧兜底模板也有示例邮箱。方案：替换为实际询盘页面，避免用户给示例地址发信。
4. P2：移动菜单点击页内链接后仍可能遮住目标。方案：选择完成后收起父菜单，保留 Escape 与点击外部关闭。
5. P2：支持页面覆盖不足，没有独立服务/行业总览和统一联系页面。方案：从既有专题数据生成总览，复用现有后台接收流程；不创建虚构文章。
6. P2 内容缺口：ES/IT/NL 无已发布文章；现有温控内容附图含无关软件截图。保留 CMS 原文与媒体，在本报告记录，后续需真实内容素材。

## 边界

只做本地修复与可逆代码改动，不发布文章、不更改公司法定事实、不提交真实询盘、不变更既有 CMS 记录。用户回复“好的可以”表示可继续，但没有提供公司法定资料。现有 DESIGN.md 为后台种子文件，记录既有漂移，保留全局文件。

## 实施结果 · 2026-10-16

| 问题 | 采用方案与完成情况 |
| --- | --- |
| 支持入口缺页 | 补充六语言服务总览、行业总览、关于、联系，以及隐私、Cookie、条款、运营者信息的临时说明；接受现有导航别名。已发布 CMS 页面始终优先，可由编辑用正式内容覆盖。 |
| 导航锚点失效 | 使用语言对应的真实首页 ID；关于、服务、行业与联系入口接入实际页面。末轮另修正法语 methode、西语关于页和荷语 aanvraag。 |
| 示例联系方式 | 前台可见的示例邮箱换成实际联系入口，不虚构公司地址、电话或邮箱。 |
| 手机菜单遮挡 | 选择页内链接后收起菜单；保留外部点击与 Escape 关闭。 |
| 联系页排版 | 桌面双栏，左侧准备说明、右侧表单；800px 以下表单优先，480px 以下单列字段。保留各国本地字体与配色，荷语操作按钮使用已有橙色。 |
| 表单接收 | 复用已有受保护收件接口与后台收件箱；保留语言站、联系页来源、同意信息；客户数据加密存储。 |
| Sitemap 漏收专题 | 将现有 60 个专题及原生目录加入站点地图，去重排序；不将未完成的法律说明加入地图，不覆盖编辑页面的索引决定。 |
| 前端传输 | 只对公开静态文本资源开启 gzip；未压缩带短期表单令牌的 HTML。 |

## 验证证据

- 最终只读抓取 **296 个 URL（含导航别名）**：404 为 0、失效锚点引用为 0、H1 数量异常为 0。检查的 206 个本地页面引用资源全部成功；这是引用资源扫描，不等于穷尽所有 CSS 内部资源。六站 sitemap.xml/robots.txt 均成功。
- 六国语言 60 个专题及目录/支持页完成 **228 个桌面/手机场景**；六站首页和联系页再完成 **24 个最终确认场景**，未发现文档横向溢出、可见坏图、缺少名称的可见表单控件或失效的本页锚点。
- 实际操作验证：NL 联系页切到 DE 仍停留联系页面且语言菜单收起；EN 手机菜单选择服务区后菜单收起。
- 新增六站联系页临时数据库集成测试：提交成功、写入 new 状态、站点和 contact 来源正确、正文和联系方式加密。没有向正在运行的业务数据库提交测试询盘。
- `.tools/go/bin/go.exe test ./internal/... ./cmd/... ./frontend` 全部通过；专题 TypeScript 检查和 60 页构建通过，FR/ES/IT 首页与 NL 首页构建通过。现有后台收件箱读写/权限/去重等回归测试通过；本次没有逐屏人工复核整个后台。
- 最后的唯一改动为荷语支持页操作色及其 CSS 缓存版本；已重新构建运行程序并完成桌面/手机截图和色彩确认，白字对比度为 6.28:1。

证据在 `.impeccable/review/site-audit/`：before-crawl.json、crawl.json、after-browser.json、final-browser.json、contact-fix-verdict.json、contact-final-desktop.jpg、contact-final-mobile.jpg。当前本地服务已重启，六个语言端口可用。

## 尚需补充与已知限制

1. **正式运营者与政策资料（上线前）**：仍缺公司法定名称、注册地址、直接联系邮箱，以及正式隐私/条款文本。临时说明明确资料缺口并 noindex；不能当作完整正式政策。
2. **文章内容（编辑补充）**：ES/IT/NL 暂无已发布文章，目录展示诚实空状态；现有 EN 温控文章含不相关的软件截图，建议用实际货物、温控包装、运输流程素材替换。没有生成虚构文章或改动 CMS 附件。
3. **SEO 站点设置**：部分英文文章标题仍沿用 CMS 配置的 Global Route English 后缀；应在确定正式品牌站点设置/域名后统一，未直接改动已有站点记录。本地预览 noindex/无正式 canonical 属于预览行为。
4. **后续体积优化**：已有 React 包构建仍有体积警告；本轮 gzip 减少传输，后续可按语言和页面拆包。未以消除构建警告为由改写已验收专题架构。
5. **静态样式检测的范围**：只运行一次 detector，产生 167 项静态提示，多数来自 public.html 的既有条件分支/继承样式；动态 theme-assets 与一个旧 IT 模板样式无法静态解析，扫描退出码为 1，不能宣称检测全绿。新 support CSS 无发光阴影；截图采用平面布局。相关结果保留供后续针对实际渲染页面逐项核对，不据此宣称全站满足 WCAG AA。

## 设计复核与文档核对

独立 finish reviewer 两次都收到空任务，documenter 一次也收到空任务；按已读取的 Impeccable degraded 流程在本会话完成替代复核与文档核对，未伪称独立审查通过。替代复核发现荷语支持页被继承绿色覆盖，已单批修正并确认；最终 **ship 仅覆盖该项修正**。完整复核/评分记录见 `.impeccable/review/site-audit/finish-review.md`。

文档核对：**No changes** to PRODUCT.md / DESIGN.md；检查 support.html、support.css、editorial-common.css、country-layout.css 与既有 DESIGN.md。五行系统记录：

- 配色：复用既有市场令牌；NL 支持页橙色 #ac390b，其余市场按 country-layout.css。
- 字体：复用各国本地字体，NL Archivo Black + Plex、FR Source Serif/Sans、IT Bodoni + Manrope 等。
- 字阶：支持页 H1 2.3rem–4rem，H2 1.6rem–2.1rem；正文 16px、行高 1.8、主要内容最长 72ch。
- 布局：平面分隔行、桌面双栏、800px 单列、480px 单列字段；表单先于非交互准备说明。
- 状态：既有 focus-visible、必填/验证、发送中禁用、成功/失败反馈；真实链接与原生 details。

未规范化的既有漂移：根 DESIGN.md 是后台 seed，缺少根 `.impeccable/design.json`；旧条件模板中的检测提示与临时政策内容不记为未来组件规则。此次是前台扩展，未擅自重写全局设计文档。
