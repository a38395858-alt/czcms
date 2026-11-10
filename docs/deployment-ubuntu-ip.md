# Ubuntu IP 部署

部署目标：`170.106.116.93`，Ubuntu 26.04 LTS / amd64。

- 英语网站：<https://freightvanta.com/>
- 德语网站：<https://de.freightvanta.com/>
- 法语网站：<https://fr.freightvanta.com/>
- 西班牙语网站：<https://es.freightvanta.com/>
- 意大利语网站：<https://it.freightvanta.com/>
- 荷兰语网站：<https://nl.freightvanta.com/>
- 后台：<https://freightvanta.com/admin>
- 健康检查：<https://freightvanta.com/healthz>
- 原 IP 主站及全部 8442–8446 语言端口已于 2026-10-28 跳转到对应域名；下文早期部署记录保留作历史参考。
- 后台保留本地已有账号和密码；服务器 SSH 账号与网站账号分开。

## 运行结构

Nginx 接收 80/443 请求，HTTP 自动跳转 HTTPS；Go 应用监听 `127.0.0.1:8080`。
服务以独立 `czcms` 用户运行，生产环境关闭 Go 本地语言预览监听器。
六语域名统一反代到同一个回环地址，保留 Host，由 CMS 的显式域名绑定选择对应站点。
`CZCMS_PREVIEW_ORIGINS` 已清空；原 IP 语言端口仅用于跳转，不再渲染预览页。

## 2026-11-09 六站 WhatsApp 联系入口（当前程序）

发布目录：`/opt/czcms/releases/20261109T034839Z-whatsapp`，上一版本为
`/opt/czcms/releases/20261106T054839Z-hts-copy`。程序 SHA-256：
`08f4954f5536f5b277ed77847867121d4052a27f6f5a7cdbf4fdea9cd1e3ef80`。

备份目录：`/var/lib/czcms/deploy-backups/20261109T034839Z-whatsapp`，包含一致数据库快照、配置副本及27份静态 HTML 原件。
六站共用页头新增号码 `+86 13538281696` 的右侧悬浮入口，电脑打开 WhatsApp Web，手机交由 WhatsApp 打开对话。
没有自动发送消息或添加第三方聊天脚本。普通 WhatsApp／Business 手机应用账号尚未接入官方消息接口，**新消息邮件提醒未启用**。

27份线上静态 HTML 只插入共享样式、交互引用和联系入口，发布脚本验证移除新增片段后与原件逐字节相同。
动态首页、专题、联系页及工具页使用内嵌模板；源站36个路由及六站新资源通过，sitemap、robots、配置、受保护业务记录和数据库迁移版本未变。
没有导入本地数据库，也没有提交询盘或发送 WhatsApp／测试邮件。

首次候选副本因 SQLite WAL 文件权限启动失败，正式站未切换。关闭副本连接后重新演练通过，再原子切换程序及静态页面。
发布记录：`.tmp/server-deploy/whatsapp-deployment-retry.log`；本地48个桌面／手机组合检查及拦截式跳转检查通过。
公网电脑／手机六站的48个页面组合在初次检查及荷兰站单独重试后完成，链接、号码、按钮位置与新标签跳转通过。
首次全量浏览器检查因页面访问超时中断，已检查44个组合；荷兰站另行完成8个组合，包含与前轮重复的4个桌面组合。
六站电脑／手机截图及汇总在 `.tmp/server-deploy/whatsapp-live/`，荷兰站重试明细在 `.tmp/server-deploy/whatsapp-live-nl/`。

回退时恢复备份中 `static/` 对应的27份静态 HTML，切回上一发布目录并重启程序，保留实时线上数据库。

## 2026-11-06 美国 HTS 税率文案澄清（历史程序）

发布目录：`/opt/czcms/releases/20261106T054839Z-hts-copy`，上一版本为下节的全部改版版本。
程序 SHA-256：`62b5b469f830cd95158d530884d82f1eba73d6cfff12067e7c0ba822ff5b3064`。
一致数据库备份、配置副本及发布记录：`/var/lib/czcms/deploy-backups/20261106T054839Z-hts-copy/`。

美国详情页税率主标签改为 General duty rate、Preferential duty rate、Non-NTR duty rate，
小字保留官方 Column 1 · General／Column 1 · Special／Column 2。说明优惠 Free 的资格和原产地条件，
并明确 Column 2 不是中国附加税，也不与 General 相加；Reporting units 及 SEO 描述同步用词。
CSS 使用限定美国税率表的样式，更新共用样式版本以刷新缓存，欧洲 TARIC 栏目未改。

发布前使用禁用 SMTP 和同步任务的生产数据库副本核验两个真实编码，税率、单位及商品名与发布前完全一致。
原子切换后，六站首页、编码查询与详情、仓库、运输查询、sitemap 和 robots 共42个路由均200。
24份静态 HTML、受保护业务记录、生产配置和数据库迁移版本均未变。
本次未刷新静态页面，也未导入本地数据库。失败回退只需切回上一程序并重启，保留实时线上数据库。
部署记录：`.tmp/server-deploy/hts-copy-deployment.log` 和 `hts-copy-release.json`。
公网 Edge 检查两个真实编码在320／390／1440宽度的标签、完整税率、优惠条件和非 NTR 说明，德国详情保持独立语言与栏目。
没有页面错误、资源失败或横向溢出；桌面和手机截图检查通过，证据在 `.tmp/server-deploy/hts-copy-live/`。

## 2026-11-06 全部已完成改版与海关编码查询（历史程序）

发布目录：`/opt/czcms/releases/20261106T044015Z-all-revisions`，上一版本
`/opt/czcms/releases/20261104T095332Z-warehouse-lookup`。程序 SHA-256：
`a0062a51b10426059951c5b6f70004fb8bfde03b5c2ab090f378455d96e930d8`。
一致数据库快照、原配置、24个静态 HTML 原件和新版本副本及发布记录位于：
`/var/lib/czcms/deploy-backups/20261106T044015Z-all-revisions/`。

本轮将当前完整程序、内嵌前端与税则数据发布到六站，包含首页／专题的说明与标签清理、运输费用及时效工具、
仓库地图查询的当前版本、美国 HTS 搜索／详情、欧洲五语 TARIC 搜索／详情、8组常用编码快捷入口及页脚入口。
从生产 CMS 数据重新生成全部24个 Nginx 静态快照，而不导入本地数据库；原 Google 验证标签保留。
业务内容、账号、SMTP、站点、表单、模板及 robots 记录摘要未变，环境、Nginx 和 systemd 配置摘要未变。
数据库执行新增的39／40版 HTS 表结构迁移，并创建独立 TARIC 措施缓存。

发布前在禁用邮件与同步任务的生产数据副本上演练迁移、24页渲染与五语官方措施查询，随后原子切换程序。
首次演练因数据库副本的 WAL 权限失败，正式站未切换；关闭复制连接后重试通过，最终以本节目录为准。
未提交真实询盘或发送测试邮件。正式环境沿用后台通知邮箱；HTS 每月更新和 TARIC 每日更新采用程序默认启用配置。

Go 全量测试、88项前端测试、三套 React 模板类型检查及构建通过。源站78个关键路由与67个资源通过；
六站 sitemap 保留全部旧地址并各新增编码工具入口，最终条数59／44／43／42／43／44，共275页，逐页抓取均为200，
无残留模板占位符或所检查的设计指令原文。robots 正文未变。
公网 Edge 浏览器六站首页桌面／手机、运输和仓库页手机、编码详情桌面／手机通过；五个欧洲站常用编码点击、
本国语言关键词搜索、官方6.50%示例措施和修改原产国后清空／链接同步通过。无脚本异常、资源失败或页面横向溢出。
公网证据：`.tmp/server-deploy/all-revisions-browser/verification.json`；源站记录：
`.tmp/server-deploy/all-revisions-release.json` 和 `all-revisions-crawl.log`。

美国入口：`https://freightvanta.com/tools/hts-code-lookup`；欧洲五站：各语言域名下的
`/tools/taric-code-lookup`。国家 VAT／消费税及德国第11位国家编码仍未接入，页面范围说明继续保留。
回退时切回上一发布目录并恢复备份中全部24个静态 HTML，再重启服务。保留实时线上数据库，新增兼容表结构不逆向删除；
不得用本地或旧数据库覆盖实时文章、账号或询盘。

## 2026-11-04 六国仓库地图与附近查询（历史程序）

发布目录：`/opt/czcms/releases/20261104T095332Z-warehouse-lookup`，上一版本
`/opt/czcms/releases/20261104T022958Z-shipping-markets`。程序 SHA-256：
`b1dafa031f9c720de99a5cc680bb671e80397c8c645b61be93bfe70f12baed10`。
一致数据库快照、环境/Nginx/systemd 配置、24 个静态 HTML 原件及发布记录位于：
`/var/lib/czcms/deploy-backups/20261104T095332Z-warehouse-lookup/`。

六站统一使用 `/tools/fba-warehouse-lookup`，分别提供英语、德语、法语、西班牙语、意大利语、荷兰语；
美国地图含 50 州与 DC，欧洲使用各国行政区地图、独立仓库目录、SEO 和公里距离。
美国 87 条、欧洲五国合计 47 条公开参考地址。荷兰只展示已核对的第三方仓，不虚构 FBA 收货仓；
美国 3PL 交互示例正式环境默认关闭。目录、近似坐标和来源范围见两个仓库功能说明文档。

本次更新程序和内嵌资源，并从生产 CMS 数据重新生成六站首页静态快照，加入本国页脚入口，保留
原 Google 验证标签。其余 18 个静态 HTML 字节未变；未覆盖本地数据库，受保护的账号、SMTP、内容、
表单、站点、模板等记录摘要及环境/Nginx/systemd 配置摘要一致。未提交真实询盘或发送邮件。

生产服务器访问 Census 返回 HTML 拦截页，已补上美国 Nominatim 备用定位，并与欧洲共用请求间隔和缓存。
真实美国街道地址返回两条美国候选，用户选择后查询附近仓库；荷兰街道返回一条候选。所有结果注明来源与近似精度。

发布前 Go 全部测试、86 项前端测试、唯一/多候选浏览器回归通过。源站验收 66 个关键路由和 67 个
资源通过，六国邮编与真实美/荷街道定位通过。六站 sitemap 旧链接全保留，条数由
55/40/39/38/39/40 增至 56/41/40/39/40/41，新增本国仓库工具干净地址，robots 未变。

公网 Edge 浏览器六站桌面与 390px 手机验收通过：本国语言、地图、仓库代码搜索、地区筛选、邮编及真实街道附近查询、FBA/3PL 分离、编辑后清空旧距离、页脚入口、canonical 和参数页 noindex 均通过。无脚本异常、坏资源或横向溢出。公网六个普通 sitemap.xml 均已包含新工具地址。浏览器记录位于 `.tmp/server-deploy/warehouse-public-results.json`。

首次候选因发布检查将 CRLF 自动转成 LF，误判静态首页响应，已自动恢复旧版。确认线上响应与文件原始字节一致后
修正比较方式并重新发布；最终以本节发布目录为准。回退时切回上一发布目录、重启服务，并恢复备份中六站
`static/<域名>/index.html`；保留实时线上数据库，不导入本地或历史数据库。

## 2026-11-03 英文首页运输时间与费用表格

首页 `topic-n900`、`topic-n901` 两个 CMS 区块引用了采购专题模板的工具类，
英文首页未加载这些类，导致正文贴边、表格拥挤。现用独立作用域样式修复：
1280px 内容容器、标题和说明层次、单元格留白、深蓝表头与隔行底色；窄屏在表格内部横向滚动。

样式源文件：`deploy/ubuntu/theme-assets/freightvanta-home-reference-tables.css`。
线上通过 CMS 模板资源 `theme_assets` 的模板 1 / `theme_css` 追加发布，版本由 2 升至 3，
修改记录 `theme_asset_revisions.id=4`。后续模板资源编辑应保留此区块样式。
主题 CSS SHA-256：`c56710754185fc4ee0cffa07936018119fe0d8e4c0aecddda14dc7895f18fb96`。

一致数据库备份及原 CSS 元数据：
`/var/lib/czcms/deploy-backups/20261103T034740Z-home-reference-tables/`。
本轮未替换最终运行程序；仍为下述 `20261102T011322Z-bulk-workflow`。
发布前后六站首页可见文本、Sitemap、robots 一致；用户、SMTP、内容、表单、站点及其他模板资源摘要未变。

本地 1440、1024、768、390、320 五种宽度、中文长文本与禁用 JavaScript 检查通过；
整个页面无横向溢出，手机表格内部可正常滚动。样式机械检查无发现。
公网同样完成五种宽度的布局断言和桌面/手机截图确认；禁用 JavaScript 时首页及主题 CSS
均返回 200，表格单元格仍使用 `18px 20px` 留白，布局不依赖脚本修补。
主题资源带 300 秒浏览器缓存；需立即查看时可强制刷新页面。

## 2026-11-02 英文大宗采购六步流程（历史发布）

`https://freightvanta.com/services/bulk-procurement#workflow` 已同步本地新版：
左侧深蓝标题与流程图标，右侧六个带编号、图标和说明的步骤；手机端上下排列。
服务端预渲染与 React hydration 同步更新，未仅靠浏览器脚本替换。

发布目录：`/opt/czcms/releases/20261102T011322Z-bulk-workflow`。
上一程序 `/opt/czcms/releases/20261030T011956Z-contact-email` 保留用于回退。
程序 SHA-256：`6a55fd3df936cc30bfea60a16114e1590d51d1fa3ca33aab478f6eae4bdad5bf`。
配置与一致数据库备份：`/var/lib/czcms/deploy-backups/20261102T011322Z-bulk-workflow`。

前端类型检查、生产构建、全量 Go 测试通过；本地 1920、1440、1024、768、390、320
六种宽度无横向溢出。线上源站 36 个页面/机器文件与 49 个文本资源检查通过；
采购页移除目标流程区块后的可见文本与原版一致，其他语言及页面可见文本未变化。
六站 Sitemap 与 robots 正文、首页 Search Console 验证、Nginx、环境配置和
账号、SMTP、正文、站点、表单、robots 数据摘要均保持一致。

公网英文采购页 1440、390、320 宽度及禁用 JavaScript 场景检查通过，
六步文案完整、脚本加载后仍保持新版布局，无应用脚本错误。
德、法、西、意、荷五站采购页各完成 1440 与 390 宽度的公网 hydration 检查，
本地化标题正常、无英文新版区块误入、无横向溢出或应用脚本错误。
Cloudflare 外部统计 beacon 仍被既有 CSP 阻止，未因本次板块发布放宽脚本策略。

## 2026-10-30 Sitemap 浏览器显示修复

六站 `/sitemap.xml` 共用的 HTML CSP 拦截了 Chromium 原生 XML 查看器的内联样式，
导致隐藏的 XML 源文档与格式化树同时显示。Nginx 现在使用精确 location 为该响应
设置专用 CSP：允许查看器样式与 data 图片，禁止脚本及外部资源，恢复标准可折叠树。
应用的 `renderSiteSitemap` 同步使用该策略，覆盖之后的程序发布与本地预览。

本次仅发布 Nginx 配置，未更换当前程序版本；六站 XML 响应正文逐字节保持一致。
首页安全响应头与 Search Console 验证标签检查通过，数据库和环境配置未修改。
`nginx -t`、六站源站检查、六站公网 Googlebot User-Agent 抓取和官方 Sitemap XSD 校验通过。
地图 URL 数仍为 43、33、33、32、33、33，总计 207。
六站公网 Edge 浏览器实测通过：原始源文档正确隐藏、XML 树可展开折叠，无脚本或 CSP 错误。

备份：`/var/lib/czcms/deploy-backups/20261030T055750Z-sitemap-viewer/nginx.conf`。
当前 Nginx 配置 SHA-256：`726848459c28fd0751df8bcd90385020fe1bb956162fdbd8eea47af08078a6ee`。
原配置可从上述备份恢复并在 `nginx -t` 通过后 reload。

## 2026-10-30 Google Search Console 首页验证

主站 `https://freightvanta.com/` 及 `de`、`fr`、`es`、`it`、`nl`
五个语言子域名的首页 HTML `<head>` 已加入用户提供的
`google-site-verification` 标签，验证码为
`FVVBvI62VSiXjv-LsyZsonGWv9irCwGa17VFT5I--UA`。
在 Search Console 对应的网址前缀资源中选择“HTML 标记”并点击“验证”完成所有权确认。
“HTML 文件”是另一种验证方式，不能用此 meta 标签代替文件。

本次仅调整 Nginx，通过根路径的精确 location 和六个显式域名映射输出标签；
配置已保存在 `deploy/ubuntu/nginx.conf`，后续程序发布保留此配置即可继续验证。
不要再在应用模板重复添加同一标签；如改为模板输出，需同时删除此处的注入配置。
应用版本仍为下述企业邮箱版本，本地采购流程排版未随本次操作上线。

Nginx 配置备份：`/var/lib/czcms/deploy-backups/20261030T024613Z-google-verification-six-sites/nginx.conf`。
当前配置 SHA-256：`8f5574f956ef5698f717f9d3c3c9aac7b3ead8268a821140d1e59ab2f23fabba`。
`nginx -t`、六站源站首页与其他七个页面检查通过。
六站公网 Cloudflare 均返回 200，首页源码及浏览器 DOM 的 head 中
均存在且只存在一条正确验证标签，canonical 和可收录策略正常。
数据库和 SMTP 配置未修改。

## 2026-10-30 公开企业联系邮箱

发布目录：`/opt/czcms/releases/20261030T011956Z-contact-email`，上一个程序
`/opt/czcms/releases/20261028T075017Z-robots-open` 保留用于回退。
程序 SHA-256：`58c0f300d7c3190c3e1b2d0d9ba91d3dddf9b08b407ba960445b3ad071e4f8a2`。
备份：`/var/lib/czcms/deploy-backups/20261030T011956Z-contact-email`。

六语首页、专题页、文章和其他公开页面页脚统一展示 `info@freightvanta.com`；
六语关于我们、联系、运营主体和隐私说明页的企业资料区增加可点击的邮箱。
组织结构化数据同步使用该地址。React 模板共用 `frontend/shared/company-contact.ts`，
保留 `VITE_CONTACT_EMAIL` 覆盖入口；Go 公开资料使用同一已确认地址。

发布前完成三套前端类型检查和构建、后端全量测试；最终专题页补齐后重新检查 60 个预渲染页面并重跑受影响包测试。
服务器直接验收 24 个首页/关于我们/采购专题/文章列表页面通过，六站 robots 保持开放。
账号、SMTP、正文、发布时间、站点与表单配置摘要均未变化，Nginx、环境配置和 Cloudflare 真实 IP 配置摘要未变化。
企业邮箱用于公开联系，表单 SMTP 发信与通知收件仍沿用原 QQ 配置；未发送邮件或提交真实询盘。
上线后通过 Cloudflare 完成六语首页、关于我们和采购专题的桌面/手机共 36 个浏览器场景：
页脚邮箱和关于我们企业资料邮箱可见、链接正确，无页面横向溢出或脚本异常；专题页在 hydration 后仍保持邮箱。

## 2026-10-29 Cloudflare 免费 CDN

六语网站及 www 已接入 Cloudflare；权威 NS 为 `tara.ns.cloudflare.com`、`trace.ns.cloudflare.com`，
SSL 模式为完全（严格），边缘证书有效。六语 HTTPS、静态资源缓存 HIT、首页与登录页不缓存、
后台跳转、robots 与 sitemap 已通过公网检查。源站已补充只信任官方 Cloudflare 网段的真实访客 IP 配置。
部署与维护说明见 [Cloudflare 接入记录](cloudflare/setup-20261029.md)。本次未更换程序或数据库。

## 2026-10-28 正式域名开放搜索引擎抓取

当次程序：`/opt/czcms/releases/20261028T075017Z-robots-open`，上一版本
`/opt/czcms/releases/20261028T071555Z-content-pagination` 保留。
程序 SHA-256：`c47ed02c68cf6bc708e5cf59bc099c130a341a0597a3988885ad0d6d7e359543`。
Nginx SHA-256：`8ca62a4d6c10d163cb9beba7ec197fc1de9c07a7cfd57977e43d7cd103bf021e`。
一致数据库快照及原配置位于 `/var/lib/czcms/deploy-backups/20261028T075017Z-robots-open/`。

六个正式域名的 robots 现在由 CMS 动态生成，默认 `User-agent: *`、`Allow: /`，
同时明确允许 `/assets/` 和 `/media/`，公开样式、脚本和图片可以正常抓取。
移除了 Nginx 对正式域名的全站禁抓文件、全站 noindex 响应头及同名响应头隐藏设置；
HTTP 和 www 入口继续 308 到各自的 HTTPS 正式地址。
移除了程序对图片格式及 Google/Bing 图片爬虫的禁止规则，英德站的旧自定义禁抓规则已清空，
对应站点 robots 版本递增并记录审计；本地同样清理了旧自定义规则并备份原值。

后台、登录、API、账号、表单接口、查询变体及设置为 noindex 的单页面仍保留原有抓取限制，
应用按页面输出的 noindex 响应头现在能够正确传递。生产预览入口关闭，本地预览仍禁抓；
原 IP 和旧语言端口继续只做跳转并保留禁抓。内容、账号、SMTP、询盘、域名及环境配置保持不变。

全量 Go 测试、robots 专项测试及 46 项前端检查通过。Nginx 语法检查、六站内部 HTTPS
18 个公开页面、robots、Sitemap 和登录页验证通过。公网逐站验证 9 种爬虫请求、
公开资源可抓取、页面 index/follow、Sitemap 域名和 www 跳转，全部通过。
六站 Sitemap 分别包含 43、33、33、32、33、33 个 URL，没有提交真实询盘或修改生产文章。

## 2026-10-28 内容管理分页与首次发布时间

当次程序：`/opt/czcms/releases/20261028T071555Z-content-pagination`，上一版本
`/opt/czcms/releases/20261028T065052Z-homeforms` 保留。程序 SHA-256：
`d335a16003fe891df9297ebfbcfa9f66195610f2d617997e875c01c4cf2dc18a`。
部署前一致数据库快照、环境和 Nginx 配置备份位于
`/var/lib/czcms/deploy-backups/20261028T071555Z-content-pagination/`。

内容管理中的文章、单页面和产品内容列表接入服务端分页，支持每页 20、50、100 条及首页、
上一页、下一页、末页。搜索和状态筛选查询全部授权内容；切换站点、类型、筛选和页大小回到
第一页，翻页清除本页选择，删除末页全部内容后自动回到有效页。顶部状态统计按完整类型范围计算，
文章列表排除单页面和产品，定时发布与已发布筛选分开。

列表分别显示“发布时间”和“最近更新”。首次发布使用实际发布时刻；定时发布使用设定的未来时刻。
首次发布后，编辑、撤回草稿、批量状态变更、恢复修订和重新发布均保留原发布时间。
尚未生效的定时计划仍可调整或取消；已发布文章的编辑器只读显示首次发布时间。
文章卡片改用发布时间，前台文章日期及 JSON-LD 使用内容记录中的发布时间与修改时间，
自定义或 AI 生成的 Article JSON-LD 不能覆盖系统日期，Sitemap 继续使用修改时间。

未迁移或重写现有文章日期，也没有上传本地数据库。线上账号、SMTP、内容、表单、域名绑定、
robots、环境和 Nginx 配置指纹校验一致；部署后 18 个页面、分页脚本及六站禁止抓取规则检查通过。
全量 Go 测试、46 项前端检查通过，最终日期逻辑及 JSON-LD 合并另有专项回归。
隔离数据库使用 106 条文章及单页面/产品验证跨 100 条翻页、搜索、筛选、站点范围、
编辑/撤回/重新发布、末页批量删除后的回退，以及桌面和手机展示，浏览器脚本异常为零。
隔离测试服务已停止，未在生产编辑内容、提交询盘或发送测试邮件。
公网后台只读验证通过：24 条文章分成 2 页，逐页 API 校验 24 条唯一记录，翻页、每页数量、
搜索、只读首发日期与手机分页控件正常。实测荷兰语文章 `/gidsen/ddp-vs-dap-incoterms` 的
首次发布时间为 2026-10-27、修改时间为 2026-10-28，后台和前台 Article JSON-LD 分别正确显示，
浏览器脚本异常为零。

## 2026-10-28 意大利语与荷兰语首页表单统一

当次程序：`/opt/czcms/releases/20261028T065052Z-homeforms`，上一版本
`/opt/czcms/releases/20261023T044227Z-seo` 保留。程序 SHA-256：
`a8b6c8c2e933bfe2e46cd3f2feb9ac4fe533638cd9b5a263cfe4314da8b905f1`。
一致数据库快照、旧环境和 Nginx 配置备份位于
`/var/lib/czcms/deploy-backups/20261028T065052Z-homeforms/`。

意大利语 <https://it.freightvanta.com/> 和荷兰语 <https://nl.freightvanta.com/>
首页移除旧长表单，采用与英语首页一致的五项布局：姓名、工作邮箱、公司、服务下拉、货物说明，
并保留隐私同意。仅姓名、邮箱和同意必填；文案、隐私链接及反馈分别使用意大利语/荷兰语。
两个首页共用同一 React 表单组件、现有专题表单翻译和样式，继续提交至本站 `/home-enquiry`。
保留服务入口预选、防重复提交、错误/过期/成功反馈和现有收件箱/邮件通知流程。
服务端预渲染补全当前站点的表单及隐私地址，避免本地预览和 React 加载后地址不一致。

只替换程序与内嵌资源，没有上传本地数据库。账号、SMTP、robots、内容、表单配置、
六语域名绑定、Nginx 和环境配置校验保持一致。禁止抓取策略与 `www` 跳转保留。
两个前端项目类型检查及构建、全量 Go 测试、新增的首页短表单地址与可选字段收件箱回归通过。
服务器内部 18 个页面及公网六站首页、82 个静态资源检查通过。
本地与公网各完成两个站的桌面/手机共 4 个浏览器场景，校验、双击防重、成功、422/403/409 反馈均通过；
各拦截模拟 16 次请求，没有提交真实询盘或发送测试邮件。手机与桌面截图确认字段和样式已统一，
没有脚本异常或横向溢出。本地 QA 使用 SMTP 已关闭的数据库副本，验证后已停止临时服务。

## 2026-10-28 六语域名全部绑定（当前配置）

法语、西班牙语、意大利语、荷兰语分别绑定 `fr.freightvanta.com`、`es.freightvanta.com`、
`it.freightvanta.com`、`nl.freightvanta.com`。各站页面仍位于根路径，没有语言子目录。
六站语言切换菜单均指向对应域名，HTTP 统一 308 到对应站点的 HTTPS。
`www.freightvanta.com` 的 HTTP 与 HTTPS 均 308 到 `https://freightvanta.com`，保留路径和查询参数。
旧 IP 主站跳转英语域名，8442–8446 分别跳转 `de`、`fr`、`es`、`it`、`nl` 域名。
搜索引擎抓取与索引限制继续保留，包括域名与旧端口的 `/robots.txt`。

证书名称仍为 `freightvanta.com`，已扩展为覆盖主域名、五个语言子域名及 `www` 共 7 个主机名。
当前证书有效期至 2027-01-26，原续期定时器保持 active，扩展后再次通过模拟续期和 Nginx 重载。
IP 证书保留用于旧地址的 HTTPS 跳转，IP 证书和域名证书都由原续期服务管理。

新增四条主域名绑定，迁移四站共 16 条内容的旧 canonical origin；
没有修改正文、SMTP、账号、robots、内容主记录、表单配置及已有英语/德语域名绑定。
没有更新程序，仍运行 `/opt/czcms/releases/20261023T044227Z-seo`。
没有发送测试邮件或提交真实询盘。

本次备份：`/var/lib/czcms/deploy-backups/20261028T062721Z-language-domains/`（root 专用）。
`pre-binding.db` 是切换前一致快照，`nginx.conf` 和 `production.env` 是切换前配置；
`language-binding.json` 记录绑定与续期验收结果，`language-binding-rollback-records.json` 保存修改前字段。
回滚时只恢复本次域名/canonical 字段与对应配置，不覆盖整库，避免丢失后续真实内容和询盘。

验收：服务器内部 18 个页面通过；公网六语共 72 个页面/SEO 文件、14 项跳转、
12 项未登录后台保护及 7 个 HTTPS 主机名证书检查通过。
六语首页/采购专题的桌面和手机共 24 个浏览器场景通过，语言切换、canonical、分享地址与表单显示正确，
没有横向溢出或 JavaScript 报错。新旧域名的路径与查询参数跳转验证通过。
本地 Nginx 配置与服务器 SHA-256 一致：
`992c883bb66b65b52b525e0a2d69997718b4a409a145e1df6c23ddb005d7fc96`。

## 2026-10-28 英语与德语正式域名绑定（首批历史记录）

- 英语主站：<https://freightvanta.com/>，后台 <https://freightvanta.com/admin>。
- 德语站：<https://de.freightvanta.com/>，专题仍直接位于 `/product-sourcing` 等根路径。
- `www.freightvanta.com`、原 IP 主站以 308 跳转到英语主域名，德语原 8442 端口以 308 跳转到德语域名；保留路径和查询参数。
- 法语、西班牙语、意大利语和荷兰语仍使用原 8443–8446 端口。仅从生产 `CZCMS_PREVIEW_ORIGINS` 移除 `germany`，保留其他四项。
- 泛解析不等于自动分配语言：仅绑定上述明确域名，没有将其他子域名自动绑定为某个语言站。

域名及 `www` 的 DNS 已验证指向 `170.106.116.93`，没有多余 AAAA 记录。
Let's Encrypt 域名证书覆盖主域名、德语及 `www`，证书名称 `freightvanta.com`，
路径 `/etc/letsencrypt/live/freightvanta.com/`，当前有效期至 2027-01-26。
原有 `czcms-certbot-renew.timer` 对所有证书执行续期，无需新增定时器；
已通过该域名证书的 `renew --dry-run --run-deploy-hooks`，Nginx 重载成功。
原 IP 证书继续服务剩余四个语言端口及旧 IP 跳转入口。

本次修改生产 `sites` / `site_domains` 绑定及两站共 9 条内容的旧 canonical origin，
语言切换、分享地址、结构化数据、canonical 和 sitemap 已跟随新域名。
没有替换程序或上传本地数据库，当前程序仍为 `/opt/czcms/releases/20261023T044227Z-seo`。
用户、SMTP、robots、内容主记录及表单配置摘要保持一致。
抓取与索引仍然关闭；没有提交询盘或发送测试邮件。域名后台需要重新登录，账号密码未改动。

备份目录：`/var/lib/czcms/deploy-backups/20261028T061846Z-domains/`（root 专用）。
其中 `pre-binding.db` 是实际绑定前的一致快照，`production.env` 与 `nginx.conf` 是旧配置，
`domain-binding.json` 保存操作结果，`domain-binding-rollback-records.json` 保存被修改的字段原值。
需要回滚时按原值恢复域名和 canonical 字段，并恢复旧 Nginx、环境配置；
不要直接覆盖整个在线数据库，以免丢失新的真实询盘和后台内容。

最终验收：服务器内部 18 个关键页面、公网 56 个页面/SEO 文件、5 项跳转、
4 项未登录后台保护检查及 3 个 HTTPS 主机证书验证通过。
英语与德语首页/采购专题的桌面和手机共 8 个浏览器场景通过：语言、canonical、
分享地址及语言切换正确，表单正常显示，没有横向溢出或 JavaScript 报错。
本地 `deploy/ubuntu/nginx.conf` 与服务器配置 SHA-256 一致：
`8ad1804e1bb2ee280f0b5cb36c5def0616a4507ad7f0fb558ca2427355b1c5fa`。

| 路径 / 服务 | 用途 |
| --- | --- |
| `/opt/czcms/releases/<UTC时间>/czcms` | 每次发布的 Linux 程序，内嵌前端资源 |
| `/opt/czcms/current` | 当前发布的符号链接 |
| `/var/lib/czcms/data/czcms.db` | 在线 SQLite 数据库 |
| `/var/lib/czcms/uploads` | 媒体文件 |
| `/var/lib/czcms/themes` | 模板包文件 |
| `/var/lib/czcms/backups` | 服务器新建的加密备份 |
| `/etc/czcms/production.env` | 生产配置和密钥，仅 root 可读（0600） |
| `/etc/nginx/sites-available/czcms` | Nginx 配置 |
| `czcms.service` | 应用服务，开机启动，异常退出自动重启 |
| `clamav-daemon.service` / `clamav-freshclam.service` | 上传扫描与病毒库更新 |
| `czcms-certbot-renew.timer` | 每 6 小时检查所有域名和 IP 证书续期 |

仓库中的 `deploy/ubuntu/` 保存实际使用的服务和 Nginx 配置，不包含凭据。
数据库通过 SQLite backup API 生成一致快照后迁移，媒体、模板文件同步迁移。
原应用主密钥用于保留加密数据的可读性，备份密钥与安装令牌在服务器重新生成。
本地历史备份和开发日志留在本地；生产备份使用独立新密钥。
部署只修改服务器副本的主站绑定：`www.example.com` 改为服务器 IP。

2026-10-20 首次发布目录为 `/opt/czcms/releases/20261020T060504Z`。
迁移时核对了 1 个用户、11 条内容、13 个语言版本、31 个媒体记录、
2 个模板和 1 条表单提交；用户记录逐字段校验一致。

## HTTPS

证书由 Let's Encrypt 签发，使用 IP 标识和 `shortlived` 配置。
证书有效期较短，必须保持续期定时器、80 端口和 ACME challenge 路径可用。
Certbot 5.8 位于 `/opt/certbot/bin/certbot`，续期成功后自动检查并重新加载 Nginx。

```sh
sudo systemctl list-timers czcms-certbot-renew.timer
sudo systemctl start czcms-certbot-renew.service
sudo journalctl -u czcms-certbot-renew.service -n 30 --no-pager
sudo /opt/certbot/bin/certbot certificates
sudo /opt/certbot/bin/certbot renew --dry-run --run-deploy-hooks --no-random-sleep-on-renew --cert-name czcms-ip
```

以后绑定域名时，需要同步修改后台站点域名、Nginx `server_name` / 跳转目标，
并为域名申请和配置证书。

## 日常操作

```sh
sudo systemctl status czcms nginx clamav-daemon --no-pager
sudo journalctl -u czcms -n 100 --no-pager
sudo systemctl restart czcms
curl --fail https://170.106.116.93/healthz
```

后续更新应构建新的 Linux amd64 程序、上传到新的 release 目录，校验后切换
`/opt/czcms/current` 并重启服务。不要用旧迁移包覆盖生产数据库和媒体目录。
更新前通过后台导出完整加密备份，并独立保管生产主密钥和备份密钥。

2026-10-22 共享头部更新发布到 `/opt/czcms/releases/20261022T062752Z-header`。
此次仅替换内嵌前端资源的程序，线上内容、用户密码、SMTP 配置、媒体和 Nginx 配置保留。
更新前通过 SQLite backup API 保存一致快照到
`/var/lib/czcms/deploy-backups/20261022T062752Z-header/czcms.db`（root 专用目录，文件权限 0600）。
旧版本 `/opt/czcms/releases/20261020T060504Z` 保留，可切回其符号链接并重启服务。
上传与安装后的程序 SHA-256 一致，账号摘要校验一致，服务健康检查通过。
公网 18 个页面确认仅有一个共享头部；桌面首页、专题、文章列表、文章详情及六种语言的
手机菜单检查通过，没有 JavaScript 报错。新增头部样式、交互脚本均返回 200，禁止抓取规则保留。

## 搜索引擎抓取开关（正式域名已开放）

2026-10-22 的全站禁止策略已按用户 2026-10-28 的新要求解除，最新发布记录见上方。
正式域名现在使用 CMS robots，允许所有爬虫访问公开页面和图片，自动保留私有路由及
noindex 页面的限制，并输出本站 Sitemap。单站自定义规则可在后台 SEO 中心继续维护；
后续部署应检查公开页面允许抓取，而不要沿用早期要求 `Disallow: /` 的旧验证脚本。
本地预览及原 IP 跳转入口继续禁抓，正式域名的全站 noindex 已解除。

## 邮件与其他语言

SMTP 配置随数据库保留。发件人与收件人均为 `38395858@qq.com`，
服务器 `smtp.qq.com`，端口 `465`，TLS。
2026-10-20 已在生产服务器加密保存 SMTP 授权码，测试邮件获得 QQ SMTP 接受，
并已启用表单邮件转发。授权码不保存在文档或仓库中。
后续更换授权码时，在 QQ 邮箱网页版的“设置 → 账户”中生成新授权码，
到后台“系统设置 → 邮件转发”保存后发送测试邮件。此处填写授权码，不是 QQ 登录密码。

其他语言采用独立站点架构，不部署在主站的语言子目录中。临时预览地址：

| 语言 | 站点代码 | 临时 HTTPS 地址 |
| --- | --- | --- |
| 英语 | global | <https://170.106.116.93/> |
| 德语 | germany | <https://170.106.116.93:8442/> |
| 法语 | france | <https://170.106.116.93:8443/> |
| 西班牙语 | spain | <https://170.106.116.93:8444/> |
| 意大利语 | italy | <https://170.106.116.93:8445/> |
| 荷兰语 | netherlands | <https://170.106.116.93:8446/> |

例如德语采购服务页是 `https://170.106.116.93:8442/product-sourcing`。
这些端口使用现有 IP 证书。需在云防火墙 / 安全组允许 TCP 8442–8446。
`deploy/ubuntu/preview-origins.env` 保存无密钥的端口映射示例；将其中的
`CZCMS_PREVIEW_ORIGINS` 配置到 `/etc/czcms/production.env`，然后重启应用。
`CZCMS_LOCAL_PREVIEW_LISTENERS=false` 继续保持，后台仍只在主站 `/admin`。

语言切换、站内路径、表单和站点地图均使用各自的 origin；旧的已配置
`/preview/{site}/...` 地址以 307 临时跳转到对应端口并保留路径、查询参数和提交方法。
生产环境没有映射的通用 `/preview/` 路径返回 404，不作为语言站的公开入口。
其他语言端口持续 noindex；主站可提供语言切换链接，但不会把未绑定正式域名的
预览页加入公开 hreflang。后台站点及内容预览按钮使用实际服务器端口地址。

以后每种语言绑定独立域名时：

1. 在后台给对应站点绑定正式主域名，配置 DNS 和对应的 Nginx 80/443 虚拟主机及证书。
2. 新域名同样反代到 `127.0.0.1:8080`，保留真实 Host；域名自动路由到该站点，页面仍在根路径。
3. 验证页面、表单、canonical、站点地图、hreflang 后，移除该站点的 `CZCMS_PREVIEW_ORIGINS` 映射并重启应用。
4. 删除对应预览端口监听，或将旧端口临时跳转到该语言正式域名，随后关闭不再使用的端口规则。
5. 按正式上线计划开放对应站点的抓取与索引。预览端口不作为正式 SEO 地址提交。

2026-10-22 独立端口更新发布到 `/opt/czcms/releases/20261022T072415Z-ports`。
原程序 `/opt/czcms/releases/20261022T062752Z-header` 保留；数据库一致快照、旧环境配置和
Nginx 配置保存在 `/var/lib/czcms/deploy-backups/20261022T072415Z-ports`，目录权限 0700。
发布前 `go test ./...` 全部通过；发布后五个端口的本机 HTTPS / 语言路由检查通过，
账号摘要与 SMTP 配置校验一致。公网已验证英文主站和法语 8443 的首页、采购服务页、
指南页、贴牌服务页、sitemap、robots；法语手机浏览器无横向溢出或 JavaScript 异常。
旧语言目录的 307 跳转及后台登录保护检查通过。
云防火墙端口放行后，已完成英文主站和五个语言端口共 36 个公网地址的验证：
各站首页、采购服务页、指南页、贴牌服务页、sitemap、robots 均正常，HTTPS 证书校验通过。
五种语言采购页的手机浏览器检查全部通过：页面语言正确、仅一个共享头部、没有横向溢出
或 JavaScript 异常，链接中没有 `/preview/` 或 localhost，旧目录 307 跳转验证通过。

## 上线检查

### 2026-11-04 六站运输费用与时效查询上线

发布目录：`/opt/czcms/releases/20261104T022958Z-shipping-markets`。前一版本
`/opt/czcms/releases/20261102T011322Z-bulk-workflow` 保留。程序 SHA-256：
`070e8473d7e9ed4a7747fd9a727c033b05d4987b8c82a8a533d0076810efcf67`。
一致数据库快照、配置、原静态 HTML 和发布验收记录位于
`/var/lib/czcms/deploy-backups/20261104T022958Z-shipping-markets/`，记录文件为 `release.json`。

美国英语站及德国、法国、西班牙、意大利、荷兰五个当地语言站上线
`/tools/shipping-calculator` 和 `/tools/shipping-results`。同步首页查询展示、页脚入口、
当地目的地与仓库、海运拼箱/整柜、空运、快递、尾程、各国 SEO 描述及可见说明。
整柜按箱型与柜数计算，不提交重量和体积。查询数据明确标注为演示数据，具体报价和时效引导联系。
导航不增加工具入口。查询页可收录并进入 sitemap，结果页保持 noindex。

**线上静态文件优先级：** 当前 Nginx 首页优先读取
`/var/www/fv-static/$host/index.html`，其他路由优先读取 `$uri.html`、`$uri/index.html`，
不存在时才转发应用到 `127.0.0.1:8080`。只替换程序会留下旧页面。
本次备份全部原有静态 HTML，以新程序的对应生产域名输出重新生成 24 份页面
（含六站首页、英文服务与行业专题及各国语言法律页），保留 Google 站点验证标签。
后续涉及这些页面的发布必须同步刷新对应静态文件。

本次没有上传本地数据库；线上用户、SMTP、robots、内容、表单、站点绑定、主题及迁移表摘要
与发布前一致，环境、Nginx 和服务配置摘要一致。服务与 54 个关键路由、54 个脚本/样式资源检查通过。
六站 sitemap 原有地址全部保留，分别由 54/39/38/37/38/39 条增加为 55/40/39/38/39/40 条。
公网以 Googlebot 请求六站地图和查询页，XML、页面语言及工具入口检查通过。

发布前 `go test ./...`、74 项前端测试、三个前端项目的类型检查与生产构建通过。
六站公网电脑和手机浏览器检查通过：整柜柜数计算及不提交重量/体积、尾程邮编与两种派送结果、
询价链接、语言、SEO、无横向溢出、无脚本异常或失败脚本/样式请求均通过；荷兰邮编小写输入也通过。
公网浏览器验收记录位于本地 `.tmp/server-deploy/shipping-public-results.json`，
截图位于同目录 `shipping-*-home-1440.png`、`shipping-*-calculator-390.png`。
发布期间旧静态覆盖及验收脚本标记/换行差异导致的候选版本已自动回退，最终发布以本节目录为准。
未提交真实询盘或发送测试邮件。

回退需要同时恢复程序与静态 HTML：将 `current` 切回上一个发布目录并重启服务，
从备份 `static/` 恢复原有文件，删除本次新增的意大利和荷兰首页静态文件；保留线上实时数据库。

### 2026-10-23 六语专题表单统一

发布目录：`/opt/czcms/releases/20261023T031338Z-forms`，上一版本为
`/opt/czcms/releases/20261023T023854Z-company`。程序 SHA-256：
`05d78bb55a6b86c9cfcf8650f4ba75a4c11d5e7bc59f935630822bd5e5b03594`。
数据库和配置备份位于 `/var/lib/czcms/deploy-backups/20261023T031338Z-forms/`。

六语共 60 个专题页共用 React 短表单，字段、字体、间距、按钮与英文首页对齐；
文案按站点语言显示。保留姓名、工作邮箱、公司、服务下拉选项及货物说明，
仅姓名、邮箱和隐私同意必填。移除旧的 DOM 替换脚本，服务端预渲染和浏览器使用同一组件。
提交沿用 `/home-enquiry` 和现有邮件通知通道，来源记录保留经校验的专题路径。

只更新程序，没有上传本地数据库或执行数据修复；账号、SMTP、robots、内容和表单配置摘要未变化。
前端类型检查、构建、Go 测试及新增六语短表单入库与邮件排队测试通过。
本地和公网分别检查 120 个桌面/手机页面场景，各 24 项拦截模拟提交检查通过，
覆盖成功、失败、过期令牌、重复请求、防重复点击及隐私链接。没有提交真实测试询盘或发送测试邮件。

### 2026-10-23 公司资料、六语 About 与企业文化

发布目录：`/opt/czcms/releases/20261023T023854Z-company`。上一版本
`/opt/czcms/releases/20261022T072415Z-ports` 保留，可切回符号链接并重启应用。
新程序 SHA-256：`3c2c768f9609c4ccb4b211ef07537e2637f668ba29ad2537edd44ebbddffaa7c`，上传和安装后校验一致。

本次上线公司身份、经营地址、六语业务介绍、11 个承运商标识和六张文化配图。
About 新增六项采购/包装/仓储/贴牌/履约业务入口；企业文化移至独立页面，沿用共用 head。

发布前暂停应用生成 SQLite 一致快照，备份数据库、环境配置和 Nginx 配置到
`/var/lib/czcms/deploy-backups/20261023T023854Z-company/`（root 专用目录）。
保留线上已有 17 条内容、19 个语言版本；没有上传或覆盖本地数据库。
对线上库运行限定的 SEO 修复脚本，共修复 14 条记录：清除示例 canonical、统一旧品牌、
解除温控指南错误截图引用、将三篇信息型条目归为 Article；修复原值和额外快照位于该目录的 `seo-repair/`。

修复前后用户、询盘、SMTP、robots 和邮件投递记录逐字段摘要一致；重启后账号、SMTP、robots
再次确认未变化，环境配置和 Nginx 文件摘要未变化。未发送测试邮件或提交询盘。
`go test ./...` 通过；发布后服务器内网 12 个 About/文化路由正常，健康检查通过。
公网 84 个地址检查通过，默认信任库验证 HTTPS，六语页面、业务链接、语言切换、sitemap 和禁止抓取策略均正确。
上线后六语 About/企业文化的桌面及手机共 24 个浏览器场景通过：无横向溢出、坏图、脚本异常或旧本地路径；后台未登录仍进入登录页。

| 语言 | 关于我们 | 企业文化 |
| --- | --- | --- |
| 英语 | <https://170.106.116.93/about> | <https://170.106.116.93/company-culture> |
| 德语 | <https://170.106.116.93:8442/ueber-uns> | <https://170.106.116.93:8442/unternehmenskultur> |
| 法语 | <https://170.106.116.93:8443/a-propos> | <https://170.106.116.93:8443/culture-entreprise> |
| 西班牙语 | <https://170.106.116.93:8444/quienes-somos> | <https://170.106.116.93:8444/cultura-empresarial> |
| 意大利语 | <https://170.106.116.93:8445/chi-siamo> | <https://170.106.116.93:8445/cultura-aziendale> |
| 荷兰语 | <https://170.106.116.93:8446/over-ons> | <https://170.106.116.93:8446/bedrijfscultuur> |

### 2026-10-23 整站 SEO 修复

最终发布目录：`/opt/czcms/releases/20261023T044227Z-seo`，前一版本
`/opt/czcms/releases/20261023T042939Z-seo`、首轮 SEO 版本及表单版本保留。程序 SHA-256：
`7c5374ea8e540dfdd7fc945d36a9000997b7ac1a7ec32332272e2b7daa79a2a9`。
一致数据库快照、环境配置、Nginx 配置和发布校验记录位于
`/var/lib/czcms/deploy-backups/20261023T044227Z-seo/`。

本轮只更新程序及内嵌前端资源。切换前受保护数据记录摘要一致；切换后用户、SMTP、robots、
内容和表单配置摘要未变，环境及 Nginx 配置摘要未变。服务器健康检查和六语 18 个关键页面通过。
保留禁止抓取和收录策略；未提交真实询盘或发送测试邮件。

修改重复别名跳转、六语目录与资料页摘要、分享地址与图片、结构化数据地址/类型/关系、
面包屑、分页及文章发布方展示。修正首页 JavaScript 将 SEO 地址覆盖为旧模板域名的问题。
具体修改与 E-E-A-T 待补真实材料见 [SEO 检查记录](seo-audit-and-fixes-20261023.md)。

本地最终检查：130 个页面、77 个补充内链及 195 个图片地址通过；未发现重复标题和摘要。
六语 54 个桌面/手机浏览器场景通过。前端类型检查、构建及 SEO 回归测试通过。
三张列表配图由 PNG 改用 WebP，总体积减少 95.9%，本地桌面和手机实际图片加载检查通过。
德语首页首屏图片也改用 WebP，体积减少 92.1%；本地桌面和手机实际加载检查通过。
最终 `go test ./... -p 1` 在 `GOMAXPROCS=2` 下通过；本机高负载时曾出现 SQLite 初始化五秒超时，降低并发后重跑通过。

最终发布后公网验收：153 个页面、80 个补充内链、231 个图片地址通过；未发现重复标题、
重复摘要、坏锚点或相对/空结构化数据地址。六语 60 个桌面/手机浏览器场景通过，
覆盖首页、About、文章列表、采购专题和文章页，页面加载后分享地址仍为当前站点。
六站 robots、超范围分页 404 及旧业务地址 308 共 24 项检查通过。
四张线上 WebP 的 MIME 类型与文件 SHA-256 逐一验证，与本地一致，总大小 597,984 字节。

### 首次上线与通用检查

- 默认信任库成功校验公网 HTTPS 证书，HTTP 请求跳转 HTTPS。
- 主站首页、10 个专题、登录页、SEO 文件、健康检查及 5 个语言站的首页和专题共 25 个页面返回 200。
- 页面引用的 112 个本站静态资源检查通过，没有返回 HTML 错误页。
- `/admin` 未登录时跳转登录页，SMTP 接口未登录返回 401，已初始化的 `/setup` 跳转登录页。
- 登录 Cookie 带有 `__Host-` 前缀、Secure 和 HttpOnly。
- 网站进程仅监听回环地址；Nginx、应用、扫描器及证书定时器已启用。
- Certbot 模拟续期及 Nginx 自动重载检查成功，续期服务运行结果为 success。
- IP 绑定与多语言专题回归测试通过，迁移时没有发送真实邮件。
