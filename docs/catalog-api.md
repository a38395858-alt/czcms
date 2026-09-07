# CZCMS 站点、语言与内容 API 开发说明

> 版本：V1.5  
> 更新：2026-08-28  
> 基础路径：`/api/v1`

## 1. 已实现范围

- 站点：查询、创建、编辑、停用；创建时可为初始语言选择已验证的可渲染模板，未指定时安全默认使用 `global-route`；站点可保存首页默认 SEO Title 和经媒体中心验证的网站 Icon；
- 站点访问：每个独立语言站点分配唯一 localhost 端口（首批为 `8081`–`8086`），同时保留 `/preview/{siteCode}` 兼容入口；单语言站不生成 Locale 二级目录；正式域名支持主域名、别名、308 主域名跳转、Host 路由和 DNS A / AAAA 查询状态；
- 动态语言：24 种预置、后台新增、编辑、停用；首批仅启用英语、德语、法语、西班牙语、意大利语和荷兰语；
- 站点语言：为站点绑定 Locale、启停语言，并可保存该 Locale 当前绑定的 `theme_package_id`；
- 内容组：创建内容、向同一内容组追加其他站点 / Locale 版本、查询、编辑、原子批量更新和软删除；
- SEO：每个内容 Locale 独立保存 H1、SEO 标题、Meta Description、核心与次要关键词、Canonical、Robots、Open Graph 和 JSON-LD；公开页自动输出 Organization、WebSite、WebPage / ContactPage、BreadcrumbList、Article、Product 或 CollectionPage，页面级 JSON-LD 以安全合并方式覆盖，不会替换页面主实体；每个未停用站点动态提供独立 `sitemap.xml`、`robots.txt` 和后台状态概览，不维护重复的 Sitemap 数据表；
- AI 本土化：以已发布英语内容为事实源，动态识别已上线模板分站，生成目标市场语境与 SEO 独立的待审核版本；
- 版本：所有更新使用乐观锁，旧版本写入返回 `409 Conflict`；
- 修订：创建、更新、发布、追加 Locale 和删除前均保存 JSON 快照；
- 安全：所有写请求要求登录、动作权限、CSRF 和 Origin 校验；内容读写额外要求站点 / Locale 数据范围。

## 2. 接口表

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/sites` | `dashboard.view` | 查询当前用户可见站点 |
| POST | `/sites` | `sites.manage` | 创建站点 |
| PUT | `/sites/{siteID}` | `sites.manage` | 按 `version` 更新站点 |
| DELETE | `/sites/{siteID}` | `sites.manage` | 停用站点，不物理删除 |
| GET | `/sites/{siteID}/domains` | `dashboard.view` | 查询站点的主域名、别名和 DNS 状态 |
| POST | `/sites/{siteID}/domains` | `sites.manage` | 添加正式域名绑定 |
| PUT | `/sites/{siteID}/domains/{domainID}` | `sites.manage` | 编辑域名或设为主域名 |
| DELETE | `/sites/{siteID}/domains/{domainID}` | `sites.manage` | 按 `version` 删除域名绑定 |
| POST | `/sites/{siteID}/domains/{domainID}/check` | `sites.manage` | 查询公开 DNS A / AAAA 记录并保存结果 |
| GET | `/sites/{siteID}/languages` | `dashboard.view` | 查询站点语言和模板绑定 |
| PUT | `/sites/{siteID}/languages/{languageID}` | `sites.manage` + `languages.manage` | 新增或按版本更新绑定 |
| GET | `/languages` | `dashboard.view` | 查询当前用户可见语言 |
| POST | `/languages` | `languages.manage` | 添加语言，可同时绑定首次站点 |
| PUT | `/languages/{languageID}` | `languages.manage` | 按 `version` 更新语言 |
| DELETE | `/languages/{languageID}` | `languages.manage` | 停用语言及其站点绑定 |
| GET | `/contents` | `content.read` | 按数据范围查询内容 Locale |
| GET | `/contents?site_id=&locale=&status=&content_type=&q=&limit=&offset=` | `content.read` | 按当前站点、Locale、状态、内容类型和关键词查询；统计使用同一范围 |
| POST | `/contents` | `content.write` | 创建新内容组及第一个 Locale |
| POST | `/contents/{contentID}/locales` | `content.write` | 向内容组追加本土化版本 |
| GET | `/contents/{contentID}/localization-options?source_site_id=&source_locale=` | `content.read` + `seo.manage` | 查询英语源内容与动态上线目标；返回站点/模板上线状态、权限和已有版本状态 |
| POST | `/contents/{contentID}/localize` | `content.write` + `seo.manage` | 为选定的已上线模板分站生成 AI 本土化待审核版本 |
| GET | `/localization/jobs?site_id=` | `seo.manage` | 查询当前数据范围内的本土化任务与逐目标结果 |
| POST | `/contents/bulk-update` | `content.write` | 原子批量修改最多 100 个 Locale 的状态和/或栏目 |
| GET | `/contents/{contentID}/locales/{locale}?site_id=` | `content.read` | 查询完整正文和 SEO |
| PUT | `/contents/{contentID}/locales/{locale}?site_id=` | `content.write` | 按 Locale `version` 更新 |
| DELETE | `/contents/{contentID}` | `content.write` | 按内容组 `content_version` 软删除 |
| GET | `/contents/{contentID}/revisions` | `content.read` | 查询当前用户范围内修订 |
| POST | `/contents/{contentID}/revisions/{revisionID}/restore` | `content.write` | 把历史快照恢复为新的草稿版本 |
| GET | `/seo/sitemaps` | `seo.manage` | 查询当前用户有权访问站点的 Sitemap / robots 状态、可收录 URL 数及自动 noindex 单页面数 |
| GET | `/seo/robots/{siteID}` | `seo.manage` + 站点全语言范围 | 查询指定站点可编辑的自定义 robots 规则与版本号 |
| PUT | `/seo/robots/{siteID}` | `seo.manage` + CSRF + 站点全语言范围 | 按 `version` 保存指定站点自定义 robots 规则，并写审计日志 |
| GET | `/audit?from=&to=&status=&category=&q=&limit=&offset=` | `audit.read` | 服务端分页查询不可变审计记录；日期为含首尾日的 `YYYY-MM-DD`，返回 `records/total/limit/offset` 和成功/失败汇总 |
| GET | `/taxonomy/terms?site_id=&locale=&kind=` | `content.read` | 查询站点/Locale 范围内的栏目和标签 |
| GET | `/urls/redirects?site_id=` | `publishing.manage` | 查询当前站点 URL 规则 |
| GET | `/publishing/releases?site_id=` | `publishing.manage` | 查询当前站点发布记录 |

当请求包含 `seo` 对象时，还必须具备目标站点 / Locale 的 `seo.manage` 权限。没有 SEO 权限的编辑可以修改正文，服务端会保留原有 SEO 字段。

站点更新请求可附带以下字段：`seo_title`（最多 200 个字符）、`seo_description`（最多 500 个字符）和 `favicon_media_id`（已上传媒体 ID 或 `null`）。Icon 必须是已存在的方形 PNG/JPEG（16–2048 像素）；服务端根据媒体的不可变校验和生成 `favicon_url`，不接受前端任意 URL。首页 `<title>` 使用站点 Title，`description` 与 Open Graph 描述使用站点 Description；两项为空时回退到当前语言模板默认文案。内容页优先使用内容 Locale 自己的 SEO Title 与 Description；Icon 会输出为 `rel="icon"` 和 `apple-touch-icon`。

### 2.1 Sitemap 与 robots 自动化

- 后台“SEO 中心”拆为两个可深链接的二级栏目：`#/admin/seo?section=sitemap`（站点地图设置）和 `#/admin/seo?section=robots`（robots 设置）。两页均读取同一份实时站点状态，不维护可被界面覆盖的重复配置。
- 每个未停用站点自动提供自己的 `/sitemap.xml` 与 `/robots.txt`；创建站点后不需要额外建表或点“生成”，绑定可渲染语言模板后首页和内容会自动进入对应地图。
- 本地独立端口使用 `http://localhost:{local_port}/sitemap.xml` 与 `http://localhost:{local_port}/robots.txt`，其中 robots 固定 `Disallow: /`，防止测试站被收录。

### 2.3 产品管理、产品栏目与元字段

- 后台主导航将“产品信息”作为顶级栏目，并在其二级菜单提供“产品管理”（产品信息列表）和“产品栏目”（分类树与栏目配置）；“元字段”保持为独立顶级栏目。产品沿用内容组 / Locale / 版本模型，但 `content_type=product` 仅用于 B 端资料展示，不包含购物车、支付、订单或库存交易。两个产品路由均保留独立深链接，便于权限校验、书签和前端跳转。
- 产品编辑页与文章、单页面共用安全富文本、封面、栏目、Tag、模板 Key 和独立 SEO；产品详情默认使用 `product/detail`，产品栏目默认使用 `product/category`。产品的技术参数、认证、应用行业、包装、交付时效、下载资料和询盘 CTA 使用元字段扩展，不再为每种业务硬编码数据库列。
- 元字段定义接口：`GET /metafields?owner_type=&status=`、`POST /metafields`、`PUT /metafields/{definitionID}`。定义包含稳定的 `namespace + key`、类型、绑定对象、说明、默认值、校验 JSON、是否可翻译、是否必填、是否允许 AI 和状态。创建后 Namespace、Key、绑定对象不可修改，更新使用 `version` 乐观锁。
- 元字段值接口：`GET /metafields/values/{ownerID}?owner_type=&site_id=&locale=`、`POST /metafields/values`。值使用 `{definition_id, owner_type, owner_id, site_id, locale, value}`，产品 `owner_id` 为内容组 ID；每个站点 / Locale 独立存储，跨站点和语言不会互相覆盖。产品编辑器会动态加载已启用的产品字段，并在正文保存成功后写入值。
- 支持类型：`text`、`textarea`、`richtext`、`number`、`date`、`url`、`select`、`multiselect`、`image`、`file`、`product_reference`、`category_reference`。其中 `richtext` 在内容编辑页使用与正文一致的可视化编辑器，支持标题、基础文字格式、列表、链接、图片上传、Ctrl+V 图片本地化、HTML 源码和全屏编辑。单选 / 多选的 `validation` 可使用 `{"options":[...]}`；多选值保存为 JSON 字符串数组。
- 服务端始终重新校验字段定义、对象类型、对象是否属于目标站点 / Locale、必填值、长度、数字、日期、URL、选项和引用 ID；`richtext` 经过 HTML 白名单清洗，媒体字段只能引用媒体中心已存在的 ID，不接受任意远程 URL。停用定义保留历史值但禁止新写入。

### 完整加密备份

- `POST /api/v1/system/backups`：创建一个 `.czb` 完整网站备份，包含一致 SQLite 快照、`uploads/` 媒体和 `themes/` 模板 ZIP；创建后自动完成 AES-256-GCM 认证、归档清单哈希与 SQLite 完整性验证。
- `GET /api/v1/system/backups/{backupID}/download`：导出已验证的单个 `.czb` 文件，需要 `backup.manage` 权限。
- `POST /api/v1/system/backups/import`：以 `multipart/form-data` 上传字段 `file` 导入 `.czb`。文件必须使用当前安装相同的备份密钥，验证通过后才进入备份记录；接口不会直接覆盖在线数据库、媒体或模板。
- `DELETE /api/v1/system/backups/{backupID}`：永久删除一份备份文件及其记录，需要 `backup.manage` 和 CSRF 校验；操作会写入审计日志。
- `POST /api/v1/system/backups/bulk-delete`：批量永久删除 1–100 份备份，JSON 字段为 `backup_ids`。所有 ID 会先校验，记录删除以一个数据库事务提交。
- `.czb` 不包含环境变量、应用主密钥、备份密钥、日志或 Redis 缓存。完整恢复使用离线命令 `czcms backup-restore <备份文件名> <新恢复目录>`，输出目录包含 `data/czcms.db`、`uploads/` 与 `themes/`。
- 后台兼容预览入口也可访问 `/preview/{siteCode}/sitemap.xml`、`/preview/{siteCode}/robots.txt`，用于排查机器文件；预览响应同样输出 `noindex, nofollow`。
- 正式绑定域名后，Host 路由自动在对应域名提供两份文件，例如 `https://www.example.com/sitemap.xml`。生产 robots 自动屏蔽后台、API、登录、预览、账户、表单提交和动态查询路径，并声明本站 Sitemap。
- Sitemap 只包含：已发布、到达计划发布时间、`robots_index=true`、未删除、已启用语言且已绑定可渲染模板的内容，以及可渲染语言首页；同时包含有可收录内容的栏目与标签归档 URL。草稿、审核、归档、未来定时内容、禁用语言或模板不可渲染的内容不会进入。
- `content_type=page` 为单页面类型，新建时默认输出 `<meta name="robots" content="noindex,follow">` 和 `X-Robots-Tag: noindex, follow`，并从 Sitemap 排除。生产 robots 会同步列出已发布的 noindex 单页面（例如关于我们、联系我们）的 `Disallow` 路径；后台可将企业介绍、服务或专题页的 `index_policy` 显式改为 `index`，此时页面会移出 Disallow 并进入 Sitemap。这样可避免新建工具页被抓取，同时保留明确允许收录页面的 SEO 能力。
- 生产 robots 同时禁止 Googlebot-Image、Bingbot 抓取图片，并屏蔽 `/media/` 及常见图片扩展名；本地端口仍固定 `Disallow: /`。robots 不用于保护敏感数据，敏感接口必须继续鉴权。
- robots 规则随站点状态、运行环境和域名绑定动态生成；每个站点可在 SEO 中心编辑自己的“自定义规则”文本（最大 300 行 / 24000 字符，带乐观锁和审计）。自定义规则会合并到系统规则之后；后台、API、图片、动态路径、Sitemap 和默认 noindex 单页面的自动规则继续保留，不能因手工编辑而丢失。

### 2.2 单页面管理

- 后台内容管理拆分为 `#/admin/content?section=articles`（文章管理）与 `#/admin/content?section=pages`（单页面）；后者只请求并展示 `content_type=page` 的真实内容数据，前者使用 `content_type=non_page` 保留文章、产品、栏目与落地页等其他内容类型。
- 单页面是内容实例，不是模板文件。每个页面有独立标题、Slug、站点、Locale、正文、封面、SEO 与修订历史，可照常保存、审核、发布、预览和批量删除。
- 新建单页面使用 `#/admin/content?section=pages&editor=create&content_type=page`，提供“关于我们、联系我们、专题页面、服务页面、自定义页面”模板。模板会填充标题、路径、栏目、页面布局和 `template_key`，最终仍需编辑并保存真实内容；联系我们模板保存时由服务端自动创建并绑定标准询盘表单。
- 模板管理中 `pages/page.html` 的“管理页面 / 新建页面”入口与以上页面共用同一数据模型；`pages/page.html` 决定页面外观，页面内容由内容管理保存。
- 单页面的收录状态由 `index_policy` 统一控制：空值默认 `noindex`，`index` 会同步写入 `robots_index=true` 并在发布后进入站点地图。其 JSON-LD 默认可使用 `WebPage`。

## 3. 内容写入示例

```json
{
  "content_type": "article",
  "site_id": 1,
  "locale": "de-DE",
  "status": "review",
  "title": "Sichere internationale Logistik",
  "slug": "sichere-internationale-logistik",
  "summary": "Für den deutschen Suchmarkt eigenständig verfasster Inhalt.",
  "body_html": "<p>...</p>",
  "ai_state": "localized",
  "seo": {
    "h1": "Sichere internationale Logistik",
    "title": "Internationale Logistik für Deutschland",
    "meta_description": "...",
    "primary_keyword": "internationale Logistik",
    "secondary_keywords": ["Spedition international", "weltweiter Versand"],
    "canonical_url": "https://de.example.com/sichere-internationale-logistik.html",
    "robots_index": true,
    "og_title": "...",
    "og_description": "...",
    "structured_data": {"@context": "https://schema.org", "@type": "Article"}
  }
}
```

这不是翻译接口。`ai_state=localized` 只表示内容来源状态；AI 任务必须在后续本土化模块中根据目标市场重新生成并经过人工审核。

## 4. 输入和冲突规则

- JSON 使用严格字段白名单，未知字段返回 `400`；
- 新建站点可传 `default_theme_package_id`；服务端只接受 `status=validated` 且渲染入口为 `global-route` 或 `atlas-commerce` 的模板。传 `0` 或省略时绑定已验证的 `global-route`；没有安全默认模板时拒绝创建，避免生成无法渲染的站点。指定非零模板 ID 还需要 `templates.manage` 权限；
- `seo_title` 为空时首页回退到模板默认标题；`seo_description` 为空时首页回退到模板默认摘要；`favicon_media_id` 必须指向媒体中心中已存在且为 16–2048 像素方形图片（上传后统一保存为 AVIF；历史 PNG/JPEG 可通过媒体迁移升级），删除被站点 Icon 引用的媒体会被拒绝；
- 站点代码和语言代码只能使用小写字母、数字及连字符；
- 本地测试不把 `localhost` 写入域名表；每个站点的 `local_port` 全局唯一，`8080` 保留给管理后台，新建站点从当前最大端口后自动分配；访问 `http://localhost:{local_port}/` 会进入对应站点，内容地址直接为 `http://localhost:{local_port}/{slug}`；
- 旧的单语言 Locale 前缀地址使用 `308` 跳转到无 Locale 的干净路径，避免重复页面；跨站语言菜单在开发环境跳转到对应端口，在正式环境跳转到目标站主域名；
- 本地预览返回 `X-Robots-Tag: noindex, nofollow` 和 `Cache-Control: no-store`；设置 `CZCMS_LOCAL_PREVIEW_LISTENERS=false` 可关闭独立端口监听；生产环境始终不启动本地预览端口；
- 正式域名只接受不含协议、端口和路径的 hostname，必须包含域名后缀，拒绝 IP、`localhost` 和 `.localhost`；域名在全系统内唯一；
- DNS 状态 `resolved` 仅表示已查询到公开 A / AAAA 地址；正式上线仍需运维确认解析目标、反向代理和 HTTPS 证书正确；
- Locale 必须符合受限 BCP 47 形式；
- Slug 只允许小写 ASCII 字母、数字、连字符和 `/`，最终 `.html` 等伪静态后缀由路由规则生成；标签在未手工填写 Slug 时按名称生成可读地址（空格转为下划线，如 `customs_clearance`），同站点 / Locale / 类型内发生冲突时自动回退为稳定的 `tag-xxxxxxxxxxxxxxxx` 地址；
- Canonical 必须是 HTTP / HTTPS 绝对 URL，禁止凭据、脚本协议和相对地址；
- JSON-LD 必须是 JSON 对象且不超过 64 KiB；`@context` 使用 `https://schema.org`，节点必须有 `@type`；Organization、WebSite、BreadcrumbList 会合并到自动实体，其他合法节点进入 `@graph`，服务端不会生成虚构价格、评分、库存、作者或联系方式；
- 次要关键词最多 20 个，禁止空值和重复值；
- 富文本最多 2 MiB，服务端始终重新执行 HTML 白名单清洗；
- `version` 与数据库不一致时返回 `409`，前端要求用户刷新后重新编辑，不静默覆盖；
- 内容删除是软删除；站点和语言删除操作实际为停用，以保留引用和审计证据。
- 批量更新必须提供 1–100 个 `{content_id, site_id, locale, version}` 目标；任一版本冲突、范围越权或发布校验失败时整个事务回滚。
- `status=published` 且 `scheduled_at` 是未来 RFC3339 时间时，内容显示为“定时发布”，到点前不进入公开详情、列表、跨站语言链接或发布页面计数；到点后由服务端时间门自动开放。
- AI 本土化目标必须同时满足：`sites.status=active`、站点 Locale 与语言均启用、`theme_package_id` 已绑定且模板可安全渲染、操作者拥有目标范围的 `content.write` 与 `seo.manage`。接口会重新校验，不信任前端勾选结果。
- 目标语言版本已存在时默认跳过且禁止 AI 覆盖；新生成版本固定为 `status=review`、`ai_state=pending`，必须人工审核后独立发布。

## 5. 数据库升级

`schema_migrations` 保存已执行版本。启动时先保证完整最新 Schema，再执行幂等升级逻辑，因此旧数据库会自动补充：

- 站点、语言、内容和 Locale 的 `version`；
- Locale 独立状态与完整 SEO 字段；
- `content_revisions` 修订表；
- `site_languages` 站点、Locale 与模板绑定表；
- `site_domains` 主域名、别名、跳转策略、DNS 状态和检查结果；
- `sites.local_port` 独立本地预览端口及唯一索引；
- 必要索引和历史行的 `created_at` 回填。
- V8 媒体库字段与引用、V9 独立站 Canonical 路径、V10 栏目/Tag 实体和内容关系、V11 AI 本土化任务记录。
- V14 站点级 `seo_title`、`favicon_media_id` 及媒体引用校验，V16 站点级 `seo_description`。

自动测试会先创建旧版表和历史内容，再通过当前 `Open` 升级并验证数据未丢失。
