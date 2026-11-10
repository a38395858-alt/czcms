# 美国 HTS 编码与基础税率查询

本功能已于2026-11-06随 `20261106T044015Z-all-revisions` 发布到生产环境，正式入口为 https://freightvanta.com/tools/hts-code-lookup 。它为 FreightVanta 英文站提供美国10位HTS编码查询和详情，并在中文后台提供数据版本、自动更新和手动更新管理。发布与回退记录见 `docs/deployment-ubuntu-ip.md`。

## 本地入口

| 入口 | 地址或位置 |
| --- | --- |
| 查询预览 | [打开本地预览](http://127.0.0.1:8180/preview/global/tools/hts-code-lookup) |
| 带条件预览 | [查询 8517](http://127.0.0.1:8180/preview/global/tools/hts-code-lookup?q=8517) |
| 后台管理 | [HTS 税则数据](http://127.0.0.1:8180/admin#/admin/settings?section=hts) |
| 正式路径设计 | `/tools/hts-code-lookup`，仅用于 `global` 站点的英文版本 |
| 站内导航 | 英文页脚的 “US Customs Code & Duty Lookup (HTS)”；顶部导航保持原有内容 |

本地预览需要本机服务在8180端口运行。正式路径已上线；下文早期本地验收记录保留作为实现历史。

## 如何查询和阅读结果

页面标题为 “US Customs Code Lookup (HTS)”，用于查询美国进口报关的商品归类编码。输入完整 10 位编码可精确查询，例如 `6109100004`；也可输入带分隔点的编码，例如 `6109.10.00.04`。可按 `6109`（T 恤）、`6403`（皮鞋）、`9403`（家具）等前缀浏览商品类别，前导零会保留。英文关键词示例包括 `cotton t-shirts`、`furniture` 和 `lithium ion`。

停止输入约 300 毫秒后开始查询，也可以直接点击 “Search codes”。结果每页 25 条；查询条件和页码写入地址，可分享链接，浏览器返回也能恢复对应查询。点击 “Clear” 可清除查询和旧结果。

| 结果字段 | 阅读方式 |
| --- | --- |
| HTS Code | 10 位申报编码，页面以分段格式显示；“Copy code” 复制不带分隔点的 10 位数字 |
| Description | 官方英文条目描述；展开 “Full legal context” 可查看父级层次及适用的已收录脚注 |
| Unit | 官方统计申报单位，例如 `No.`、`kg`、`doz.`；未提供时显示 “Not specified” |
| General Rate | Column 1 的基础 General 税率；从父级编码继承时显示 “From …” 来源；无法确定时显示 “See schedule” |

导入时，条目缺少的 General 税率和单位会沿正确的带编码祖先层次继承，同时保留法定层级和脚注。展开层级有助于理解 “Other” 等依赖上下文的描述。每条结果还提供 USITC 官方页面链接。

General Rate 不等于最终应付进口税费。原产地、Chapter 99（例如 Section 301）、贸易救济措施、费用及法律注释仍可能影响最终金额；`Free` 也不表示全部进口费用为零。关键词匹配用于寻找待核对条目，不能替代正式归类或海关裁定。

桌面端使用四列表格，手机端将同一条结果按字段纵向排列。复制权限受限时，页面会显示可手动选择复制的数字输入框。关闭 JavaScript 后，提交查询和翻页链接仍可使用，编码也可手动选择复制。无结果和服务暂不可用时均提供英文提示。

## 数据来源和当前版本

当前随应用提供的真实官方快照为：

| 项目 | 当前值 |
| --- | --- |
| 官方版本 | `2026HTSRev22` / 2026 HTS Revision 22 |
| 生效日期 | 2026-10-30 |
| 10 位编码数量 | 19,949 |
| 官方导出原始行数 | 35,805，包含层级条目 |
| 初始快照获取时间 | 2026-11-05 01:04:26 UTC |

查询使用本地 SQLite 索引，查询时无需等待官方接口。页面显示版本、生效日期和最近核对时间；这些信息用于判断数据新鲜度，页面没有实时税率承诺。快照元数据见 [current.meta.json](../internal/hts/data/current.meta.json)。

已验证的官方数据入口如下，完整导出用于本地数据更新：

- [官方税则页面](https://hts.usitc.gov/)
- [版本列表](https://hts.usitc.gov/reststop/releaseList)
- [完整 JSON 导出](https://hts.usitc.gov/reststop/exportList?from=0101&to=9999&format=JSON&styles=false)
- [官方查询接口示例](https://hts.usitc.gov/reststop/search?keyword=8517)

原始示例地址 `/api/search?query=8517` 实际返回 HTML，不能作为 JSON 数据接口。官方搜索接口使用 `/reststop/search?keyword=8517`；本站访客查询走自己的本地数据接口。

## 后台管理和更新

在后台“系统”设置中打开“HTS 税则数据”页签，可查看官方版本、生效日期、10 位编码数量、最近核对与更新结果、自动更新安排和通知状态。

- “刷新状态”重新读取后台状态。
- “立即检查并更新”启动官方完整数据检查，界面随后轮询更新进度和结果。
- 页面提供查询预览、官方税则和现有邮件配置入口。

自动更新默认启用，按 `Asia/Shanghai` 时区在每月 1 日 02:00 执行。停机错过计划后，服务恢复会补查；更新失败后约 1 小时重试。可通过以下运行配置调整：

| 配置项 | 默认值 | 含义 |
| --- | --- | --- |
| `CZCMS_HTS_SYNC_ENABLED` | `true` | 是否启用自动更新 |
| `CZCMS_HTS_SYNC_TIMEZONE` | `Asia/Shanghai` | 月度更新时间使用的时区 |

每次更新先下载完整官方导出，再校验版本、条目数量、章节覆盖和重复编码。校验通过后，在数据库事务中整体切换；下载或校验失败时保留当前可用数据，查询继续使用原版本。后台会保留最近结果，方便管理员判断是否需要处理。

失败告警沿用后台“邮件转发”配置的收件人和 SMTP。相同更新月份按 `hts-sync:YYYY-MM` 持久化去重，只入队一次。SMTP 未启用时，告警先保存在待发送队列；邮件发送失败会重试，最多 5 次。更新超时产生的告警会保留，正常关闭服务导致的取消不触发失败告警。通知地址与内部错误只在有权限的后台显示。

后台截图来自隔离验证环境，该环境主动关闭了自动更新和 SMTP；截图中的暂停状态不代表应用默认配置。

## 维护接口与文件

| 接口 | 用途与约束 |
| --- | --- |
| `GET /api/public/hts-search?q=…&page=…` | 访客查询本地索引 |
| `GET /api/v1/system/hts` | 读取数据和更新状态，需要 `system.manage` 权限 |
| `POST /api/v1/system/hts/sync` | 启动手动更新，需要 `system.manage` 权限和 CSRF 校验 |

界面实现位于 [hts-lookup.html](../frontend/hts-lookup.html)、[hts-lookup.css](../frontend/assets/css/hts-lookup.css)、[hts-lookup.mjs](../frontend/assets/js/hts-lookup.mjs) 和 [hts-model.mjs](../frontend/assets/js/hts-model.mjs)。后台界面位于 [hts-settings.mjs](../frontend/assets/js/hts-settings.mjs) 与 [hts-settings.css](../frontend/assets/css/hts-settings.css)，共用页面接入位于 [public.html](../frontend/public.html)。

数据检索、继承与同步分别位于 [service.go](../internal/hts/service.go)、[normalize.go](../internal/hts/normalize.go) 和 [sync.go](../internal/hts/sync.go)；接口位于 [hts_handlers.go](../internal/httpserver/hts_handlers.go)，存储位于 [hts.go](../internal/database/hts.go)，通知接入位于 [system.go](../internal/mailer/system.go)。配置定义见 [config.go](../internal/config/config.go) 和 [.env.example](../.env.example)。

初始数据准备脚本为 [prepare-us-hts-data.py](../scripts/prepare-us-hts-data.py)，浏览器与真实同步验证脚本分别为 [verify-hts-lookup.cjs](../scripts/verify-hts-lookup.cjs) 和 [verify-hts-live-sync.cjs](../scripts/verify-hts-live-sync.cjs)。真实同步脚本会访问官方接口并触发更新，应在隔离验证环境使用。

## 已完成的验证与边界

本次交付记录显示 `go test ./...` 全部通过，前端 88 项测试通过。实际 Edge 浏览器覆盖了完整编码、前缀、英文关键词、输入防抖、旧请求取消、清除、翻页、浏览器返回、复制及手动复制、无 JavaScript 查询；320、390、768、1440 像素宽度检查未发现横向溢出。未执行 Safari 实机运行验证。

6 个真实数据查询的预热后本地 API 往返耗时为 7.9–66.5 毫秒，均低于 200 毫秒。这是本机验证结果，不能代表生产网络或负载表现。记录见 [browser-report.json](../.impeccable/review/hts/browser-report.json)。

隔离环境另外执行了一次真实官方版本/完整导出校验，并通过后台 POST 触发实际更新：耗时 18,241 毫秒，最终为 `2026HTSRev22`、19,949 条编码，无更新错误。该次 SMTP 关闭，没有发送真实邮件。较早的后台界面验证对异步同步和轮询使用了拦截响应；这部分交互验证与后续真实同步记录分开保留。记录见 [live-sync-report.json](../.impeccable/review/hts/live-sync-report.json)。

503 故障提示和剪贴板拒绝使用浏览器边界模拟验证。真实邮件投递、生产部署和生产环境运行不在本次已验证范围内。本文档整理阶段复核了已有截图、报告和部分界面源码，没有再次运行浏览器或测试。

## 美国 HTS 详情页（2026-11-05）

查询结果现可进入每个 10 位编码的详情页，例如 [3909505000 本地详情](http://127.0.0.1:8180/preview/global/tools/hts-code-lookup/3909505000)。正式路径为 `/tools/hts-code-lookup/{10-digit-code}`。详情页使用英文，沿用 FreightVanta 共用页头与页脚；提供返回查询、完整编码／前缀／英文关键词查询、复制编码及权限受限时的手动复制。

详情显示同一官方快照中的 General、Special、Column 2 税率及各自的继承来源、申报单位、完整法定父级、已收录脚注和版本信息。当前版本仍为 `2026HTSRev22`，2026-10-30 生效，共 19,949 个 10 位编码。示例 `3909505000` 显示 Other polyurethanes 的上下文、General `6.3%`、带完整项目标识的条件性 Special `Free` 及 Column 2 `15.4¢/kg + 51.5%`。缺失税率不按零处理。原产地选择仅提供核对步骤和官方链接，不计算附加税或最终应付税费；`Free` 也不证明商品符合优惠条件。

页面按概览、税率、原产地核对、法定归类和申报要求组织，桌面端配目录与来源侧栏，手机端纵向排列。章节浏览使用现有官方层级和章节查询。搜索、法定详情和结果链接在关闭 JavaScript 后仍可使用；未知或无效编码返回英文 404，并提供查询恢复入口。每个编码具有独立 SEO 标题、描述和 canonical，本地预览保持 `noindex`。

数据库迁移 40 增加 Special／Column 2 字段及来源。已有安装仅在当前数据与随应用快照的 SHA-256 完全一致时补齐新增税率字段，不以初始快照替换已安装的较新版本。实现见 [hts-detail.html](../frontend/hts-detail.html)、[hts-detail.css](../frontend/assets/css/hts-detail.css)、[hts-detail.mjs](../frontend/assets/js/hts-detail.mjs) 和 [details.go](../internal/hts/details.go)；验证脚本为 [verify-hts-detail.cjs](../scripts/verify-hts-detail.cjs)。

已有[详情验证记录](../.impeccable/review/hts-detail/verification.json)覆盖真实复制、手动复制、搜索与详情跳转、原产地提示、目录锚点、无 JavaScript、404，以及 320／390／768／1440 像素宽度，无横向溢出、页面错误或失败资源。交付记录另有 Go 全包通过、前端 88 项通过；后续联系入口模板修正后，针对性 `TestHTSDetail` 再次通过。Safari 尚未实机验证。本文档整理未重跑这些检查。

本地页面已实现并完成独立视觉审阅，生产环境未部署。[审阅结论](../.impeccable/review/hts-detail/finish-review.md)为 `fix`，仅涉及流程记录与证明材料；没有要求修改页面。用户选定的设计稿仍是视觉依据，但组件方案审核尚无批准回执、`plates` 阶段仍打开、后续阶段待处理，单独的 hero 阶段证明尚缺，因此不宣称全部交付门槛已通过。

## 2026-11-06 上线与税率用词澄清

上述“未部署”是11月5日的历史状态；完整功能已于11月6日随全部改版上线，随后按用户确认的方案调整美国详情税率表。
主标签为 General duty rate、Preferential duty rate、Non-NTR duty rate，下一行保留官方栏目名称。
优惠免税说明明确资格及原产地条件；Column 2 说明明确非 NTR 待遇，不是中国附加税，也不与 General 相加。
计量单位标签统一为 Reporting units，详情 SEO 描述同步术语。官方税率值、单位、商品描述和数据源均不修改。

当前程序为 `/opt/czcms/releases/20261106T054839Z-hts-copy`。
线上示例：[棉T恤 6109100004](https://freightvanta.com/tools/hts-code-lookup/6109100004)、
[聚氨酯 3909505000](https://freightvanta.com/tools/hts-code-lookup/3909505000)。
针对性 Go HTS 详情测试及两项前端 HTS 测试通过，本地浏览器核验两个编码在320／390／1440宽度的排版及德国页面独立标签。
部署前在生产数据副本上核对两个编码的税率、单位、商品名未变；切换后六站42个关键路由均200。
24份静态 HTML、生产配置、业务记录及迁移版本保持一致。部署记录见 `.tmp/server-deploy/hts-copy-release.json`。
公网 Edge 同样通过两个编码的320／390／1440宽度检查及德国详情回归，无页面错误、资源失败或横向溢出；
桌面和手机截图已检查。记录为 `.tmp/server-deploy/hts-copy-live/verification.json`。
