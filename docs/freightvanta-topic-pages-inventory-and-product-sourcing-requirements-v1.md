# FreightVanta 专题页清单与第 1 个专题页开发文档

更新日期：2026-09-29  
当前整理范围：英文全球站  
第一个专题页：Product Sourcing / 产品采购与中国采购

## 1. 当前已经存在的专题页

### 1.1 服务专题页（6 个）

| 顺序 | 页面 | 当前路由 | 当前状态 | 核心搜索意图 |
| --- | --- | --- | --- | --- |
| 1 | Product Sourcing | `/product-sourcing` | 已上线 | product sourcing from China、China sourcing agent、source products from China |
| 2 | Bulk Procurement | `/services/bulk-procurement` | 已上线 | bulk procurement from China、bulk order from China、China bulk purchasing |
| 3 | Packaging and Branding | `/services/packaging-branding` | 已上线 | branded packaging from China、product inserts and labels、packout instruction |
| 4 | Inventory Storage | `/services/inventory-storage` | 已上线 | inventory storage for goods from China、inventory receiving and release |
| 5 | Private and White Label | `/services/private-white-label` | 已上线 | private label products from China、white label from China |
| 6 | Worldwide Fulfillment | `/services/worldwide-fulfillment` | 已上线 | fulfillment for China sourced products、international fulfillment planning |

### 1.2 行业方案专题页（4 个）

| 顺序 | 页面 | 当前路由 | 当前状态 | 核心搜索意图 |
| --- | --- | --- | --- | --- |
| 1 | Cross-border Ecommerce | `/industries/cross-border-ecommerce` | 已上线 | cross-border ecommerce logistics from China |
| 2 | Consumer Goods | `/industries/consumer-goods` | 已上线 | consumer goods logistics from China |
| 3 | Industrial Components | `/industries/industrial-components` | 已上线 | industrial components logistics from China |
| 4 | Time-critical Cargo | `/industries/time-critical-cargo` | 已上线 | time-critical cargo logistics from China |

### 1.3 当前缺少的页面

- `/services` 服务专题总目录页目前没有正式路由，访问返回 404。
- `/industries` 行业方案总目录页目前也没有独立列表页；行业入口主要来自首页和导航菜单。
- 后续应补充专题总目录，让搜索引擎和用户能够从总目录进入每个专题页。

## 2. 第一个专题页定位

页面名称：`Product Sourcing from China`  
中文理解：产品采购、中国采购、供应商询盘与采购交接方案  
页面类型：服务专题长页面  
页面路由：`/product-sourcing`

### 2.1 页面目标

这个页面不是简单介绍“可以帮客户找供应商”。它要完成四个任务：

1. 承接 `product sourcing from China`、`China sourcing agent`、`source products from China` 等搜索需求。
2. 解释客户只提供产品链接、图片或规格时，FreightVanta 如何把零散信息整理成可询价、可比较、可审批的采购简报。
3. 明确服务边界，不承诺未经确认的价格、质量、工厂资质、检测结果、合规结果和交期。
4. 把访问者引导到 `Request a sourcing plan`，同时带动包装、批量采购、库存和履约等后续专题页。

### 2.2 主要访问者

- 美国及国际市场的电商品牌、进口商和批发商。
- 已经找到中国商品或供应商，但信息尚不完整的采购团队。
- 希望比较多家中国供应商回复、样品和规格的企业。
- 需要把采购结果交给包装、仓储、货运或履约团队的项目负责人。

### 2.3 核心用户问题

- 我只有一个产品链接，可以开始吗？
- FreightVanta 能帮我从中国找产品或整理供应商吗？
- 如何让不同中国供应商的报价和回复可以比较？
- 样品、图片和供应商说法如何形成内部审批记录？
- 采购完成后，能不能继续连接包装、仓储、货运和履约？
- 哪些工作包含在采购协调里，哪些工作必须另外确认？

## 3. SEO 要求

### 3.1 页面标题

`Product Sourcing from China for Businesses | FreightVanta`

### 3.2 Meta description

`Coordinate product sourcing from China with a supplier-ready brief, comparable responses, sample checkpoints, and an approved handoff for your destination market.`

### 3.3 核心关键词

- product sourcing from China
- China sourcing agent
- source products from China
- supplier sourcing in China
- China product sourcing service

### 3.4 辅助语义词

- China supplier sourcing
- supplier-ready brief
- supplier comparison
- product sample coordination
- packaging requirements
- sourcing handoff
- purchasing approval
- China factory questions
- product specification comparison
- destination market requirements

### 3.5 搜索意图与关键词分组

#### 核心商业关键词

- `product sourcing from China`：全页主关键词，用于 Title、H1、Hero 首段和一次正文小结。
- `China product sourcing service`：用于服务定义、服务范围和最终 CTA 附近。
- `China sourcing agent`：用于解释用户搜索习惯，但正文不能把 FreightVanta 描述成未经确认的法定代理、采购代理或进口责任方。

#### 需求型辅助关键词

- `source products from China`
- `supplier sourcing in China`
- `China supplier sourcing`
- `find suppliers in China`
- `source a product from China`

#### 流程型关键词

- `supplier-ready brief`
- `China supplier comparison`
- `product sample coordination`
- `product specification comparison`
- `supplier question coordination`
- `China sourcing handoff`

#### 后续服务关键词

- `China sourcing and fulfillment`
- `packaging for products sourced from China`
- `bulk procurement from China`
- `inventory storage for imported products`
- `fulfillment for China sourced products`

#### 风险与决策型长尾词

- `can I source a product from China with only a product link`
- `how to compare suppliers in China`
- `how to prepare a China sourcing brief`
- `China product sourcing quality control`
- `China sourcing packaging and fulfillment`
- `what information does a China supplier need`

### 3.6 逐板块 SEO 关键词布局

| 页面位置 | 主关键词 | 辅助关键词与语义 | 实施要求 |
| --- | --- | --- | --- |
| URL | product sourcing | China sourcing | 保留简洁路由 `/product-sourcing`，不要频繁更换 URL。 |
| `<title>` | product sourcing from China | for businesses | 使用 `Product Sourcing from China for Businesses \| FreightVanta`；主关键词出现一次。 |
| Meta description | product sourcing from China | supplier-ready brief、comparable responses、sample checkpoints | 写成可读的页面摘要，不罗列关键词。 |
| Breadcrumb | Product Sourcing | Services | 内链使用真实 `<a href>`，帮助建立服务层级。 |
| H1 | product sourcing from China | business decision | 页面只能有一个 H1，且必须是最显著的页面标题。 |
| Hero 第 1 段 | sourcing from China | product link、reference image、specification、target quantity | 在首屏自然说明用户可以用什么信息开始。 |
| Hero 第 2 段 | supplier questions | evidence、commercial decisions、packaging expectations | 补充业务价值，不重复 H1 的完整短语。 |
| Capability strip | sourcing path | reference review、supplier questions、comparison、handoff | 使用短语标签，不在每个标签重复 China。 |
| Problem introduction | sourcing brief | supplier questions、packaging、commercial terms、delivery plan | 覆盖问题场景和信息分散的痛点。 |
| When this service fits | source products from China | supplier-ready brief、compare China suppliers | 三个场景分别覆盖产品参考、供应商比较、后续交接。 |
| Workflow | China sourcing process | supplier brief、supplier comparison、sample coordination | 5 个步骤分别承担不同语义，避免所有标题都重复主关键词。 |
| What to share | China sourcing requirements | product specification、MOQ、destination market、packaging | 用清单覆盖用户真正需要准备的资料。 |
| China sourcing focus | China supplier sourcing | China sourcing agent、supplier sourcing in China | 这是主关键词扩展板块，应解释服务，而不是堆叠同义词。 |
| Scope | China product sourcing service | quality control、factory audit、testing、certification | 同时覆盖服务能力和责任边界，提高商业可信度。 |
| Benefits | supplier comparison | cleaner handoff、fewer assumptions、connected brand inputs | 使用结果语义，但不使用未经证明的排名、价格或成功率承诺。 |
| FAQ | product sourcing questions | product link、supplier quality、fulfillment、regulated products | FAQ 问题采用接近搜索者自然提问的完整句子。 |
| Related services | packaging、bulk procurement、inventory、fulfillment | products sourced from China | 每个推荐使用描述性锚文本链接到真实专题页。 |
| Final CTA | sourcing plan | product、supplier、quantity、destination、timing | CTA 附近总结询盘需要提供的信息，不重复整段关键词。 |
| 图片文件名 | china-product-sourcing-review | supplier brief、sample review | 使用简洁、可描述内容的文件名，不连续堆叠关键词。 |
| 图片 Alt | product samples and sourcing brief | China sourcing review | Alt 描述图片实际内容及其与当前板块的关系。 |
| Service JSON-LD | Product Sourcing from China | FreightVanta、service description | 结构化数据内容必须与页面可见文案一致。 |
| FAQPage JSON-LD | 页面可见 FAQ | 相同问题与答案 | 不得在结构化数据中加入页面没有展示的 FAQ。 |

### 3.7 关键词在文案中的具体落点

#### 主关键词落点

`product sourcing from China` 建议出现于：

1. SEO Title：1 次。
2. H1：1 次。
3. Hero 首段：1 次。
4. 正文中部或中国采购专项板块：1 次自然变体。
5. 最终 CTA 上方：可使用 `China sourcing handoff` 等语义变体，不需要再次机械重复完整词组。

#### 辅助关键词落点

- `source products from China`：适用场景板块或中国采购专项板块。
- `China sourcing agent`：FAQ 或服务定义中自然说明用户可能寻找的支持类型，同时明确实际服务范围。
- `supplier sourcing in China`：中国采购专项板块。
- `China supplier comparison`：适用场景第二项和工作流程第三步。
- `product sample coordination`：工作流程第四步和服务范围。
- `China sourcing and fulfillment`：FAQ、相关服务和内部链接上下文。

#### 禁止做法

- 不设定机械的关键词密度百分比。
- 不在同一个标题中堆叠 `China sourcing agent / sourcing company / sourcing service / source from China`。
- 不隐藏关键词，不使用不可见文字或与页面无关的地区名称列表。
- 不把关键词列表直接放在页面正文底部。
- 不为了关键词把每个 H2 都改成相同句式。
- 不依赖 `<meta name="keywords">` 获取 Google 排名；该字段可以作为 CMS 内部关键词记录，但不能替代页面可见内容布局。

### 3.8 内部链接布局

| 来源位置 | 推荐锚文本 | 目标页面 |
| --- | --- | --- |
| Hero 或导航 | `Product Sourcing` | `/product-sourcing` |
| 工作流程后 | `packaging and branding for sourced products` | `/services/packaging-branding` |
| 适用场景或相关服务 | `bulk procurement from China` | `/services/bulk-procurement` |
| What to share 后 | `inventory storage for imported goods` | `/services/inventory-storage` |
| FAQ 或相关服务 | `fulfillment for China sourced products` | `/services/worldwide-fulfillment` |
| 行业上下文 | `cross-border ecommerce logistics from China` | `/industries/cross-border-ecommerce` |
| 指南区 | `how to prepare a China sourcing brief` | 对应指南文章或 `/guides` |

内链前后的正文需要说明为什么该专题与当前采购步骤有关，不要把多个关键词链接连续堆在同一行。

### 3.9 图片 SEO 布局

#### Hero 图片

建议文件名：`china-product-sourcing-review-freightvanta.webp`

Alt：

`Product samples, measurement tools, specifications, and packaging references prepared for a China sourcing review.`

#### Supplier brief 图片

建议文件名：`supplier-ready-china-sourcing-brief.webp`

Alt：

`A supplier-ready China sourcing brief with product dimensions, materials, target quantities, and packaging notes.`

#### Sample comparison 图片

建议文件名：`china-supplier-sample-comparison.webp`

Alt：

`Product samples and specification notes arranged for comparison between China supplier options.`

图片必须靠近与其内容相关的文字板块；Alt 以描述实际画面为主，而不是重复关键词列表。

### 3.10 SEO 技术要求

- 全页只能有一个 H1。
- 每个主要板块使用一个 H2；卡片标题使用 H3。
- 页面输出 canonical 和六站 `hreflang`。
- Hero 图片和内容图片必须有描述真实场景的英文 alt，不堆砌关键词。
- 页面需要 `Service`、`FAQPage`、`BreadcrumbList` JSON-LD。
- FAQ 文案必须与页面可见内容完全一致。
- 页面正文建议达到 1,300–1,700 个英文单词，导航与页脚不计入。
- `<title>`、H1、`og:title` 和页面主要视觉标题的主题需要保持一致，避免搜索引擎因标题不一致而重写标题。
- Meta description 必须为当前页面单独撰写，不能与其他五个服务专题共用。
- 所有专题链接使用带 `href` 的原生 `<a>` 标签，并采用能描述目标页面的自然锚文本。
- 页面主要内容应由服务端 HTML 直接输出，避免依赖 JavaScript 才能生成 Title、Meta、H1 或核心正文。

## 4. 页面板块顺序

| 序号 | 板块 | 主要作用 |
| --- | --- | --- |
| 01 | Breadcrumb + Hero | 明确页面主题、搜索关键词和主转化 |
| 02 | Capability strip | 用四个短标签说明采购工作的核心路径 |
| 03 | Problem introduction | 解释下单前的信息为什么影响后续操作 |
| 04 | When this service fits | 通过三个真实采购场景帮助客户判断是否适合 |
| 05 | Five-step workflow | 完整解释从产品参考到下一次交接的流程 |
| 06 | What to share | 告诉客户第一次沟通需要准备什么 |
| 07 | China sourcing focus | 强化“中国采购”关键词与业务解释 |
| 08 | Scope and confirmation | 明确可协调内容和需要额外确认的责任 |
| 09 | Operating benefits | 用流程价值说明为什么这种工作方式更可靠 |
| 10 | FAQ | 回答产品链接、供应商质量、履约连接等问题 |
| 11 | Related services | 把流量导向包装、批量采购、库存等专题 |
| 12 | Final enquiry | 收集产品、数量、供应商、目的地和时间信息 |

## 5. 完整页面文案

以下为英文全球站正式文案。开发时不应压缩段落，也不应只保留标题。

### 5.1 Breadcrumb

`Home / Services / Product Sourcing`

### 5.2 Hero

Eyebrow：

`PRODUCT SOURCING FROM CHINA`

H1：

> Product sourcing from China, organized for your next business decision.

Lead：

> Start with a product link, reference image, specification, or target quantity. FreightVanta helps structure sourcing from China into a supplier-ready brief: what the product needs to be, what a China supplier needs to confirm, which samples or comparison points matter, and how approved details move to the next operational handoff.

补充段落：

> The goal is not to rush into an order or hide uncertainty behind a quotation. It is to keep product requirements, supplier questions, evidence, commercial decisions, packaging expectations, and the next responsible owner connected in one practical working record.

Primary CTA：`Request a sourcing plan`  
Secondary CTA：`See the workflow`

Hero 路线标签：

1. `REFERENCE`
2. `BRIEF`
3. `COMPARE`
4. `HANDOFF`

Hero 说明：

> CLEARER INPUT — The goal is not to rush into an order. It is to create a brief your team can approve.

### 5.3 Capability strip

标题：`ONE PRACTICAL PRODUCT PATH`

- Reference review
- Supplier questions
- Comparable inputs
- Purchase handoff

### 5.4 Problem introduction

H2：

> The details before the order shape everything after it.

正文 1：

> Sourcing becomes difficult when the product reference, supplier questions, packaging expectations, commercial terms, and delivery plan live in different conversations. A clear brief gives every next owner the same starting point and makes missing information visible before it becomes an assumption.

正文 2：

> FreightVanta turns the early product conversation into a practical working document: what is known, what a supplier in China still needs to confirm, which evidence or sample your team should review, what requires specialist approval, and what should not move forward until the responsible buyer has approved it.

### 5.5 When product sourcing is the right starting point

H2：

> When product sourcing is the right starting point.

引导文案：

> Use sourcing coordination when the opportunity is clear, but the information required for a confident supplier conversation is still scattered, incomplete, or not yet comparable.

场景 01：

Label：`01 / REFERENCE`

H3：

> You have a product reference but not a supplier-ready brief.

正文：

> Bring a product link, photo, competitor reference, manufacturer page, marketplace listing, or rough specification. We identify the material, dimensions, finish, variants, target quantity, packaging, destination market, and decision questions still needed before a supplier can give a useful answer.

场景 02：

Label：`02 / OPTIONS`

H3：

> You need to compare China supplier options before committing.

正文：

> Use the service when supplier replies, quoted specifications, sample information, packaging suggestions, and commercial questions need to be arranged into one understandable comparison instead of living across disconnected chat messages and spreadsheets.

场景 03：

Label：`03 / HANDOFF`

H3：

> The next operation depends on stable product details.

正文：

> Start here when samples, packaging, inspection, bulk purchasing, freight, storage, or fulfillment cannot be planned responsibly until the product information is consistent and an approved direction is documented for the next owner.

### 5.6 Five-step sourcing workflow

H2：

> A sourcing workflow that keeps decisions visible.

引导文案：

> Each step creates a cleaner handoff for the next one. Confirmed facts, open questions, supplier statements, and approval ownership stay visible in the same working thread. The final purchasing decision remains with your team.

步骤 01：

H3：`Share the China sourcing reference.`

> Provide product links, reference images, drawings, known China supplier or factory details, specifications, expected quantity, destination market, target date, and the commercial outcome you are trying to achieve. Missing details are recorded as questions rather than guessed.

步骤 02：

H3：`Build the supplier-ready brief.`

> Product attributes, required variations, materials, dimensions, finishing, target packaging, labeling, destination-market context, timing, and decision criteria are organized into a request a supplier in China can answer consistently.

步骤 03：

H3：`Collect comparable supplier answers.`

> Supplier responses are grouped by the questions they actually answer. Product differences, price assumptions, minimum quantities, tooling questions, sample conditions, missing documents, and unresolved information remain visible while your team reviews the options.

步骤 04：

H3：`Review samples or evidence.`

> Photos, videos, physical samples, specification sheets, test information, and supplier statements become approval inputs. Your team decides what meets the brief. Inspection methods, acceptance standards, testing, and certification require a separately confirmed scope.

步骤 05：

H3：`Prepare the purchasing and operational handoff.`

> Once an option is approved, document the active product version, quantity, supplier context, packaging needs, origin information, known risks, and instructions for the next purchasing, packaging, freight, storage, or fulfillment owner.

### 5.7 What to share

Eyebrow：`WHAT TO SHARE`

H2：

> A useful China sourcing reference and an intended outcome are enough to begin.

正文：

> You do not need every answer in the first message. The purpose of the first conversation is to turn an early product opportunity into a brief that another responsible owner can understand and use.

清单：

- Product link, reference image, drawing, sample, or current specification.
- China supplier, manufacturer, factory, or marketplace link if one is already known.
- Target quantity, trial quantity, minimum-order concern, and expected reorder pattern.
- Destination market, intended sales channel, and customer-facing use.
- Material, finish, colour, dimensions, variations, and performance requirements.
- Packaging, branding, insert, label, bundle, and carton expectations.
- Target sample date, ready date, launch date, and non-negotiable constraints.
- Known compliance, testing, documentation, or product-safety questions.

### 5.8 China sourcing focus

Eyebrow：`SOURCE PRODUCTS FROM CHINA`

H2：

> Give China supplier sourcing one shared brief.

正文：

> A China sourcing conversation becomes more useful when the product reference, supplier questions, intended market, commercial context, evidence, and approval record stay connected. FreightVanta organizes those inputs so a supplier reply can be reviewed against the same requirement and the approved result can move into the next handoff without being rebuilt from memory.

边界说明：

> The service does not imply a guarantee of supplier performance, factory capability, product quality, price, compliance, certification, inspection outcome, or delivery date. These responsibilities must be confirmed in the approved scope and supported by the appropriate specialist or evidence.

四个要点：

1. **China supplier reference.** A product link, manufacturer page, marketplace listing, factory contact, or supplier record when available.
2. **Product and commercial context.** Materials, variants, target quantity, packaging, destination market, target cost context, and non-negotiable constraints.
3. **Comparable communication.** Questions, replies, sample evidence, quotations, assumptions, and open decisions kept in one working comparison.
4. **A planned China handoff.** Approved details prepared for the purchasing, packaging, freight, storage, or fulfillment scope your team confirms.

### 5.9 Scope and confirmation

H2：

> What the service coordinates, and what needs confirmation.

引导文案：

> Clear scope protects the decision. The page must separate information and handoffs that FreightVanta can organize from commercial, technical, legal, inspection, and compliance responsibilities that require a separately approved service scope.

#### We can coordinate

- Product brief preparation.
- China supplier question coordination.
- Variant and specification comparison.
- Sample request and evidence coordination.
- Packaging and branding requirement handoff.
- Quantity, destination, and intended-channel context.
- Purchase and payment-process clarification.
- Approved product record for the next service handoff.

#### Confirm before scope

- Supplier selection and commercial recommendation.
- Product price, minimum order, tooling, payment, and contract terms.
- Quality-control method and acceptance standard.
- Factory audit and supplier verification.
- Product testing, certification, and compliance responsibility.
- Customs classification and destination-market regulatory approval.
- Inspection location, timing, reporting format, and responsible party.
- Insurance, warranty, intellectual-property, and legal responsibility.

### 5.10 Operating benefits

H2：

> A clearer structure helps the rest of the operation move with less friction.

说明：

> These are operating advantages, not outcome guarantees. The value comes from recording decisions, preserving evidence, and keeping the next responsible person connected to the same approved product brief.

优势 01：

Label：`OPEN QUESTIONS`

H3：`Fewer assumptions move forward.`

> An unanswered product, supplier, packaging, quantity, market, or timing question can be assigned before it becomes a surprise in production, payment, packing, or dispatch.

优势 02：

Label：`LIKE-FOR-LIKE REVIEW`

H3：`Supplier answers become comparable.`

> The review follows the same product and service questions instead of whichever reply happened to arrive first. Differences, exclusions, and missing information remain visible.

优势 03：

Label：`CLEANER HANDOFFS`

H3：`The next owner starts with context.`

> Packaging, procurement, freight, storage, and fulfillment instructions can reference the approved brief rather than rebuilding the product decision from scattered messages.

优势 04：

Label：`CONNECTED BRAND INPUTS`

H3：`Brand decisions stay attached to the product.`

> Packaging, labeling, inserts, variations, and customer-facing requirements can be documented before they reach production, consolidation, or dispatch.

### 5.11 FAQ

H2：

> Common questions before a China sourcing conversation.

FAQ 1：

**Can we start with only a product link?**

> Yes. A product link, image, marketplace listing, manufacturer page, or short description is enough to open the first conversation. FreightVanta will identify the missing product, quantity, packaging, destination, timing, and approval information needed to turn it into a usable supplier brief.

FAQ 2：

**Can you help us source products from China?**

> FreightVanta can structure the product brief, organize supplier questions, keep China supplier responses comparable, coordinate sample or evidence requests, and prepare the approved information for the next handoff. The exact supplier-search, purchasing, inspection, and payment scope must be confirmed before work begins.

FAQ 3：

**Do you guarantee the supplier or product quality?**

> No. A sourcing conversation does not guarantee the supplier, factory, product quality, quoted price, compliance result, certification, or delivery date. Quality control, factory audits, product testing, acceptance criteria, and specialist responsibilities require a separately approved scope.

FAQ 4：

**Can sourcing connect to packaging, freight, storage, and fulfillment?**

> Yes. Once the active product version, quantity, supplier context, packaging requirements, origin, destination, and intended channel are approved, the information can be prepared for packaging, bulk procurement, freight, inventory storage, or worldwide fulfillment planning.

FAQ 5：

**What happens after our team selects an option?**

> The selected product details, approved variations, quantity, packaging rules, known supplier assumptions, and receiving instructions are recorded for the next responsible owner. The actual purchasing and operational steps follow the service plan your team approves.

FAQ 6：

**Can you help with regulated or compliance-sensitive products?**

> The product and document questions can be organized, but legal classification, certification, testing, labeling, product-safety, importer, and destination-market obligations require qualified confirmation. The page must not imply regulatory approval without supporting evidence.

### 5.12 Related services

H2：

> Continue with the handoff you need next.

1. **Packaging and Branding**  
   Coordinate approved packaging, inserts, labels, brand files, and packout instructions before goods move.

2. **Bulk Procurement**  
   Prepare a larger purchase with clearer quantities, supplier questions, payment decisions, production context, and inventory intent.

3. **Inventory Storage**  
   Receive, identify, count, hold, combine, and release goods according to an approved instruction.

4. **Worldwide Fulfillment**  
   Carry the approved product and packout information into customer-order preparation and the next shipping handoff.

### 5.13 Final enquiry

Eyebrow：`START THE CONVERSATION`

H2：

> Begin with the product, the China sourcing handoff, and the outcome you need.

正文：

> Share the product link or reference, target quantity, known China supplier or factory if available, destination market, sales channel, packaging needs, target timing, and the point where your current process needs support. FreightVanta will begin with the practical questions required to define the scope.

CTA：`Request a sourcing plan`

表单字段建议：

- Name
- Work email
- Company
- Product link or reference
- Target quantity
- Known supplier or factory
- Destination country
- Intended sales channel
- Packaging or branding requirement
- Target date
- What is currently unclear?

## 6. 图片与视觉内容要求

### 6.1 Hero 图片

建议场景：采购工作台，包含无品牌产品样品、卡尺、规格表、包装参考和电脑，不使用无法验证的工厂招牌或客户品牌。

Alt：

`Product samples, measurement tools, specification sheets, and packaging references prepared for a China sourcing review.`

### 6.2 What to share 图片

建议场景：产品链接、尺寸图、材料样本、颜色参考、包装草图和数量说明组成的采购简报。

Alt：

`A supplier-ready sourcing brief with product references, measurements, materials, packaging notes, and target quantities.`

### 6.3 图片使用规则

- 图片不能写入虚构价格、供应商名称、认证标志、检测结果或交付时效。
- 图片中的包装和产品尽量保持无品牌，避免知识产权风险。
- 图片覆盖层文字必须由 HTML 输出，不要把大量文案烤进图片。
- 桌面端 Hero 图片建议 16:10 或 4:3；移动端使用安全裁切，不隐藏主体产品和工作台。
- 所有图片使用 WebP/JPEG 优化版本，并保留高分辨率源文件。

## 7. 开发与验收要求

### 7.1 页面组件

- 使用英文首页的导航、品牌、深海军蓝、信号蓝和橙色 CTA 体系。
- 专题页允许拥有更高的信息密度，但字体、按钮、容器宽度、导航和页脚必须与英文首页统一。
- 适用场景使用三条编辑式内容行，不使用三个完全相同的图标卡片。
- 工作流程使用真实编号序列，桌面端横向或分段布局，移动端垂直时间线。
- “可协调 / 需确认”必须明显分栏，不能混成普通卖点。
- FAQ 使用原生 `details/summary`，支持键盘操作。
- 相关服务必须链接到真实专题路由，不能全部链接回首页。

### 7.2 响应式要求

- 1440px、1024px、768px、390px 四个宽度进行验收。
- 不允许出现横向滚动。
- 移动端 H1 不超过约 4–6 行，按钮宽度适合拇指操作。
- 工作流程、范围、FAQ 和相关服务在移动端保持完整文案，不隐藏段落。
- 图片使用 `object-fit: cover`，但不得把产品样品、规格文件等主体裁掉。

### 7.3 功能要求

- Hero 主按钮跳转到询盘板块。
- Secondary CTA 跳转到工作流程。
- 相关服务链接到对应真实路由。
- 询盘不得显示假成功提示；未接入后台前使用明确的邮件联系方式。
- 页面锚点：`#situations`、`#workflow`、`#brief`、`#china-sourcing`、`#scope`、`#benefits`、`#faq`、`#enquiry`。

### 7.4 文案验收

- 不删除本文件的核心解释段落。
- 不把“中国采购”只写在 SEO 标签里，正文 Hero、流程、中国采购板块和 FAQ 都必须自然出现。
- 不使用 `best`、`cheapest`、`guaranteed`、`fastest`、`fully compliant` 等没有证据的绝对承诺。
- 不声称拥有具体工厂、仓库、检测机构、认证或国家覆盖，除非后台已有已核准证据。
- 页面要同时回答“能做什么”“客户要提供什么”“哪些内容需要确认”“下一步是什么”。

## 8. 后续整理顺序

完成 Product Sourcing 后，建议按用户决策路径继续整理：

1. Bulk Procurement
2. Packaging and Branding
3. Inventory Storage
4. Private and White Label
5. Worldwide Fulfillment
6. Cross-border Ecommerce
7. Consumer Goods
8. Industrial Components
9. Time-critical Cargo

这样可以先完成完整的服务链，再整理按行业组织的组合方案。
