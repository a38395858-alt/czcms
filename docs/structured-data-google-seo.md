# Google SEO 结构化数据方案

## 目标与边界

CZCMS 在每个正式站点的公开 HTML 中输出 JSON-LD。它帮助 Google 识别“站点是谁、当前页面是什么、页面属于哪个层级、内容由谁发布”，但不承诺排名或收录。能否收录仍取决于页面质量、robots、Canonical、站点可访问性和 Google 的抓取判断。

关键词只保留在页面正文、标题、H1、摘要、Slug、图片 Alt 和 JSON-LD 的 `keywords`（文章的栏目 / Tag）等真实语境中；系统不会输出已经废弃的 `meta keywords`，也不会为了“多抓取”虚构搜索量、评分、价格或库存。

## 自动输出的实体关系

每个公开页面都会使用同一套站点实体标识：

| 实体 | 作用 | 主要字段 |
| --- | --- | --- |
| `Organization` | 站点主体和发布者 | `@id`、`name`、`url`、站点描述、已验证 Icon（作为 `logo` / `image`） |
| `WebSite` | 站点根实体 | `@id`、`url`、`name`、`inLanguage`、`publisher`、`about` |
| `WebPage` | 首页、普通单页面和错误页 | `@id`、`url`、`name`、`description`、`inLanguage`、`isPartOf`、`about`、`publisher` |
| `ContactPage` | 页面布局为联系页时的页面实体 | 在 `WebPage` 基础上使用 `ContactPage` 类型；是否收录仍由页面 `index_policy` 决定 |
| `CollectionPage` + `ItemList` | 栏目和 Tag 归档 | 归档标题、描述、语言、面包屑和当前已发布 URL 列表 |
| `BreadcrumbList` | 首页 → 当前页面层级 | 每个 `ListItem` 都带顺序、名称和绝对 URL |
| `Article` | 文章详情 | `headline`、`description`、作者、发布者、发布日期、修改日期、栏目、Tag、图片和 `mainEntityOfPage` |
| `Product` | B 端产品资料详情 | `name`、`description`、明确配置的品牌、栏目、图片和语言；不把内容负责人误当品牌，也不输出交易字段 |

首页以 `WebSite` 为根，同时把 `WebPage` 放入 `mainEntity`；文章详情以 `Article` 为根并引用同一站点 `Organization` / `WebSite`。这样既兼容现有读取根实体的工具，又让爬虫得到完整的实体关系。

## 页面级覆盖规则

编辑器里的“JSON-LD 结构化数据”可以留空，系统会按内容类型自动生成。也可以粘贴纯 JSON 或完整的 `application/ld+json` script：

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"Global Route English"}
</script>
```

保存时校验 JSON 对象、`@context`、`@type`、`@graph` 节点和 64 KiB 上限，并拒绝 `javascript:`、`data:`、`vbscript:` 等危险 URL；图片、Logo、`contentUrl` 等资源必须使用可抓取的 HTTP(S) 绝对地址。预览区可以直接复制最终 JSON-LD，适合交给 Rich Results Test 做人工复核。渲染时遵循以下规则：

1. 页面主实体的 `@type`、`@id`、`url` 和语言由内容模型与规范 URL 生成，不会被复制来的片段替换；
2. `Organization`、`WebSite`、`BreadcrumbList` 会合并到对应的自动节点；
3. 其他合法类型（例如确实存在 FAQ 的 `FAQPage`）会追加到 `@graph`，不覆盖文章、产品或单页面主实体；
4. `<`、`>` 和 `&` 会由 JSON 序列化安全转义，不能通过内容关闭 script 标签；
5. 没有可证实事实时不生成 `Offer`、`AggregateRating`、`Review`、`sku`、库存、价格或联系方式。

因此，粘贴上面的 Organization 片段到文章页面后，最终输出仍然是 `Article`，但组织信息会进入 `publisher`；粘贴到站点首页后会合并到站点的 `Organization`。不会出现“文章被错误标记成 Organization”的问题。

## 图片与抓取说明

正文封面和产品图库会输出为绝对 URL 的 `ImageObject`，已知时附带宽高和媒体 Alt。公开 HTML 还会同步 `og:image`、`twitter:image`，便于分享预览。

当前生产 robots 按此前的安全要求禁止图片搜索爬虫和常见图片扩展名；本地端口始终 `Disallow: /`。本地端口虽然 noindex，但 JSON-LD 仍使用当前端口的绝对 `url` / `@id`，便于浏览器和 Schema Validator 检查。若以后需要获取 Google 图片流量，应在 SEO 中心单独取消 `Googlebot-Image` / `msnbot-media` 的禁止规则，并确认媒体 URL 可公开访问、图片有准确 Alt、页面有稳定的宽高和版权说明。JSON-LD 本身不能绕过 robots。

## 发布前检查清单

- 页面返回 200，正式域名 HTTPS 可访问；
- Canonical 与 JSON-LD 的 `url` / `@id` 同一规范 URL；
- 栏目、Tag 归档和 404 的 JSON-LD 使用当前归档/请求路径；本地预览即使没有 Canonical，也会用当前端口的绝对 URL，不会退回首页；
- 页面 `lang` / JSON-LD `inLanguage` 使用实际 Locale（如 `en-US`）；
- 文章有唯一标题、H1、摘要，作者和日期来自真实记录；
- 产品只有真实的名称、说明、图片和栏目；只有配置了真实产品品牌时才输出 `brand`，不把负责人当品牌，也不填虚构价格；
- `hreflang` 只链接已发布且可访问的对等语言页，并包含自引用；
- Sitemap 只包含 index 页面，单页面的 `noindex` 与 robots 保持一致；
- 使用 Google Rich Results Test 与 Schema Markup Validator 检查最终公开 URL，而不是只检查后台文本框；
- 修改后用 URL Inspection 请求重新抓取，等待 Google 自行评估，不把测试端口提交到 Search Console。
