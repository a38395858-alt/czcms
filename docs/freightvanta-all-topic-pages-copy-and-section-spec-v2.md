# FreightVanta 全专题页文案与板块开发文档 v2

> 适用站点：FreightVanta 英语全球站（后续用于德语、法语、西班牙语、意大利语、荷兰语本地化）  
> 文档用途：给前端、CMS、SEO 编辑和多语言内容团队使用  
> 内容原则：保留完整信息，不把页面压缩成只有 Hero、三张卡片和一个按钮的短落地页。

---

## 0. 文档目标与统一编辑规则

本文件把目前已经规划的 10 个专题页合并为一个内容和开发基准：

- 服务型专题页 6 个：Product Sourcing、Bulk Procurement、Packaging & Branding、Inventory Storage、Private Label & White Label、Worldwide Fulfillment。
- 行业解决方案页 4 个：Cross-border Ecommerce、Consumer Goods、Industrial Components、Time-critical Cargo。

这些页面需要共同表达一条清晰的业务链：从中国采购或已有产品参考开始，经过供应商沟通、样品和规格确认、批量采购、包装与品牌、库存接收，再进入货运交接和全球履约。每一页只负责其中一个主要决策，但要通过上下文内链把前后环节串起来。

### 0.1 客户可见的写作口径

- 解释“如何组织信息、问题、审批和交接”，不要把未确认的能力写成保证。
- 不凭空加入价格、最低起订量、仓库地址、运输时效、节省比例、客户数量、认证、承运商、国家覆盖或成功率。
- “可以协调”“可纳入确认范围”“需要根据产品、目的地和已确认服务范围评估”是安全的表达。
- 质量检测、工厂审核、合规、认证、报关、保险、退货、平台 API、特殊处理、清关和最终交付，只有运营书面确认后才可改为确定性承诺。
- 页面 copy 使用英文；本文件中的中文是编辑和开发说明。翻译时不能逐句机器翻译，必须由目标语言编辑核对搜索习惯、术语和语气。

### 0.2 每页统一信息层级

1. Header / Breadcrumb / 页面主题标签
2. Hero：一个 H1、说明段、主 CTA、次 CTA、3–5 个流程标签
3. Decision framing：说明访客当前要解决的业务决定
4. When this fits：3–4 个典型场景
5. Workflow：5–7 个有实际交接意义的步骤
6. Scope / controls：已能组织的内容与必须确认的内容
7. What to prepare：用户提交资料清单
8. Operating model / deliverables：访问者会得到什么可使用的工作结果
9. FAQ：至少 6 个与搜索意图和责任边界相关的问题
10. Related services：2–4 个上下文内链
11. Final enquiry band：带上下文的表单 CTA
12. Footer、法律页、隐私和语言切换

---

## 1. 专题页总目录、路由和搜索意图

| 类型 | 页面 | 路由 | 主搜索意图 | 主关键词（英文） |
| --- | --- | --- | --- | --- |
| 服务 | Product Sourcing | `/product-sourcing` | 从中国寻找/整理产品和供应商 | `product sourcing from China` |
| 服务 | Bulk Procurement | `/services/bulk-procurement` | 规划较大批量采购和库存去向 | `bulk procurement from China` |
| 服务 | Packaging & Branding | `/services/packaging-branding` | 让产品、包装、标签和品牌物料能落地执行 | `custom packaging for products from China` |
| 服务 | Inventory Storage | `/services/inventory-storage` | 进口货物接收、识别、存储和释放 | `inventory storage for goods from China` |
| 服务 | Private Label & White Label | `/services/private-white-label` | 管理私牌/白牌产品版本和品牌交接 | `private label products from China` |
| 服务 | Worldwide Fulfillment | `/services/worldwide-fulfillment` | 把可售库存转成面向客户的订单 | `fulfillment for China-sourced products` |
| 行业 | Cross-border Ecommerce | `/industries/cross-border-ecommerce` | 电商商品从中国采购到客户订单的链路 | `cross-border ecommerce logistics from China` |
| 行业 | Consumer Goods | `/industries/consumer-goods` | 消费品的产品、包装、入库和渠道释放 | `consumer goods logistics from China` |
| 行业 | Industrial Components | `/industries/industrial-components` | 规格型工业零件的采购、保护和接收 | `industrial components logistics from China` |
| 行业 | Time-critical Cargo | `/industries/time-critical-cargo` | 紧急补货、替换件和项目货物的决策链路 | `time-critical cargo logistics from China` |

### 1.1 页面之间的内链关系

- Product Sourcing → Packaging & Branding、Bulk Procurement、Inventory Storage、Worldwide Fulfillment、Cross-border Ecommerce。
- Bulk Procurement → Product Sourcing、Inventory Storage、Packaging & Branding、Worldwide Fulfillment。
- Packaging & Branding → Private Label & White Label、Inventory Storage、Worldwide Fulfillment。
- Inventory Storage → Bulk Procurement、Packaging & Branding、Worldwide Fulfillment。
- Private Label & White Label → Product Sourcing、Packaging & Branding、Worldwide Fulfillment。
- Worldwide Fulfillment → Inventory Storage、Packaging & Branding、Product Sourcing。
- 行业页均可链接到 Product Sourcing、Bulk Procurement、Inventory Storage 和 Worldwide Fulfillment，但锚文本必须解释上下文，而不是堆关键词。

---

## 2. 统一页面模板、SEO 和 CMS 规则

### 2.1 统一 Hero 结构

```text
eyebrow       主题标签（全大写，长度不超过 32 个字符）
H1            只出现一个，直接回答页面的主要决策
lead          2–4 句，说明适用对象、工作结果和边界
primary CTA   Request a [specific] plan
secondary CTA See the [workflow / process]
rail          3–5 个简短阶段标签
```

Hero 首屏不要放无法证明的数字、地图轨迹、全球覆盖、实时 tracking 或“guaranteed / seamless / cheapest”等词。图片要支持文字，不要让图片成为唯一的信息来源。

### 2.2 SEO 元数据规则

- 每页唯一 `<title>`、`meta description`、canonical、BreadcrumbList 和 WebPage JSON-LD。
- 只有页面可见且完整显示的 FAQ 才能进入 FAQPage JSON-LD。
- 只有真实提供并在页面展示的服务才使用 Service JSON-LD。
- 每个页面只保留一个 H1；模块用 H2，卡片和 FAQ 用 H3。
- 主关键词放在 title、H1/首段、一个决策型 H2、一个流程段、一个 FAQ 和 CTA 附近；不要机械重复。
- `meta keywords` 只作为 CMS 编辑字段保存，不作为搜索排名方案。
- 六个语言站准备好同路径的 `hreflang` 后再输出；未完成本地化前不输出不存在的语言 URL。

### 2.3 统一询盘表单字段

首屏按钮和页面底部按钮都打开同一个有上下文的表单。必填字段：

- Name
- Work email
- Company / brand
- Country or destination market
- Product or service needed
- Product link, reference image, drawing, or existing SKU（可上传）
- Quantity / order profile / expected frequency
- Target timing or business milestone
- Message: current problem, known supplier, packaging, inventory or fulfillment requirement
- Consent checkbox（链接 Privacy Policy）

根据页面动态增加字段：

| 页面 | 追加字段 |
| --- | --- |
| Product Sourcing | known China supplier、material、variant、sample need、target market |
| Bulk Procurement | quantity range、reorder pattern、stock purpose、planned release |
| Packaging & Branding | artwork status、packaging components、insert/label language、active version |
| Inventory Storage | inbound cartons、SKU/identifier、receiving evidence、release destination |
| Private Label | product version、brand assets、approval owner、effective date |
| Worldwide Fulfillment | order source、SKU list、destination markets、bundle rule、exception type |
| 行业页 | industry context、business consequence、receiving owner、route concern |

### 2.4 图片和动效规则

- 图片使用真实的操作场景、未印刷品牌的箱件、样品、包装、扫描或接收动作；不使用竞品图片和虚假的客户 logo。
- 图片文件名使用可读的英文短语，例如 `china-product-sourcing-review.webp`。
- Alt 描述真实画面，不把关键词列表塞入 alt。
- Three.js / GSAP 仅用于非常轻的路线线条、层次位移和一次性入场；`prefers-reduced-motion: reduce` 时全部降级为静态。
- 所有文字即使 JavaScript 关闭也必须可见；不要把核心文案藏进 canvas、视频或动画。

---

# A 类：服务型专题页

## 3. Product Sourcing from China（产品采购 / 从中国采购）

### 3.1 页面定位

面向美国和国际市场的电商品牌、进口商、批发商、采购团队和项目负责人。用户可能只有产品链接、图片、竞争对手样品、规格或一个中国供应商线索，需要把零散信息变成可询问、可比较、可审批、可交接的采购简报。

本页要明确：FreightVanta 帮助组织 China sourcing 的信息和交接，不自动承诺供应商、价格、质量、合规、检测、认证、工厂审核或交付结果；这些内容进入单独确认的服务范围。

### 3.2 SEO 包

- **Title：** `Product Sourcing from China for Businesses | FreightVanta`
- **Meta description：** `Coordinate product sourcing from China with a supplier-ready brief, comparable responses, sample checkpoints, and an approved handoff for your destination market.`
- **Primary keyword：** `product sourcing from China`
- **Secondary keywords：** `China sourcing agent`、`source products from China`、`supplier sourcing in China`、`China product sourcing service`、`China supplier comparison`、`product sample coordination`
- **Long-tail：** `can I source a product from China with only a product link`、`how to compare suppliers in China`、`how to prepare a China sourcing brief`、`China sourcing packaging and fulfillment`

### 3.3 完整页面顺序和文案

#### 模块 1：Hero

- **Eyebrow：** `PRODUCT SOURCING FROM CHINA`
- **H1：** `Product sourcing from China, organized for your next business decision.`
- **Lead：**

  > Start with a product link, reference image, specification, or target quantity. FreightVanta helps structure sourcing from China into a supplier-ready brief: what the product needs to be, what a China supplier needs to confirm, which samples or comparison points matter, and how approved details move to the next operational handoff. You keep the purchasing decision; we help make the questions, evidence, and next owner visible.

- **Primary CTA：** `Request a sourcing plan`
- **Secondary CTA：** `See the sourcing workflow`
- **Rail labels：**
  - `01 / CHINA REFERENCE — Start with the product you can identify`
  - `02 / BRIEF — Turn the reference into supplier questions`
  - `03 / COMPARE — Keep responses in the same frame`
  - `04 / REVIEW — Connect samples, specifications, and open decisions`
  - `05 / HANDOFF — Carry approved details to the next operation`

#### 模块 2：Decision framing

- **Eyebrow：** `THE SOURCING DECISION`
- **H2：** `A product link is a starting point. A usable sourcing brief is the next decision.`
- **正文：**

  > A marketplace link or supplier message rarely contains everything a business needs to approve a purchase. Material, dimensions, finish, variants, target quantity, packaging, destination market, sample requirements, and unresolved questions can be scattered across images and conversations. A structured China sourcing brief keeps those details together, so each supplier is asked comparable questions and the next team does not have to rebuild the product context.

  > The goal is not to make an uncertain supplier, price, quality, or compliance outcome sound certain. The goal is to make the decision easier to inspect: what is known, what still needs an answer, what evidence is available, who approves it, and where the approved product goes next.

#### 模块 3：When this service fits

- **H2：** `Source products from China when the opportunity is clear but the next approval is not.`
- **Intro：** `Use the service when a product direction exists and the business needs a cleaner path from first reference to an approved operational handoff.`

| 场景卡标题 | 卡片文案 |
| --- | --- |
| `YOU HAVE A CHINA REFERENCE` | `A product link, factory page, image, competitor sample, drawing, or early specification can be turned into concrete questions about material, size, finish, variants, quantity, packaging, and destination.` |
| `YOU NEED A COMPARABLE SUPPLIER CONVERSATION` | `Responses from China suppliers are read against the same question set, so differences, missing information, sample requirements, and open commercial decisions remain visible to the buyer.` |
| `YOU ARE MOVING TOWARD A PURCHASE` | `When the product, quantity, packaging, destination, and approval owner are clearer, the team can decide what is ready for a purchase or what must remain open.` |
| `THE NEXT TEAM NEEDS CONTEXT` | `Sampling, packaging, inspection, storage, freight, and fulfillment are easier to plan when the approved product state is recorded instead of being reconstructed from separate messages.` |

#### 模块 4：What can start the conversation

- **H2：** `You do not need every answer before the first China supplier conversation.`
- **正文：**

  > A useful first brief can begin with incomplete information. Share what is known and identify what is not. A product link, image, drawing, existing sample, target quantity, destination market, or known supplier is enough to define the first set of questions. Unknown information is kept as an open item; it is never silently filled in with an assumption.

- **Checklist：**
  - Product link, image, drawing, existing sample or competitor reference。
  - Product name, intended use, materials, finish, dimensions, variants and non-negotiable attributes。
  - Target quantity, expected reorder pattern and whether the quantity is fixed or exploratory。
  - Known China supplier, factory, marketplace or manufacturer contact, if available。
  - Destination market, sales channel and any customer-facing packaging expectation。
  - Target ready period, launch/replenishment context and known constraints。
  - The next handoff: sampling, purchasing approval, packaging, storage, freight or fulfillment。

#### 模块 5：Seven-step China sourcing workflow

- **H2：** `Move a China sourcing decision forward without losing its context.`
- **Intro：** `Each stage separates confirmed information, open questions, evidence and ownership. Purchasing approval remains with your team.`

1. **Share the China sourcing reference** — Bring together product links, supplier or factory details where available, images, specifications, quantity, destination, and the result you need.
2. **Build the supplier-ready brief** — Turn attributes, variants, packaging, target market, timing, and decision criteria into a clear request for a supplier in China.
3. **Create a comparable question set** — Ask each China supplier for the same core information, while recording supplier-specific questions separately so the comparison remains readable.
4. **Review responses and missing evidence** — Connect every response to the question it answers. Mark unknowns, conflicting details, and items that need a sample, photo, video, drawing, or written confirmation.
5. **Coordinate samples and specification review** — Organize sample checkpoints, measurements, finish, variant, packout, and approval notes. Sampling or inspection standards are published only when separately confirmed.
6. **Prepare purchasing approval** — Record the selected or shortlisted product state, quantity assumptions, packaging requirement, destination context, open risk and approval owner. This is a decision record, not a price or quality guarantee.
7. **Prepare the next operational handoff** — Carry approved product details, quantities, packaging, origin information, and owner instructions into confirmed bulk procurement, packaging, storage, freight or fulfillment work.

#### 模块 6：Supplier sourcing from China

- **H2：** `Give China supplier sourcing one shared brief instead of several disconnected conversations.`
- **正文：**

  > A sourcing conversation becomes more useful when the product reference, supplier questions, intended market, sample evidence, and approval record stay connected. This is the practical meaning behind searches such as “China sourcing agent” or “supplier sourcing in China”: a business needs a reliable way to move from a reference to a decision, not a list of vague supplier promises.

  > The brief can show which supplier information is comparable, which commercial term still needs negotiation, which product attribute is not yet evidenced, and which downstream team needs to be involved. The page must not describe FreightVanta as the legal importer, a factory auditor, or a guaranteed quality authority unless the confirmed scope says so.

- **Four supporting points：**
  - `China supplier reference` — link, factory page, marketplace listing, contact, image or sample。
  - `Product and commercial context` — materials, variants, target quantity, packaging, market and constraints。
  - `Comparable communication` — same questions, replies, sample evidence and open decisions。
  - `Planned handoff` — approved details ready for purchasing, packaging, storage, freight or fulfillment。

#### 模块 7：Supplier comparison and commercial clarity

- **H2：** `Compare what each supplier answered, not just the number on a quotation.`
- **正文：**

  > A useful comparison keeps product version, quantity basis, packaging assumption, sample status, commercial term and unresolved question in the same view. That helps a buyer see whether two responses are genuinely comparable or whether a lower-looking figure is based on a different product, quantity, packout or delivery assumption.

- **Comparison rows：**
  - Product reference and active revision。
  - Material, dimensions, finish, color and variant details。
  - Quantity basis, carton/unit packing and expected reorder context。
  - Sample, image, drawing or written evidence available。
  - Packaging, labels, inserts and supplier-material treatment。
  - Destination-market question and next handoff。
  - Open decision, responsible owner and approval status。

#### 模块 8：Samples, quality checkpoints and boundaries

- **H2：** `Use samples and evidence to make the next question specific.`
- **正文：**

  > Samples, photos, videos, measurements and supplier statements can support an internal review, but they only answer the questions they actually evidence. A sample does not by itself guarantee a production run, regulatory result or future batch. The sourcing record should show what was reviewed, what was accepted, what remains open and whether a separate inspection or testing scope is required.

- **Checkpoint cards：**
  - `SPECIFICATION` — Compare the approved attributes, dimensions, materials, finish and variants.
  - `EVIDENCE` — Link photos, videos, sample notes, drawings or supplier statements to the relevant question.
  - `APPROVAL` — Record who accepted the product state and which assumptions remain open.
  - `CHANGE CONTROL` — Give a revised product, component, packaging or supplier response a new review point.

#### 模块 9：Scope and confirmation boundaries

- **H2：** `What the sourcing brief can organize, and what must be confirmed first.`

| 主题 | 页面可承诺的表达 | 需要另行确认 |
| --- | --- | --- |
| Product brief | Organize product reference, specification, variants, quantity and open questions. | — |
| Supplier questions | Coordinate comparable questions and record responses from known or identified suppliers. | — |
| Sample coordination | Organize sample requests and review notes where the scope includes them. | Sample fees, testing standard and acceptance criteria. |
| Quality work | Carry agreed evidence and checkpoints into the record. | Inspection, factory audit, testing and quality guarantee. |
| Commercial result | Make assumptions and terms easier to compare. | Final price, discount, MOQ, payment, contract and savings. |
| Compliance | Identify market or product questions that need review. | Certification, legal labeling, customs, product safety and regulatory advice. |
| Handoff | Prepare approved information for confirmed packaging, storage, freight or fulfillment. | Warehouse, carrier, delivery time and coverage. |

#### 模块 10：What the buyer receives

- **H2：** `The deliverable is a decision-ready sourcing record.`
- **正文：**

  > The useful result is not a long list of unfiltered supplier links. It is a working record another person can understand and use: the product reference, the current brief, supplier questions and replies, sample or evidence notes, unresolved issues, approval owner, packaging context, quantity assumptions and the next confirmed handoff.

- **Deliverables list：**
  - Supplier-ready product brief。
  - Comparable question and response matrix。
  - Sample/evidence review notes（若包含在已确认范围内）。
  - Open-question and decision log。
  - Approved product/variant/packaging snapshot。
  - Handoff notes for bulk procurement, packaging, storage, freight or fulfillment。

#### 模块 11：FAQ

- **H2：** `Product sourcing from China: questions worth answering early.`

1. **Can you help us source products from China if we only have a link?** — `Yes. A link, image or short description can open the first conversation. Missing product, supplier, packaging and destination information is captured as an open question rather than assumed.`
2. **Do you act as a China sourcing agent?** — `The page describes sourcing coordination, question management, comparison and handoff. Any agency, purchasing authority, importer-of-record or legal representation must be defined in a separate confirmed scope.`
3. **Can you compare several China suppliers?** — `Yes, when supplier references or responses are available. They are compared against a shared question set, with differences and missing evidence kept visible.`
4. **Is the supplier, price or quality guaranteed?** — `No. Supplier selection, price, quality control, factory audit, testing, compliance and acceptance criteria require explicit confirmation.`
5. **Can you arrange samples or inspection?** — `Sample coordination and inspection can be discussed as separate scope items. The page must not imply a test method, pass result or inspection guarantee before it is agreed.`
6. **Can sourcing continue into packaging, storage and fulfillment?** — `Yes. Once product, quantity, packaging, origin and destination details are approved, the record can be handed to confirmed downstream services.`
7. **Can you source private-label products from China?** — `The product and brand program can be discussed, but artwork, trademark, IP, legal labels, product claims and manufacturing responsibilities require their own review and approval.`
8. **What should we send first?** — `Send the product reference, target quantity, market, timing, known supplier and the decision that is currently blocked. The first response will focus on the questions needed to define scope.`

#### 模块 12：Final CTA and related links

- **H2：** `Begin with the product, the China sourcing handoff, and the outcome you need.`
- **正文：** `Share the product, quantity, China supplier reference if known, destination, timing, packaging expectation and the point where your process needs support. FreightVanta will begin with the practical questions that define the scope.`
- **Primary CTA：** `Request a sourcing plan`
- **Related links：** `Bulk procurement from China`、`Packaging and branding for sourced products`、`Inventory storage for imported goods`、`Fulfillment for China-sourced products`。

### 3.4 Product Sourcing 图片和前端字段

- Hero asset：`china-product-sourcing-review-freightvanta.webp`，alt：`Product samples, measurement tools, specifications, and packaging references prepared for a China sourcing review.`
- Brief asset：`supplier-ready-china-sourcing-brief.webp`，alt：`A supplier-ready China sourcing brief with product dimensions, materials, target quantities, and packaging notes.`
- Comparison asset：`china-supplier-sample-comparison.webp`，alt：`Product samples and specification notes arranged for comparison between China supplier options.`
- CMS repeaters：`hero`、`situations[]`、`workflow[]`、`comparisonRows[]`、`scopeRows[]`、`deliverables[]`、`faq[]`、`relatedServices[]`。

---

## 4. Bulk Procurement（批量采购）

### 4.1 SEO 包

- **Title：** `Bulk Procurement From China: Plan the Next Purchase | FreightVanta`
- **Meta description：** `Prepare a bulk purchase from China with clearer quantities, supplier questions, inventory decisions, packaging requirements, and receiving instructions.`
- **Primary keyword：** `bulk procurement from China`
- **Supporting：** `bulk order from China`、`China bulk purchasing`、`bulk procurement planning`、`staged inventory release`

### 4.2 Hero 和页面定位

- **Eyebrow：** `BULK PROCUREMENT FROM CHINA`
- **H1：** `Plan a bulk purchase from China before quantity creates expensive loose ends.`
- **Lead：** `A larger purchase is not simply a smaller order with more units. It can change the production questions, packaging requirement, payment discussion, receiving method, inventory purpose and release plan. FreightVanta helps turn those connected decisions into one working procurement brief before a bulk purchase from China moves to the next stage. Your team remains responsible for supplier selection, commercial terms and final approval.`
- **CTA：** `Request a bulk procurement plan` / `See the planning steps`

### 4.3 页面板块与完整文案

1. **Decision framing — `A bulk order needs a destination plan, not only a confirmed quantity.`**  
   `Before a supplier starts the next production run, the buyer should be able to answer which product version is approved, whether the quantity is for one shipment or staged replenishment, which packaging and labels travel with the goods, how stock will be identified, and who approves a change. The page organizes those questions; it does not promise a price, production date, inspection outcome or shipping result.`

2. **When this fits — `Use bulk procurement planning when the next purchase affects more than one handoff.`**
   - `TEST ORDER TO PLANNED BUY` — A larger buy introduces product version, unit packing, carton markings, stock location and release decisions that small orders may have hidden.
   - `LAUNCH, REPLENISHMENT OR RETAIL WINDOW` — A target date needs owners for product, quantity, packaging, inbound instruction and destination; it is not by itself a delivery guarantee.
   - `ONE PURCHASE, SEVERAL DESTINATIONS` — Record whether stock is for storage, freight release, retailer delivery or customer fulfillment so the next team does not rebuild the context.

3. **Six-step workflow — `Keep the larger decision connected.`**
   - Confirm purchasing objective and approved product reference。
   - Create a supplier question set for product, packing, cartons and delivery terms。
   - Set approval owners for evidence, artwork, commercial milestones and release instructions。
   - Plan inventory handoff: identifier, count, carton/pallet information and receiving destination。
   - Prepare packaging and release instructions for labels, inserts, bundles and supplier-material removal。
   - Coordinate the confirmed next movement into storage, freight, retail delivery or fulfillment。

4. **Scope controls — `What the bulk procurement plan can organize.`**
   - Included coordination：product/quantity brief、supplier questions、inventory readiness、packaging handoff、release ownership。
   - Confirm first：price negotiation or savings、contracts/payment/trade finance、factory audit、inspection/testing、certification、capacity、shipping rate and timing。

5. **Preparation — `Bring the purchase context, not just the quantity.`**  
   `Product link or approved sample; target quantity and reorder pattern; known supplier; target market and destination; product variation, material, finish, dimensions and packaging; desired ready period; next handoff.`

6. **Operating model — `A larger purchase remains easier to explain after it is approved.`**  
   Four editorial blocks：`One brief travels with the decision`、`Approval points are visible before they become delays`、`Inventory has a named purpose`、`Change has a place to go`。

7. **FAQ**
   - `Does FreightVanta guarantee lower pricing for a bulk order from China?` — No savings or discount is promised without a written commercial scope.
   - `Can a bulk purchase be released in stages?` — It can be planned when receiving, storage, packaging, freight and approval instructions are confirmed.
   - `Can we start from an existing supplier?` — Yes, if product version, quantity, packaging, destination and approval path are provided.
   - `Does bulk procurement include quality inspection?` — Not automatically; acceptance standards, audit, testing and compliance require confirmation.
   - `Can bulk procurement connect to fulfillment?` — Yes, once stock identification, packaging and order-preparation rules are stable.
   - `What happens when quantity is still under review?` — Keep a range and the decision owner visible rather than presenting an unapproved figure as final.

8. **CTA**
   - **H2：** `Start with the product, the planned quantity, and the next place the goods need to go.`
   - **正文：** `Share the product reference, quantity, known supplier, intended market, target ready period, packaging requirement and planned storage, freight, retail or fulfillment handoff.`

### 4.4 内链、图片和 CMS

- 内链：Product Sourcing、Inventory Storage、Worldwide Fulfillment。
- Hero image：整齐的批量箱件、产品标签和采购简报，避免价格表和虚假仓库数据。
- Repeaters：`situations[]`、`workflow[]`、`scopeRows[]`、`prepChecklist[]`、`faq[]`。

---

## 5. Packaging & Branding（包装与品牌）

### 5.1 SEO 包

- **Title：** `Packaging and Branding for Products From China | FreightVanta`
- **Meta description：** `Turn approved packaging, labels, inserts, and brand materials for products from China into a practical packout and fulfillment instruction.`
- **Primary keyword：** `custom packaging for products from China`
- **Supporting：** `packaging and branding fulfillment`、`product inserts and labels`、`packout instruction`、`branded packaging from China`

### 5.2 Hero 文案

- **Eyebrow：** `PACKAGING AND BRANDING`
- **H1：** `Make products from China arrive in packaging that carries your brand forward.`
- **Lead：** `A finished product is not yet a finished customer experience. The box, bag, insert, label, protection rule, bundle, and excluded supplier material all need to reach the packing team as a usable instruction. FreightVanta helps turn approved packaging and branding materials into a coordinated packout brief for products sourced from China. Your team retains ownership of the brand, artwork, customer promise and final approval.`
- **CTA：** `Request a packaging and branding plan` / `See the packout workflow`

### 5.3 页面板块与文案

1. **Decision framing — `Packaging becomes operational when every component has a purpose and a version.`**  
   `A logo file alone does not tell a packing team what to place in an order. The operational brief must identify the product variant, quantity of inserts, active language, protection method, treatment of supplier materials and the point at which old packaging stops being used.`

2. **When it fits — `Use packaging and branding coordination when files need to become physical orders.`**
   - `THE PRODUCT IS READY, THE PACKOUT IS NOT` — Connect box, bag, label, insert, gift component and supplier-material rules。
   - `A BRAND REVISION IS COMING` — Use version, effective date and remaining-stock decision to keep old and new materials from mixing。
   - `SEVERAL TEAMS TOUCH THE ORDER` — Give sourcing, inventory, packing, fulfillment and customer teams one current instruction。
   - `THE PRODUCT IS SOURCED FROM CHINA` — Carry approved packaging requirements from supplier handoff to inbound and final order preparation。

3. **Packout workflow — `Move from approved brand choice to repeatable packout.`**
   - Confirm product/version and customer-facing objective。
   - Collect artwork, labels, inserts, packaging components and language versions。
   - Define quantity, sequence, protection, bundle and excluded-material rules。
   - Record supplier/component information, effective date and change owner。
   - Review a sample or evidence item where included in the scope。
   - Publish the active packout instruction for inventory or fulfillment handoff。

4. **Scope controls**  
   Included：packaging brief、active version、insert/label sequence、component list、handoff notes。  
   Confirm first：graphic design、printing/manufacturing、trademark/IP/legal review、product safety labels、regulatory wording、material testing and final creative approval。

5. **Preparation checklist**  
   `Product reference and variations; current artwork and wording; packaging direction; inserts, labels and languages; known supplier/component source; approval owners; version name and effective date; intended storage, freight or fulfillment handoff.`

6. **Operating model — `The brand decision remains visible after the design file is approved.`**
   - `Customer-facing experience has an operational record` — Artwork is linked to product and order preparation。
   - `Changes are less likely to mix` — Active version and old-stock rule are explicit。
   - `Approvals happen before irreversible work` — Product, sample, packaging and packout checkpoints are visible。
   - `Brand decisions can connect to logistics` — A stable instruction can follow sourcing, storage, freight and fulfillment。

7. **FAQ**
   - `Can you design our logo or trademark?` — The page coordinates approved materials; legal/IP and creative ownership need separate scope.
   - `Can white-label products use custom inserts or packaging?` — Possible when product, materials, quantities and packout are approved.
   - `How do we avoid mixing old and new packaging?` — Use active version, effective date, remaining-stock rule and a current instruction.
   - `Does packaging coordination guarantee regulatory compliance?` — No; market labels, safety and certification require qualified review.
   - `Can packaging connect to private label and fulfillment?` — Yes, once product/version and packout rules are stable.
   - `What if artwork is not final?` — Keep the status as draft and record the approver; do not publish it as active.

8. **CTA**
   - **H2：** `Start with the product, the current approved brand decision, and the change you need to control.`
   - **Related links：** Private Label & White Label、Inventory Storage、Worldwide Fulfillment。

### 5.4 图片和 CMS

Hero image 建议展示未印刷箱、标签、插页和装箱顺序；不展示未经授权的品牌 logo。CMS 字段：`brandAssets[]`、`packoutSteps[]`、`versionRules[]`、`scopeRows[]`、`faq[]`。

---

## 6. Inventory Storage（库存仓储）

### 6.1 SEO 包

- **Title：** `Inventory Storage for Goods From China | FreightVanta`
- **Meta description：** `Organize imported inventory receiving, identification, storage, release instructions, and exception decisions before goods move to freight, retail, or customer orders.`
- **Primary keyword：** `inventory storage for goods from China`
- **Supporting：** `imported goods inventory management`、`inventory receiving and release`、`storage for China-sourced products`

### 6.2 Hero 文案

- **Eyebrow：** `INVENTORY STORAGE`
- **H1：** `Give imported inventory a clear receiving, storage, and release plan.`
- **Lead：** `When goods arrive from China, the next question is not only where they sit. The team needs to know what arrived, which product version it belongs to, how it is identified, what evidence is recorded, what may be released, and who decides when a count, carton, label or destination does not match. FreightVanta helps organize that operating record before storage and release scope is confirmed.`
- **CTA：** `Request an inventory storage plan` / `See the receiving-to-release workflow`

### 6.3 页面板块与文案

1. **Decision framing — `Storage is useful when the next release decision is visible.`**  
   `A warehouse address or a stock count alone does not tell the next team whether goods are sellable, reserved, awaiting evidence, intended for a retailer, or held for a later fulfillment order. A receiving-to-release record connects product identity, quantity, packaging, destination and approval owner.`

2. **When it fits**
   - `GOODS ARE ARRIVING BEFORE THE FINAL RELEASE` — Record expected cartons, product identity and hold/release rule。
   - `ONE INBOUND FEEDS MULTIPLE DESTINATIONS` — Separate retail, freight, replenishment and order-preparation purpose。
   - `INVENTORY INFORMATION IS SCATTERED` — Unite SKU/reference, count, images, damage notes and open decisions。
   - `PACKAGING OR BRAND MATERIALS ARE STORED WITH THE PRODUCT` — Keep component and packout versions visible。

3. **Receiving-to-release workflow**
   - Prepare expected inbound notice and document context。
   - Receive and identify cartons, pallets, products and active version。
   - Record count, visible condition and evidence required by confirmed scope。
   - Assign stock purpose, hold status, storage instruction and release owner。
   - Connect packaging, label, bundle or destination rule。
   - Release to confirmed freight, retailer, fulfillment or another nominated handoff。
   - Escalate discrepancy, damage, missing document or quantity difference for a decision。

4. **Scope controls**  
   Included：receiving brief、inventory identifiers、count/release rule、exception path、handoff record。  
   Confirm first：warehouse location、capacity、storage fee、insurance、temperature/special handling、inspection standard、inventory system integration and actual country coverage。

5. **Preparation checklist**  
   `Expected inbound date or period; cartons/pallets; product and SKU list; supplier and origin; active packaging/version; destination or stock purpose; count and evidence requirement; release owner; special handling or restriction to review.`

6. **Operating model — `Inventory status and order status stay separate.`**  
   `Received`、`identified`、`held`、`available`、`reserved`、`released` 和 `exception` 不应被压缩成一个模糊的“in stock”。库存记录能让下一位操作人员知道已发生什么、尚需谁决定什么。

7. **FAQ**
   - `Can you store products imported from China?` — Share origin, product, quantity, timing and destination; actual location, capacity and handling must be confirmed.
   - `Can inventory be released in stages?` — Yes, when stock purpose, identification and approval owner are defined。
   - `Do you guarantee a count or inspection result?` — No; evidence, inspection and acceptance standards require explicit scope。
   - `Can packaging and inserts remain with the inventory?` — They can be included in an approved component and release rule。
   - `Can storage connect to fulfillment?` — Yes, once sellable identity, packing rule and order handoff are ready。
   - `What happens if cartons do not match the notice?` — Record the discrepancy and route it to the named decision owner before release。

8. **CTA**
   - **H2：** `Start with what is arriving, what it is for, and who can release it.`
   - **Related links：** Bulk Procurement、Packaging & Branding、Worldwide Fulfillment。

### 6.4 图片和 CMS

图片方向：接收区、扫描标签、无品牌纸箱、分区库存和释放清单；避免展示不可验证的仓库规模。字段：`inboundSteps[]`、`stockStates[]`、`releaseRules[]`、`exceptions[]`、`faq[]`。

---

## 7. Private Label & White Label（私牌 / 白牌）

### 7.1 SEO 包

- **Title：** `Private Label Products From China | FreightVanta`
- **Meta description：** `Coordinate product, brand assets, packaging versions, approval checkpoints, and fulfillment handoff for private-label and white-label programs from China.`
- **Primary keyword：** `private label products from China`
- **Supporting：** `white label from China`、`private label sourcing`、`branded product version control`、`private label packaging coordination`

### 7.2 Hero 文案

- **Eyebrow：** `PRIVATE LABEL / WHITE LABEL`
- **H1：** `Keep your private-label product, packaging, and approval record aligned from China to the next handoff.`
- **Lead：** `A private-label program is more than putting a logo on an existing product. The product version, approved attributes, brand files, labels, packaging, inserts, supplier questions and fulfillment instruction need to refer to the same decision. FreightVanta helps organize that record and prepare the next confirmed handoff. Trademark, IP, legal labeling, product claims, compliance and manufacturing responsibility remain subject to qualified review and written scope.`
- **CTA：** `Request a private-label plan` / `See the approval workflow`

### 7.3 页面板块与文案

1. **Decision framing — `A branded product needs version control before it needs more volume.`**  
   `The same product can have several names, artwork files, inserts, labels, bundles and market versions. The operating question is which version is active, who approved it, when it takes effect, what happens to existing stock and how the packout moves to the next team.`

2. **When this fits**
   - `A WHITE-LABEL BASE PRODUCT NEEDS YOUR CUSTOMER-FACING VERSION` — Connect product reference, brand assets and packout。
   - `A PRIVATE-LABEL PROGRAM IS MOVING FROM SAMPLE TO PURCHASE` — Keep sample approval, specification, quantity and artwork in one record。
   - `A PACKAGING OR LANGUAGE REVISION IS COMING` — Define effective date and old-stock treatment。
   - `THE PRODUCT MUST CONNECT TO STORAGE OR FULFILLMENT` — Carry SKU, label, bundle and exception rules downstream。

3. **Approval and handoff workflow**
   - Establish product reference, intended market and customer promise。
   - Collect brand assets, artwork, wording, labels, inserts and packaging direction。
   - Record supplier/product version, sample context and open commercial questions。
   - Assign approval owners for product, creative, packaging and operations。
   - Set active version, effective date and remaining-stock decision。
   - Prepare packaging, inventory, freight or fulfillment handoff after approval。

4. **Scope controls**  
   Included：version record、asset checklist、approval path、packout handoff、change log。  
   Confirm first：trademark/IP/legal advice、product design/manufacturing、testing/certification、market compliance、claims and guarantee of product acceptance。

5. **Preparation checklist**  
   `Product and sample reference; target market; brand assets and approved wording; packaging/label/insert files; known supplier; version names; effective dates; approval owners; inventory and fulfillment destination.`

6. **Operating model — `The brand decision remains visible after the design file is approved.`**  
   Four cards：`Customer-facing experience has an operational record`、`Changes are less likely to mix`、`Approvals happen before irreversible work`、`The program can connect to practical logistics`。

7. **FAQ**
   - `Do you provide trademark or IP advice?` — No; use qualified legal advice and a confirmed scope。
   - `Can white-label products use custom packaging?` — Possible when product, materials, quantities and packout are approved。
   - `How are old and new labels separated?` — Use active version, effective date, remaining-stock rule and clear instruction。
   - `Does private-label coordination guarantee market compliance?` — No; safety, certification, legal label and claims need verification。
   - `Can a private-label program connect to sourcing and fulfillment?` — Yes, after product and brand decisions are stable。
   - `What if the artwork is still under review?` — Keep it draft, assign an approver and do not use it as an active packing rule。

8. **CTA**
   - **H2：** `Start with the product, the current approved brand decision, and the change you need to control.`
   - **Related links：** Product Sourcing、Packaging & Branding、Worldwide Fulfillment。

### 7.4 图片和 CMS

图片：未印刷包装、版本文件、插页和产品样品；不使用未经许可的品牌标识。字段：`productVersion`、`brandAssets[]`、`approvalSteps[]`、`changeRules[]`、`faq[]`。

---

## 8. Worldwide Fulfillment（全球履约）

### 8.1 SEO 包

- **Title：** `Fulfillment for China-Sourced Products | FreightVanta`
- **Meta description：** `Prepare China-sourced inventory for customer orders with clear picking, packing, label, shipping-handoff, and exception instructions.`
- **Primary keyword：** `fulfillment for China-sourced products`
- **Supporting：** `worldwide fulfillment for imported products`、`ecommerce fulfillment from China`、`pick and pack handoff`、`order exception workflow`

### 8.2 Hero 文案

- **Eyebrow：** `WORLDWIDE FULFILLMENT`
- **H1：** `Turn China-sourced inventory into customer-ready orders with a clear fulfillment plan.`
- **Lead：** `Fulfillment is the operating layer between ready inventory and the customer promise. FreightVanta helps coordinate how China-sourced products are identified, picked, packed, labeled, handed to a shipping service, and managed when an order needs a decision. The right setup depends on product, order profile, destination, brand materials, order source and delivery requirement. This page does not promise warehouse locations, carrier coverage, automation, cut-off times, tracking behavior or worldwide delivery until those details are verified.`
- **CTA：** `Request a fulfillment setup plan` / `See the order lifecycle`

### 8.3 页面板块与文案

1. **Decision framing — `A customer order should not be the first time the team learns the packing rule.`**  
   `Each sellable product needs an identifier, active packaging or bundle rule, destination instruction and exception path. A missing item, changed address, damaged component, stock difference or unclear label should create a visible decision request rather than an improvised customer-facing result.`

2. **When it fits**
   - `MULTIPLE DESTINATIONS OR ORDER TYPES` — Different products, labels, documents and packing rules need one order lifecycle。
   - `BRANDED COMPONENTS OR BUNDLES` — Inserts, gifts, multi-SKU combinations and excluded supplier material need active rules。
   - `SEVERAL TEAMS TOUCH THE ORDER` — Separate received, sellable, picked, packed, dispatched and exception states。

3. **Order lifecycle**
   - Receive and identify inventory。
   - Prepare sellable product/SKU and active packout rule。
   - Create picking rule for included, excluded and approved substitutions。
   - Apply packing and brand rule。
   - Prepare labels and confirmed shipping handoff。
   - Connect tracking reference where selected service provides it。
   - Handle stock, address, damage, cancellation, delay or return question as an exception request。

4. **Scope controls**  
   Included：order-preparation workflow、bundle and brand components、exception path、tracking reference handoff where supported。  
   Confirm first：warehouse location、country coverage、carrier availability、prohibited goods、processing time、cut-off、rate、store API、returns and customs。

5. **Preparation checklist**  
   `Product/SKU list; inventory context; expected order volume and seasonality; order source and data fields; destination markets; brand materials; bundle/substitution/exclusion rule; customer-service exception approach.`

6. **Operating model — `Order preparation becomes visible before a customer is waiting for an answer.`**  
   Four cards：`Stock status and order status remain separate`、`Brand and bundle rules travel with the order`、`Exceptions have an accountable route`、`The workflow can grow by approved complexity`。

7. **FAQ**
   - `Can you fulfill customer orders worldwide?` — Share intended markets; actual locations, carriers, product restrictions and destination availability must be verified。
   - `Can supplier material be removed or products bundled?` — Possible under an approved packing instruction。
   - `Can our ecommerce store connect automatically?` — No integration promise before platform and technical support are confirmed。
   - `How are tracking updates handled?` — Depends on selected shipping service and available integration。
   - `Can fulfillment start with inventory already sourced from China?` — Yes, after product identity, quantity and packout rule are usable。
   - `How are returns or address changes handled?` — Define the exception owner and response path before release。

8. **CTA**
   - **H2：** `Start with the products, the orders, and the customer-facing rule that must stay consistent.`
   - **Related links：** Inventory Storage、Packaging & Branding、Product Sourcing。

### 8.4 图片和 CMS

图片：扫描、拣货、装箱和标签交接，不展示虚假的订单量或实时轨迹。字段：`orderLifecycle[]`、`packingRules[]`、`exceptionRules[]`、`destinationContexts[]`、`faq[]`。

---

# B 类：行业解决方案专题页

行业页不替代服务页。它们从行业决策出发，再把访问者引向服务型专题页。四页统一使用“Hero → decision framing → connected workflow → context rows → operating controls → planning brief → FAQ → related services → CTA”的结构。

## 9. Cross-border Ecommerce（跨境电商）

### 9.1 SEO 包

- **Title：** `Cross-Border Ecommerce Logistics From China | FreightVanta`
- **Meta description：** `Plan a cross-border ecommerce operating path from China sourcing to product checks, packout, inbound inventory, release and customer-ready orders.`
- **Primary keyword：** `cross-border ecommerce logistics from China`
- **Supporting：** `China ecommerce supply chain coordination`、`ecommerce sourcing and fulfillment from China`、`retail-ready ecommerce inventory`

### 9.2 Hero 文案

- **Eyebrow：** `CROSS-BORDER ECOMMERCE`
- **H1：** `Connect the China sourcing decision to the order your customer is ready to receive.`
- **Lead：** `Cross-border ecommerce is a chain of connected decisions: product reference, supplier questions, specification, packaging, inbound inventory, release rule and customer order. FreightVanta helps make that chain visible so the next team can act on the same product and packout context. Carrier coverage, delivery timing, customs, platform integration and service availability remain subject to the confirmed destination and scope.`
- **Rail：** `PRODUCT → CHECKS → PACKOUT → INBOUND → RELEASE`
- **CTA：** `Plan your ecommerce handoff` / `See the operating path`

### 9.3 页面板块与文案

1. **Decision framing — `Ecommerce is a sequence of commitments, not one shipping label.`**  
   `The product a customer sees must be connected to the product that was sourced, the version that was packed, the inventory that was received and the order that is released. If any link is unclear, the next team must ask the same question again or make an assumption that changes the customer experience.`

2. **Connected workflow — `From China sourcing to customer-ready orders.`**
   - `PRODUCT REFERENCE` — Product link, specification, version and market context。
   - `CHINA SOURCING HANDOFF` — Supplier question set, response comparison and open decisions。
   - `PACKOUT RULE` — Packaging, insert, label, bundle and supplier-material rule。
   - `INBOUND CONTEXT` — SKU, quantity, receiving evidence and stock purpose。
   - `ORDER RELEASE` — Pick, pack, label, shipping handoff and exception owner。

3. **Sales-channel scenarios — `One product, different operating contexts.`**
   - `DTC / SUBSCRIPTION` — Order source, bundle, insert, replenishment and customer-facing rule。
   - `RETAIL / WHOLESALE` — Carton, label, pack quantity, delivery appointment or retailer instruction to be confirmed。
   - `SEASONAL / CAMPAIGN` — Active date, stock purpose, launch window and escalation owner。

4. **Operating controls — `What must be clear before stock moves.`**
   - Can the product be identified by an active SKU/version?
   - Is the packout rule tied to the current product?
   - Who can release or hold stock?
   - What evidence is expected at inbound?
   - What happens when quantity, address, label or product differs?

5. **Planning brief — `Start with the operating facts you already have.`**  
   `Product/SKU list; China supplier or product reference; target markets and channels; order profile; packaging and brand materials; expected inbound; customer promise; current blocker; decision owner.`

6. **FAQ**
   - `Can you manage our entire cross-border ecommerce supply chain?` — The page connects confirmed service handoffs; actual services and countries require scope review。
   - `Can you guarantee delivery dates?` — No; route, carrier, customs and destination conditions must be confirmed。
   - `Can you support Shopify or another store?` — Do not promise an integration before platform/data support is verified。
   - `Can sourcing, packaging, storage and fulfillment be connected?` — Yes, when each handoff has an approved record。
   - `Can seasonal inventory be released in stages?` — It can be planned with stock purpose, release owner and confirmed destination。
   - `What should an ecommerce brand send first?` — Product/SKU, markets, order source, packaging, timing and the current operational decision。

7. **Related links and CTA**
   - Related：Product Sourcing、Packaging & Branding、Inventory Storage、Worldwide Fulfillment。
   - **H2：** `Make the next ecommerce handoff easier to approve.`
   - **正文：** `Share your product, channels, destination markets, inventory position and current blocker. We will map the practical questions before a service scope is confirmed.`

### 9.4 视觉和开发

使用深海军蓝 Hero、白色决策区、冷蓝 workflow、横向场景行、深色 controls、图片型 product-context split、浅蓝 planning、FAQ 和 CTA。不要使用旋转地球、虚假实时订单图、假 tracking map 或未经核实的电商平台 logo。

---

## 10. Consumer Goods（消费品）

### 10.1 SEO 包

- **Title：** `Consumer Goods Logistics From China | FreightVanta`
- **Meta description：** `Coordinate China-sourced consumer goods from product reference and packaging through inbound inventory, channel release and customer-ready handoff.`
- **Primary keyword：** `consumer goods logistics from China`
- **Supporting：** `consumer goods sourcing and packaging from China`、`China consumer goods supply chain coordination`、`retail-ready consumer goods handoff`

### 10.2 Hero 文案

- **Eyebrow：** `CONSUMER GOODS`
- **H1：** `Move consumer goods from a China product reference to a retail-ready or customer-ready handoff.`
- **Lead：** `A consumer product is more than the item inside the carton. Product version, presentation, packaging, inbound evidence, channel and release owner all shape the next decision. FreightVanta helps organize those handoffs for DTC, subscription, retail, wholesale, seasonal and replenishment contexts without assuming product quality, compliance, storage capacity or delivery coverage.`
- **Rail：** `PRODUCT → SOURCE → PRESENT → RECEIVE → RELEASE`

### 10.3 页面板块与文案

1. **Decision framing — `The product experience starts before the customer opens the carton.`**  
   `The active product, package, insert, label, bundle and receiving rule should describe the same customer-facing version. A change in artwork, component or product variant needs an owner and an effective date before stock is released.`

2. **Six-step workflow**
   - Approved product reference。
   - China sourcing or purchase handoff。
   - Packaging and presentation rule。
   - Inbound count and evidence context。
   - Channel-specific release rule。
   - Customer/retail handoff and exception path。

3. **Release contexts**
   - `DTC / SUBSCRIPTION` — Replenishment cycle, bundle, insert and customer order rule。
   - `RETAIL / WHOLESALE` — Pack quantity, carton/label and retailer instruction to confirm。
   - `SEASONAL / CAMPAIGN` — Active date, launch stock, destination and escalation owner。

4. **Product-context checklist**
   `Product version; material/variant; packaging/presentation; destination channel; inbound evidence; stock purpose; release owner; exception decision.`

5. **Operating controls**
   `Coordination can organize product/version, packaging, evidence and release questions. Quality, inspection, product compliance, claims, regulations, storage, rates, returns and delivery capability remain subject to confirmation.`

6. **Planning brief**
   `Send the product reference, target market/channel, expected quantity, packaging direction, inbound timing, customer/retailer requirement and current blocker. Unknowns are retained as open questions.`

7. **FAQ**
   - `Can you guarantee a consumer product meets local regulations?` — No; qualified compliance review is required。
   - `Can you prepare retail-ready packaging?` — Packaging/packout can be planned when files, components and instructions are approved。
   - `Can you handle seasonal launch stock?` — The stock path can be planned; dates and capacity require confirmation。
   - `Can products be sourced from China and then fulfilled?` — Yes, through confirmed service handoffs。
   - `Do you provide product testing?` — Only when testing method and scope are explicitly confirmed。
   - `What should a brand send first?` — Product version, channel, packaging, quantity, destination and desired handoff。

8. **CTA：** `Start with the product customers will see, the channel it must reach, and the next release decision.`

### 10.4 视觉和开发

采用现有行业页样式：深蓝 Hero、白色 decision、冷蓝 workflow、场景 ledger、深色 controls、消费品和 packout 图片 split、浅蓝 planning。图片只展示无品牌或已获授权的普通消费品，不使用虚假零售 logo、评价或销售数据。

---

## 11. Industrial Components（工业零部件）

### 11.1 SEO 包

- **Title：** `Industrial Components Logistics From China | FreightVanta`
- **Meta description：** `Coordinate specification-led industrial parts from China with revision control, protective packaging, documents, inbound identification and a confirmed receiving handoff.`
- **Primary keyword：** `industrial components logistics from China`
- **Supporting：** `industrial parts sourcing and shipping from China`、`China industrial component supply chain`、`protective packaging for industrial parts`、`specification-led freight coordination`

### 11.2 Hero 文案

- **Eyebrow：** `INDUSTRIAL COMPONENTS`
- **H1：** `Carry the active component specification from China to a controlled receiving handoff.`
- **Lead：** `For industrial parts, a usable delivery decision starts with the correct reference, revision, quantity, protective method, documents, inbound identification and receiving owner. FreightVanta helps organize that information for production input, maintenance/spares, project and site-delivery contexts. Engineering approval, testing, regulatory work, carrier capability and site access remain separate confirmation points.`
- **Rail：** `REFERENCE → PACK → DOCUMENTS → RECEIVE → RELEASE`

### 11.3 页面板块与文案

1. **Decision framing — `A correct part still needs a usable receiving decision.`**  
   `The next team should be able to see which revision is active, what protection is required, which document belongs to the part, where it is going and who can release it. The logistics record does not replace engineering approval; it prevents the receiving team from guessing which product context is current.`

2. **Six-step workflow**
   - Establish active part number, drawing and revision。
   - Prepare China purchase/supplier handoff。
   - Confirm protective packaging and handling questions。
   - Connect commercial, product and shipping documents where provided。
   - Identify inbound part, quantity, crate/carton and destination。
   - Release to production, maintenance, project/site or another confirmed owner。

3. **Component contexts**
   - `PRODUCTION INPUT` — Revision, lot/quantity, protective rule and production owner。
   - `MAINTENANCE / SPARES` — Replacement reference, urgency, compatibility question and receiving owner。
   - `PROJECT / SITE DELIVERY` — Site, milestone, access, packaging and document requirements to confirm。

4. **Receipt context checklist**
   `Active revision; quantity; protection method; evidence/documents; inbound identifier; destination/site; timing milestone; receiving owner; exception path.`

5. **Operating controls**
   Included：reference and handoff organization、protective packaging questions、document path、inbound identification。  
   Confirm first：engineering acceptance、testing、certification、dangerous goods/special handling、carrier、insurance、customs、site access and delivery appointment。

6. **Planning brief**
   `Send the active part reference, revision, quantity, origin, destination, protective packaging, documents, required window and decision owner. Mark unknown engineering or regulatory items as open.`

7. **FAQ**
   - `Do you approve the engineering specification?` — No; the page organizes the active reference, while engineering approval remains with the responsible team。
   - `Can you arrange protective packaging?` — The requirement can be coordinated; material and handling scope need confirmation。
   - `Can you guarantee site delivery by a milestone?` — No; route, carrier, customs and site conditions must be confirmed。
   - `Can industrial parts be stored before release?` — Storage and identification can be planned under a confirmed scope。
   - `Can urgent replacement parts use the time-critical route?` — Link to Time-critical Cargo when the consequence, ready date and route decision are defined。
   - `What should be attached first?` — Part number/revision, drawing or photo, quantity, destination, packaging and timing。

8. **CTA：** `Start with the active reference, the receiving context, and the decision that cannot be left to assumption.`

### 11.4 视觉和开发

使用被保护的零件、可重复使用木箱或无品牌托盘、文件夹和接收标签作为图片主体。不要用泛化的“工厂”或虚假精密设备；页面始终区分物流协调和工程认可。

---

## 12. Time-critical Cargo（时效敏感货物）

### 12.1 SEO 包

- **Title：** `Time-Critical Cargo Logistics From China | FreightVanta`
- **Meta description：** `Plan time-critical cargo from China with a visible ready date, documents, routing options, escalation path, and confirmed next handoff.`
- **Primary keyword：** `time-critical cargo logistics from China`
- **Supporting：** `urgent freight shipping from China`、`China air freight for urgent cargo`、`time-sensitive supply chain coordination`、`emergency replenishment logistics`

### 12.2 Hero 文案

- **Eyebrow：** `TIME-CRITICAL CARGO`
- **H1：** `Make the next feasible movement visible before the clock takes over.`
- **Lead：** `Urgent cargo decisions need more than the word “express.” FreightVanta helps collect the business consequence, cargo readiness, ready date, documents, routing question, receiving window and escalation owner so a time-critical movement can be reviewed as a decision set. Carrier capacity, transit time, customs release, rates, special handling and final delivery are confirmed only for the actual cargo and route.`
- **Rail：** `REQUEST → READY → DOCS → ROUTE → RECEIVE`
- **CTA：** `Request a time-critical cargo plan` / `See the urgency workflow`

### 12.3 页面板块与文案

1. **Decision framing — `Urgency is a connected set of facts, not a carrier promise.`**  
   `The business consequence, ready date, package, documents, route options, destination condition and escalation owner need to be visible together. A fast label cannot solve missing cargo readiness, unclear paperwork or an unavailable receiving window.`

2. **Urgency workflow**
   - Define deadline and business consequence。
   - Confirm cargo readiness, dimensions, weight, quantity and packaging context。
   - Collect commercial, product and transport documents available at origin。
   - Compare route options and unresolved constraints。
   - Assign escalation owner for carrier, customs, destination or receiving question。
   - Confirm the next release/handoff only after actual route scope is reviewed。

3. **Time-critical contexts**
   - `PRODUCTION / REPLENISHMENT` — Consequence of line stop or stock-out, ready date, replacement quantity。
   - `CUSTOMER / REPLACEMENT` — Customer commitment, product identity, destination and exception owner。
   - `PROJECT / SITE MILESTONE` — Site window, access, document and receiving requirement。

4. **Cargo context checklist**
   `Business consequence; required arrival/receiving window; cargo description; packages, dimensions and weight; ready date; origin; destination; documents; routing concern; decision owner.`

5. **Operating controls**
   Can organize：deadline brief、cargo facts、document checklist、route questions、escalation path。  
   Confirm first：carrier space、fixed transit time、customs clearance、insurance、dangerous goods、temperature/special handling、site access、rate and delivery date。

6. **Planning brief**
   `Send the ready date, receiving window, consequence, cargo facts, package details, origin/destination, available documents and the question that is blocking the next movement.`

7. **FAQ**
   - `Can you guarantee an arrival time?` — No; actual carrier, route, customs and receiving conditions must be confirmed。
   - `Can urgent cargo start with partial information?` — The first review can identify missing facts, but a route cannot be confirmed without the information required for the shipment。
   - `Can you compare air and other route options from China?` — Route questions can be organized; availability, rate and transit require actual confirmation。
   - `What if the original route fails?` — The escalation path records who reviews alternatives and what decision is needed next。
   - `Can you handle special or regulated cargo?` — Only after product, documents, handling and legal requirements are explicitly confirmed。
   - `What should we send first?` — Ready date, consequence, cargo/package facts, origin, destination, documents and receiving window。

8. **CTA：** `Start with the ready date, the business consequence, and the handoff that cannot miss its decision.`

### 12.4 视觉和开发

Hero 可使用待发运的无品牌箱件、文件夹、时间节点清单和运输交接动作。不要使用倒计时制造虚假紧迫感，不要写 guaranteed express、fixed transit 或已承诺的到货时间。移动端先显示事实和 CTA，再显示路线图。

---

## 13. 统一 FAQ、内链和结构化数据清单

### 13.1 每页至少需要的 FAQ 类型

每页 FAQ 不要复制同一组问题；至少覆盖：

1. 只有链接/部分资料能否开始。
2. 服务到底包含什么，哪些需要另行确认。
3. 质量、价格、时效、覆盖范围或合规是否保证。
4. 当前页面怎样连接前后专题。
5. 出现差异、变更、损坏或缺少资料时谁决定下一步。
6. 首次询盘需要提交哪些最少资料。

### 13.2 相关服务 rail 文案

- Product Sourcing：`Build the product and supplier brief before the next purchase decision.`
- Bulk Procurement：`Plan quantity, inventory purpose and the next release before a larger buy.`
- Packaging & Branding：`Carry approved packaging and brand rules into the physical packout.`
- Inventory Storage：`Make receiving, identification, storage and release visible.`
- Private Label & White Label：`Keep product, brand version and approval ownership aligned.`
- Worldwide Fulfillment：`Turn ready inventory into customer-ready order instructions.`

### 13.3 JSON-LD 与可抓取性

- WebPage：name、description、url 与页面可见文案一致。
- BreadcrumbList：Home → Services/Industries → 当前页面。
- Service：只写实际展示的服务，不写未证实的价格、地区、评分或能力。
- FAQPage：问题和答案必须原样或等价地出现在页面可见 FAQ 中。
- 图片 `alt` 不得等于关键词列表；链接使用描述性锚文本。

---

## 14. 多语言适配顺序与本地化内容要求

建议顺序：英语全球站 → 德语 → 法语 → 西班牙语 → 意大利语 → 荷兰语。每个语言站的页面结构和信息密度保持一致，但文案要本地化，而不是把英文句子逐字替换。

### 14.1 本地化必须保留的事实

- 从中国采购 / China sourcing 的业务起点。
- 产品、供应商、样品、规格和审批链。
- 包装、品牌、库存、批量采购和全球履约的前后关系。
- “需要确认”的服务边界。
- 同一页面的 URL 语义、CTA 目的和内链结构。

### 14.2 本地化不得直接复制的内容

- 不把英文的“worldwide”翻译成当地站一定覆盖所有国家的承诺。
- 不把 `China sourcing agent` 直接翻译成具有法律代理含义的词，除非当地法务和运营确认。
- 不把 `quality check`、`inspection`、`compliance` 翻译成保证性结果。
- 不改变页面模块顺序来压缩文案；如语言变长，用排版自适应解决。

---

## 15. 前端实现验收清单

### 内容验收

- [ ] 10 个路由都能访问，服务页与行业页分组清楚。
- [ ] 每页保留 Hero、decision、场景、workflow、scope、准备资料、FAQ、相关服务和 CTA。
- [ ] Product Sourcing 不得只保留原来的 Hero + 3 卡片；至少实现本文第 3 节的 12 个内容模块。
- [ ] 所有 CTA 都指向对应页面表单或询盘入口，不跳到错误语言站。
- [ ] FAQ 展开内容与 FAQPage JSON-LD 一致。
- [ ] 页面文案不加入未验证的价格、仓库、时效、认证、客户案例或覆盖范围。

### SEO 验收

- [ ] 每页只有一个 H1，title 和 meta description 唯一。
- [ ] canonical、BreadcrumbList、WebPage JSON-LD 正确。
- [ ] 已完成的语言版本才输出 hreflang。
- [ ] 图片有真实 alt；内部链接使用描述性锚文本。
- [ ] 页面正文自然覆盖主关键词、辅助关键词和搜索问题，不出现关键词堆叠。

### UI / 响应式验收

- [ ] Desktop 1440px、Tablet 1024px、Mobile 375px 无横向滚动。
- [ ] 长标题、德语复合词、法语重音字符和西班牙语倒置问号不溢出。
- [ ] workflow 在移动端按顺序堆叠，不能依赖横向拖动才能看全文。
- [ ] FAQ 问题可换行，键盘焦点可见。
- [ ] 深色图片上的文字有足够不透明度和 WCAG AA 对比度。
- [ ] `prefers-reduced-motion` 开启时，内容立即可读，动画只保留静态状态。

### 运营验收

- [ ] 询盘收件人、隐私同意、公司法律主体和 Terms/Privacy 链接已配置。
- [ ] 产品、供应商、包装、库存、运输和履约的实际范围由负责人逐页确认。
- [ ] 需要本地法规、认证、标签或产品安全意见时，页面明确要求专业审核。
- [ ] 任何新的价格、时效、地点、客户案例、评价、承运商或国家覆盖，都经过书面证据审核。

---

## 16. 资料来源与核验记录

本总文档综合了项目中已有的以下资料，并在不复制第三方原文和不增加未经确认承诺的前提下扩充结构：

- `docs/product-sourcing/product-sourcing-en.md`
- `docs/freightvanta-topic-pages-inventory-and-product-sourcing-requirements-v1.md`
- `docs/freightvanta-services-content-development-spec.md`
- `docs/freightvanta-other-service-pages-expanded-copy-plan.md`
- `docs/freightvanta-cross-border-ecommerce-industry-solution-spec.md`
- `docs/freightvanta-consumer-goods-industry-solution-spec.md`
- `docs/freightvanta-industrial-components-industry-solution-spec.md`
- `docs/freightvanta-time-critical-cargo-industry-solution-spec.md`

外部参考只用于观察页面信息密度、服务导航和 Hero → workflow → FAQ → CTA 的内容节奏；没有复用第三方文案、图片、客户数据、价格、仓库信息、承运商列表或运营承诺。最终上线前仍需 FreightVanta 负责人核验每个页面的实际服务能力和法律边界。

---

## 17. 给前端或其他 AI 的直接执行说明

请按本文的页面顺序和完整文案实现，不要把内容重新压缩成短卡片。先用英语全球站完成一个完整页面模板，再将同一 CMS 数据结构复用于其他 9 个页面。每个页面的颜色、Header、Footer 和全局动效沿用对应站点模板；页面内部通过不同图片、场景标签和内容顺序体现服务/行业差异。

实现优先级：

1. Product Sourcing：先完成第 3 节的完整内容和 12 个以上模块。
2. 其余 5 个服务专题页：接入统一服务模板和各自 copy。
3. 4 个行业页：接入行业模板，保留场景 ledger 和 operating controls。
4. 接入多语言字段，不删减英文源文案中的信息点。
5. 做 SEO、移动端、FAQ、表单和无障碍验收。

