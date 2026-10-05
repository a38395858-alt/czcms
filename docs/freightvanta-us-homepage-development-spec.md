# FreightVanta 美国国际物流主站首页开发说明

## 1. 目标与边界

### 页面目标

为 FreightVanta 建立英文全球主站首页，面向美国本地的 B2B 客户：进口商、品牌方、电商团队、采购/供应链负责人及需要跨境履约的成长型企业。首页必须在首次访问时清楚回答四个问题：

1. FreightVanta 能运输什么；
2. 是否能覆盖客户的运输方式、航线和末端交付；
3. 为什么值得信任；
4. 下一步如何获得报价或与专家沟通。

### 参考范围

同行站点用于学习其业务覆盖方式（国际货运、仓储履约、清关、最后一公里、行业解决方案和询价闭环），不复制其页面、图片、文字、品牌或代码。FreightVanta 应呈现为更清晰、更可信、适合美国企业采购决策的物流伙伴，而不是低价货代落地页。

### 业务范围

首页默认覆盖以下服务；后台可按站点/语言启用或隐藏：

- Ocean freight：整柜 FCL、拼箱 LCL、港口到门；
- Air freight：紧急货、补货、时效型货物；
- Ground & final mile：提柜、卡车、预约派送、末端交付；
- Customs & compliance：清关协同、文件、进口流程支持；
- Warehousing & fulfillment：仓储、分拣、贴标、订单履约；
- Supply-chain visibility：节点追踪、异常提醒、人工支持。

不在首页做在线下单、价格承诺、运输时效保证或未经验证的客户 Logo / 数据。报价由询盘表单或销售联系闭环完成。

---

## 2. 品牌与视觉方向

### 设计判断

美国 B2B 物流采购者通常更看重可靠、清晰、可联系和可解释，而不是“科技感大屏”。视觉采用 **深海军蓝 + 信号蓝 + 港口安全橙 + 冷白** 的工业航运调性：像一份可靠的运输计划和一座现代化货运港，而不是通用 SaaS 页面。

- 主色：深海军蓝，承担主视觉、导航、CTA 对比；
- 操作色：高可读信号蓝，只用于链接、焦点和主操作；
- 强调色：港口安全橙，仅表示货运节点、紧急服务或少量重点；
- 背景：冷白与雾灰，避免大面积渐变和悬浮卡片；
- 图像：真实港口、集装箱、仓库作业、空运货运、美国末端配送；避免“握手、假笑客服、世界地图背景”图库套路。

### 字体与版式

- 英文标题：采用具有工业感、字形稳定的无衬线显示字体；正文使用清晰的系统无衬线字体。
- 桌面内容最大宽度：1200–1280px；核心正文控制在 65–75ch。
- 首屏标题不超过 72px；移动端约 42–52px，始终保证英语长词不溢出。
- 圆角保持 6–10px；普通内容区使用分隔线与留白分组，不做满屏圆角卡片。

### 视觉核心动作

英雄区以“货物从起运地到美国仓/门点”的路径作为视觉主线。可使用真实摄影主图叠加轻量路线图，也可使用定制的货运路线插画；不能只用几个色块、图标或世界地图占位。

---

## 3. 首页完整信息架构

页面顺序按客户的决策路径设计，而不是按后台内容类型堆叠：理解价值 → 判断匹配度 → 建立信任 → 了解流程 → 查看行业能力 → 发起询盘。

| 顺序 | 模块 | 用户要解决的问题 | 主要动作 |
| --- | --- | --- | --- |
| 1 | 顶部公告与导航 | 我在哪里，如何快速找到服务？ | Get a quote |
| 2 | Hero 首屏 | 这家公司能否解决我的跨境运输问题？ | Start a shipment / Talk to an expert |
| 3 | 信任与覆盖条 | 是否覆盖我的运输节点？ | 查看服务 |
| 4 | 运输方式选择器 | 我的货适合海运、空运还是陆运？ | Browse solutions |
| 5 | 可视化运输流程 | 如何从询价到送达？ | See how it works |
| 6 | 业务能力横幅 | 能否同时处理清关、仓储、履约？ | Explore capabilities |
| 7 | 行业解决方案 | 是否理解我的行业约束？ | View industries |
| 8 | 为什么选择我们 | 为什么不直接找普通货代？ | 与专家沟通 |
| 9 | 路线/地区覆盖 | 主要起运地和美国目的地如何覆盖？ | View lanes |
| 10 | 客户案例/证明 | 是否有真实的服务结果？ | Read customer story |
| 11 | 资源中心 | 我是否能先了解运输和进口知识？ | Browse guides |
| 12 | 询价模块 | 我应该提交哪些信息？ | Request a quote |
| 13 | FAQ | 常见顾虑能否快速解答？ | 查看全部 FAQ |
| 14 | Footer | 合规、联系、地区与站点入口在哪里？ | 联系/切换站点 |

---

## 4. 模块规格与英文首页文案

以下为美国英语初稿。上线前可由销售确认服务范围、覆盖地区、电话号码、地址和任何可量化证明。

### 4.1 顶部公告与主导航

**用途：** 首屏前建立定位，不做促销弹窗。

公告条（可选，仅有真实信息时显示）：

> Freight moving to the U.S.? Get a shipment plan from a logistics specialist.

导航：

- Solutions
  - Ocean Freight
  - Air Freight
  - Ground & Final Mile
  - Warehousing & Fulfillment
  - Customs Support
- Industries
  - E-commerce & Retail
  - Consumer Goods
  - Industrial & Components
  - Time-Critical Cargo
- Resources
  - Shipping Guides
  - Incoterms Guide
  - Freight FAQs
- About FreightVanta
- Contact

右侧固定主要按钮：`Get a quote`

桌面端 Solutions 和 Industries 使用可键盘操作的下拉菜单；移动端转为全屏/抽屉导航，禁止在窄屏塞入横向下拉菜单。

### 4.2 Hero 首屏

**视觉：** 左文右图，或全幅港口/仓库摄影上覆盖有足够对比度的深色信息层；右侧显示货运路线、目的地节点和集装箱/货机局部，避免复杂世界地图。

**主标题：**

> Move freight with clarity, from origin to arrival.

**正文：**

> FreightVanta helps growing businesses coordinate ocean, air, ground, customs, and fulfillment through one accountable logistics team.

**按钮：**

- 主按钮：`Get a shipment plan`
- 次按钮：`Explore our services`

**首屏辅助信任点：**

> Ocean · Air · Customs · Warehousing · Final Mile

**首屏必须有：**

- 可见的询价入口；
- 简洁的服务范围，不填造数字；
- 首屏图片的描述性 alt 文本；
- 移动端不裁掉标题、CTA 或路线关键内容。

### 4.3 覆盖与服务方式选择器

标题：

> Freight support built around the way you move.

引导文案：

> Choose the service that fits your shipment today. Combine them when your supply chain needs more than one handoff.

呈现为一个横向切换区域，而不是三张相同卡片：左侧为模式标签，右侧显示真实物流场景图片、适用场景、能力清单和链接。

| Tab | 标题 | 文案 | 要点 |
| --- | --- | --- | --- |
| Ocean | Ocean freight | Plan container and consolidated freight with flexible routing, clear milestones, and support before exceptions become delays. | FCL, LCL, port-to-door |
| Air | Air freight | Keep high-priority cargo moving with time-sensitive routing and coordinated pickup, customs, and delivery. | express, standard, urgent replenishment |
| Ground | Ground & final mile | Connect port, warehouse, retailer, and consignee with dependable drayage and final-mile coordination. | drayage, appointments, delivery |

模块内 CTA：`Find the right service`

### 4.4 “一个团队，完整链路”能力横幅

此处解决“只会订舱还是能处理全流程”的疑问。

标题：

> More than a booking. A connected freight operation.

四项能力：

- **Customs coordination** — Keep documents and handoffs organized before cargo reaches the border.
- **Warehousing & fulfillment** — Receive, prepare, store, and route inventory closer to your customers.
- **Shipment visibility** — See the milestones that matter and get a human response when plans change.
- **Exception management** — Resolve delays, rollovers, and delivery issues with a clear owner.

视觉采用宽幅仓库/码头图与叠加的细线信息层；功能点是叙事锚点，不做四个带大图标的模板卡。

### 4.5 运输流程

标题：

> A simpler way to move complex freight.

流程只在这个模块使用编号，体现真实顺序：

1. **Tell us what is moving** — Share origin, destination, cargo details, timing, and any special handling needs.
2. **Get a practical shipment plan** — We recommend a route, service mix, and next steps based on your priorities.
3. **Coordinate every handoff** — Pickup, freight movement, customs, warehouse, and delivery stay connected.
4. **Stay informed until arrival** — Receive milestone updates and support when an exception needs attention.

次级链接：`See the shipment process`

交互：桌面端可用一条路线把四个节点串联；移动端改为垂直时间线，不能缩小到难读。

### 4.6 行业解决方案

标题：

> Logistics that respects how your business operates.

四个非同构版块，以行业照片和不同约束描述区分：

- **E-commerce & retail** — Inventory flows, marketplace prep, routing guides, and delivery appointments.
- **Consumer goods** — Reliable replenishment for seasonal demand, launch schedules, and retail distribution.
- **Industrial & components** — Freight planning for equipment, parts, documentation, and production schedules.
- **Time-critical cargo** — Faster coordination when inventory, events, or urgent demand cannot wait.

按钮：`Explore industries`

### 4.7 地区与主要航线

标题：

> Built for global origins and U.S. destinations.

正文：

> Coordinate freight from key manufacturing regions into the ports, warehouses, and customer locations that keep your U.S. business moving.

内容需要由后台可维护，至少包括：起运区域、目的地区域、服务方式、说明、图片、落地页链接。首次可展示 Asia–U.S.、Europe–U.S.、North America domestic 三组，不承诺未实际覆盖的航线。

CTA：`Talk through your lane`

### 4.8 选择 FreightVanta 的理由

标题：

> When freight changes, you should know who owns the next move.

内容采用三段有证据感的短句：

- **Clear ownership** — One team coordinates the next action instead of sending you between vendors.
- **Useful visibility** — Updates focus on the milestones and exceptions that affect your business.
- **Built to scale with you** — Add lanes, services, and fulfillment support as your operation grows.

如没有真实客户评价，不放评价星级和虚构头像。可替换成运营方法说明、认证、真实合作品牌或可核实案例。

### 4.9 客户案例（可延期）

只有拿到客户授权与可核实结果后上线。

标题：

> A freight plan that made room for growth.

结构：客户行业 + 面临的问题 + FreightVanta 解决的流程 + 经过授权的结果 + 链接。结果未确认前显示为“运营故事”而非虚构 KPI。

### 4.10 资源中心

标题：

> Shipping intelligence for better decisions.

正文：

> Practical guides for planning international freight, preparing imports, and understanding the handoffs behind delivery.

首页取最新 3 篇已发布文章；文章卡片必须使用实际封面图或与主题相关的定制图，不用同一条路线图重复占位。

首批建议内容：

- `How to Choose Between Ocean Freight and Air Freight`
- `A Practical Guide to Shipping Goods to the United States`
- `Incoterms Explained for Importers and Growing Brands`

CTA：`Visit the resource center`

### 4.11 报价表单与转化区

标题：

> Tell us what you need to move.

正文：

> Share a few shipment details and a FreightVanta specialist will help you map the most practical next step.

表单字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| Full name | 是 | 联系人 |
| Work email | 是 | 企业邮箱优先，但不强制拦截免费邮箱 |
| Company | 是 | 公司名 |
| Phone | 否 | 允许国际号码 |
| Origin | 是 | 国家/城市或港口 |
| Destination | 是 | 国家/城市、港口或邮编 |
| Freight type | 是 | Ocean / Air / Ground / Warehousing / Not sure |
| Cargo details | 否 | 货物类别、数量、体积/重量、特殊要求 |
| Target timing | 否 | Ready now / This month / Planning ahead |
| Message | 否 | 补充需求 |
| Consent | 是 | 同意 FreightVanta 依据隐私政策联系我 |

提交按钮：`Request a shipment plan`

成功状态：

> Thanks — your request is on its way. A FreightVanta specialist will review the details and follow up with the right next step.

防护：保留现有 CSRF、蜜罐、限流与服务端校验；不能在浏览器端暴露任何第三方密钥。

### 4.12 FAQ

默认展示 5–6 个折叠问题，回答保持具体但不构成报价承诺：

- What information do you need to provide a freight quote?
- Can you help with both ocean and air freight?
- Do you coordinate customs clearance?
- Can you support warehousing and fulfillment in the United States?
- What happens if a shipment is delayed or rolled over?
- Do you work with businesses that are new to importing?

FAQ 使用原生 `<details>` / `<summary>` 或等效可访问性组件，支持键盘、屏幕阅读器和 URL 深链接。

### 4.13 Footer

必须包含：服务链接、行业链接、资源中心、关于我们、联系、隐私政策、Cookie 政策、条款、站点语言切换、公司地址/联系邮箱（真实信息确认后填写）。

---

## 5. CMS 数据与模板开发方案

当前公共模板已有 Hero、服务、内容文章、联系表单、语言切换、SEO 与 Schema 入口。要支持完整首页，不能把所有英文写死在 HTML；首页应定义为可被站点和语言版本覆盖的数据模块。

### 5.1 新增首页模块配置

建议新增 `home_sections` 或等效 JSON 配置，按 `site_id + locale + section_key` 保存。每个模块带 `enabled`、`sort_order`、`title`、`body`、`cta_label`、`cta_url`、`media_id`、`settings` 与版本号。

建议 section_key：

```text
announcement
hero
service_modes
capabilities
process
industries
lanes
reasons
case_study
resources
quote_form
faq
```

不同语言站点可以：

- 使用相同结构、独立文字和图片；
- 关闭不适用的业务模块；
- 替换 CTA 到本地联系方式或本地表单；
- 替换地区/航线描述，但不影响其他站点；
- 基于默认英文站点复制草稿，再逐语言审核发布。

### 5.2 推荐模板文件划分

在主题系统新增/扩展下列模板文件，避免把首页堆在一个不可维护文件：

```text
partials/header.html
partials/footer.html
pages/home.html
partials/home/hero.html
partials/home/service-modes.html
partials/home/capabilities.html
partials/home/process.html
partials/home/industries.html
partials/home/lanes.html
partials/home/reasons.html
partials/home/resources.html
partials/home/quote-form.html
partials/home/faq.html
assets/theme.css
assets/home.css
assets/home.js
```

若现有主题编辑器暂不支持部分模板引用，第一阶段可先以 `pages/home.html` + `assets/home.css` + `assets/home.js` 发布，但数据字段与 CSS 命名必须按模块分隔，后续再拆分文件。

### 5.3 后台编辑体验

在“模板/首页模板”内提供首页模块列表：

- 每个模块可开关、拖动排序、编辑文案、替换图片、预览；
- 显示当前站点与语言，防止误改到其他网站；
- 图片选择走现有媒体库，自动保存 alt 文本；
- 修改先生成草稿预览，确认后发布；
- 关键表单、导航和结构化数据修改写入审计日志；
- 不允许在可视化字段中插入任意 `<script>`；自定义 CSS/JS 只在受控主题资源中编辑并沿用现有安全校验。

---

## 6. 交互、响应式与可访问性

### 交互

- 顶部导航在滚动后保持轻量 sticky 状态；不能遮住锚点标题。
- 服务方式 Tab 支持鼠标、触屏、键盘箭头/Tab；切换不应造成布局跳动。
- 表单提交显示 loading、成功与可恢复的失败原因，提交失败时保留用户输入。
- FAQ 默认全折叠；用户打开一个或多个都可以，不强制手风琴。
- 图片优先 `loading="lazy"`，但首屏 LCP 图片不懒加载。
- 仅使用轻量进入动效；启用“减少动态效果”时所有信息默认可见。

### 响应式

| 宽度 | 要求 |
| --- | --- |
| ≥ 1280px | 充分展示双栏主视觉、路线图、运输模式内容区与侧边信息。 |
| 768–1279px | 英雄区可保持双栏，但服务模式与行业区压缩为两列或单列，导航转为菜单。 |
| < 768px | 标题、CTA、表单、流程均单列；首屏主要 CTA 全宽；路线视觉移到标题之后。 |
| < 420px | 不隐藏关键解释和联系方式；控制标题尺寸与表单标签换行。 |

### 可访问性

- 正文和背景的对比度至少 WCAG AA；
- 所有图片有有意义的 alt，纯装饰图使用空 alt；
- 表单都有可见标签、错误文本和焦点位置；
- 菜单、Tabs、FAQ、Modal 皆支持键盘和屏幕阅读器；
- 不只使用颜色表达服务状态、表单错误或选中项；
- 英文站默认 `lang="en-US"`，未来各站点输出正确 locale / RTL 设置。

---

## 7. SEO、结构化数据与性能要求

### SEO

- 页面仅一个 H1；主服务区使用 H2，具体服务用 H3；
- 初始 Title：`International Freight Forwarding & Logistics Services | FreightVanta`；
- 初始 Description：`FreightVanta coordinates ocean, air, ground, customs, warehousing, and final-mile logistics for growing businesses shipping to and across the United States.`；
- 每个语言站点输出独立 canonical 和 hreflang；
- 服务、行业、资源文章均可内链到独立可抓取页面；
- 首页图片、产品、文章和 FAQ 保持在站点地图范围内。

### 结构化数据

首页默认输出：

- `Organization`：名称、URL、Logo、联系信息、社媒（真实信息齐备后）；
- `WebSite`：站点名称、URL、搜索入口（如搜索功能公开）；
- `Service`：只描述真实提供的海运、空运、陆运、仓储/履约服务；
- `FAQPage`：仅为页面上真实可见的 FAQ 输出；
- `BreadcrumbList` 只用于具有真实层级的内页，不在首页虚构面包屑。

不要使用虚构评分、Review、AggregateRating、营业资质或虚构地址。Schema 内容应由 CMS 安全序列化，不让编辑器直接拼接 JSON-LD 脚本。

### 性能指标

- 首屏 LCP 图像优先使用 WebP/AVIF，提供正确尺寸和 `fetchpriority="high"`；
- 非首屏图片使用 AVIF/WebP + 响应式尺寸 + lazy loading；
- 首页不加载大轮播库、自动播放视频或第三方聊天插件作为首屏依赖；
- 目标：移动网络下 LCP ≤ 2.5s、CLS ≤ 0.1、INP ≤ 200ms；
- 预留图片容器尺寸，避免图像加载导致版面跳动；
- 字体使用 `font-display: swap`，优先少量自托管字体或系统字体栈。

---

## 8. 开发阶段与验收标准

### 阶段 1：数据与内容骨架

1. 定义首页模块配置与站点/语言隔离规则；
2. 创建美国英语首页初始数据；
3. 准备真实/授权的摄影素材清单与 alt 文本；
4. 确认服务、区域、联系信息与报价字段。

**验收：** 不依赖硬编码英文，后台可以针对一个站点创建、预览和发布首页草稿。

### 阶段 2：模板与视觉实现

1. 重构首页模板为完整模块顺序；
2. 实现桌面、平板、移动端布局；
3. 完成服务方式选择器、流程、FAQ、询价表单；
4. 加入主题级 CSS/JS，并执行模板安全校验。

**验收：** 320px、768px、1024px、1440px 下无溢出；所有主要 CTA 有明确目标；没有占位 Lorem ipsum、虚构客户或未授权数据。

### 阶段 3：SEO、可访问性与质量验证

1. 检查 title、description、canonical、hreflang、JSON-LD；
2. 验证 Keyboard navigation、焦点、表单错误与减少动画；
3. 检查移动端性能和图片格式；
4. 浏览器手工走通询价提交、语言切换、各个内部链接；
5. 记录审计日志与发布回滚点。

**验收：** Lighthouse / 手工检查不存在重大可访问性、SEO、性能阻断；询价信息能安全入库且后台可查看。

### 阶段 4：内容增长

1. 发布服务页、行业页、航线页与资源文章；
2. 为各地区语言站进行本地化改写，而非逐句翻译；
3. 按真实客户授权逐步补充案例和证明；
4. 基于询盘数据优化 CTA 与表单字段。

---

## 9. 上线前必须确认的信息

以下信息缺失时，可以先使用可编辑占位，但不能虚构后直接发布：

- 真实公司法定名称、地址、联系电话、工作邮箱；
- 实际服务覆盖的国家、港口、仓储地区和运输方式；
- 是否具备/合作提供报关、仓储、履约等服务；
- 询盘响应 SLA；
- 客户 Logo、证言、认证和可公开数据的使用授权；
- 隐私政策、Cookie 政策与表单联系同意文本；
- 每个国际站的域名、主语言、市场和本地联系人。

## 10. 不做事项

- 不把首页做成只有一个 Hero + 三张卡片；
- 不复制同行的布局、文案或图像；
- 不伪造“全球覆盖”“24/7”“最快”“最低价”、客户评价或量化指标；
- 不让图片或轮播掩盖服务说明与询价入口；
- 不把首页所有内容硬编码到 Go 模板，导致多站点/多语言无法维护；
- 不因为视觉效果加载影响首屏的重型视频、地图 SDK 或第三方脚本。
