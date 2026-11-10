# 关税与进口增值税预估器：技术开发文档

- 项目：CZCMS / FreightVanta
- 版本：v1.0 草案
- 日期：2026-11-10（Asia/Shanghai）
- 状态：设计方案，未实现、未运行本方案测试、未部署。
- 产品约束：[需求文档（PRD）](<duty-tax-calculator-requirements.md>)。技术实现不得绕过 PRD 的国家、业务范围与结果完整性限制。

## 1. 技术目标与架构决策

1. 延续 Go + Chi + SQLite 模块化单体，不为计算器引入独立微服务。
2. 新增独立 `dutytax` 领域模块；不把公式继续堆进 HTTP handler 或后台主脚本。
3. 服务端是唯一金额权威。前端只处理交互、输入格式和展示，不独立维护国家税率。
4. 规则选择、金额计算、格式化展示分层；引擎不得发起网络请求。
5. 复用 HTS/TARIC 原始证据，但新增适用性、条件和规则版本层；“抓取成功”不等于“可自动计税”。
6. 同一输入、计算器版本和已冻结数据版本产生可复算结果。
7. 数据不完备时安全降级，不通过默认零税率、默认免税或忽略措施实现虚假成功。
8. V1 单商品、单原产国、单进口国、普通商业进口；七个目的地逐个验证启用。

### 1.1 现有集成点

| 职责 | 现有位置 | 集成方式 |
| --- | --- | --- |
| 应用依赖装配 | [app.go:121–159](<../internal/app/app.go#L121-L159>) | 注入 DutyTax 服务，不替换 HTS/TARIC 服务 |
| HTTP 路由和限流 | [server.go:409–469](<../internal/httpserver/server.go#L409-L469>) | 新增独立 limiter、页面与 API handler |
| HTS 结构 | [normalize.go:31–44](<../internal/hts/normalize.go#L31-L44>) | 读取编码、原文税率、脚注与版本，通过适配器解析 |
| HTS 检索 | [hts_handlers.go:31–46](<../internal/httpserver/hts_handlers.go#L31-L46>) | 复用服务，不从 HTTP 内部请求自己的公开 API |
| TARIC 措施与缓存 | [measures.go](<../internal/taric/measures.go>) | 保留原始结果；新增类型化措施/审核规则，禁止按文本盲算 |
| 数据库迁移 | [migrations.go:20–61](<../internal/database/migrations.go#L20-L61>) | 当前读到 40 版，实施时重新核对并使用下一空闲版本 |
| HTML/静态资源 | [embed.go:7](<../frontend/embed.go#L7>) | 新页面模板和模块加入 embed 与 ParseFS |
| 询盘 | [topic_enquiry.go](<../internal/httpserver/topic_enquiry.go>) | 新入口复用表单安全、入库/收件箱/邮件机制，扩展结构化快照 |
| SEO | [public_seo.go](<../internal/httpserver/public_seo.go>) | 新工具元数据、canonical、noindex 及 sitemap |

### 1.2 建议新增文件（均为计划，不代表已存在）

```text
internal/dutytax/
  service.go                # 校验/规则解析/引擎编排
  types.go                  # 请求、规则、结果、状态
  decimal.go                # 十进制解析、金额与比率运算
  engine.go                 # 无 I/O 的计算入口与依赖图
  valuation.go              # 成本账本与海关价值
  jurisdiction_us.go        # 美国估价、规费与税制策略
  jurisdiction_eu.go        # 欧盟关税与进口 VAT
  jurisdiction_gb.go        # GB 关税与进口 VAT
  rates.go                  # 严格税率解析与规则选择
  coverage.go               # 完整性、未知依赖和降级
  repository.go             # 规则版本与快照存取
  providers/hts.go
  providers/taric.go
  providers/uk.go
  *_test.go
internal/database/duty_tax.go
internal/httpserver/duty_tax_handlers.go
internal/httpserver/duty_tax_admin.go
internal/httpserver/duty_tax_enquiry.go
frontend/duty-tax.html
frontend/assets/js/duty-tax.mjs
frontend/assets/js/duty-tax-model.mjs
frontend/assets/js/duty-tax-settings.mjs
frontend/assets/css/duty-tax.css
frontend/assets/css/duty-tax-settings.css
frontend/shared/duty-tax-copy.json
frontend/tests/duty-tax.test.mjs
scripts/verify-duty-tax.cjs
```

不新建第四套 React 工程。独立工具页采用当前 Go 模板 + 原生 ES Module；React 首页只增加指向本工具的入口。

## 2. 数据流

```text
页面/编码页/运费结果
  → 编码候选确认（无货值）
  → POST 计算请求（含私密费用）
  → 输入校验与国家范围检查
  → 取得不可变规则版本、编码/原产地/日期证据
  → 税率适用性与覆盖判定
  → 成本账本 → 国家海关价值 → 关税/规费 → VAT 基础 → VAT
  → 依赖完整性传播 → 已知小计/条件允许的完整合计
  → 本地化结果 + 短期防篡改凭据（不持久化匿名试算）
  → 用户明确提交询盘
  → 服务端复算/验证 → 保存询盘与结果快照 → 邮件队列
```

所有来源先在 provider 层解析成带证据的领域对象；业务引擎不理解 HTML 标签、不依赖当前页面语言。

## 3. 金额、比率、日期与编码约定

### 3.1 金额

- JSON 金额统一十进制字符串，例如 `"1200.00"`，禁止 JSON 浮点数。
- V1 输入货币 USD/EUR/GBP/CNY，全部两位小数；内部 `int64` 最小货币单位（分）表达。
- 货值范围 `0.01–999999999.99`；单项非负费用 `0–999999999.99`；合计另做溢出校验。它们是应用保护上限，不是法律阈值。
- 缺失金额使用 `null`，已明确为零使用 `"0.00"`，不适用使用状态字段且金额 `null`。
- API 不接受千分位、逗号小数、指数、NaN、Infinity、负号或超过两位小数；本地化输入由 UI 明确规范后提交。
- 费率与汇率最多 8 位小数，使用 `math/big.Rat` / `big.Int` 做乘法和除法，禁止 `float32/float64` 参与金额计算。
- 内部税率为小数分数：6.5% 为 `"0.06500000"`；0.125% 为 `"0.00125000"`。
- 不对未知费率赋默认 0；人工税率与官方规则来源严格分离。

### 3.2 舍入

- V1 预算默认 `HALF_UP` 到税费币种最小单位，保存在 `rounding_policy_version` 中；不声称与所有海关申报舍入规则相同。
- 每个实际成本行换汇后取分；海关价值按已取分成本行构成。每个税/费组件算完后取分，下游 VAT 使用这些明确的组件金额。
- 已知小计等于其包含的已显示金额之和；不同用途的成本/税基不混加。
- 若法域规定不同舍入顺序，建立独立已审核策略与测试，不在前端临时修正一分钱。
- 汇率方向固定 `1 input_currency = rate × tax_currency`；禁止自动倒置或默认为 1。

### 3.3 日期与版本

- `import_date` 为目的税制适用日期，格式 `YYYY-MM-DD`，不是客户端任意时区的时间戳。
- 国家配置明确 `legal_timezone`；美国首期使用受支持进口地区的配置日期并可由用户确认，遇日期边界不得默默以北京时间替代。
- 采集和审计时间 UTC RFC3339；界面标明显示时区。
- 法定有效期、数据采集时间、复核到期时间三者独立。
- 规则匹配使用半开区间 `[effective_from, effective_to)`；无结束日期可为空。
- 历史/未来日期只有存在对应已审核快照才可自动算。现有 TARIC Measures 拒绝未来日期，当前 HTS 快照也不构成历史档案。

### 3.4 编码

编码始终是字符串，保留前导零；只允许受控分隔符规范化。六位仅用于候选检索，自动计算须确认目的地完整编码和该日有效性。英国编码格式由英国 provider 核实，不将欧盟编码换标签即视为英国编码。

## 4. 成本账本与估价模型

### 4.1 明确两个不同账本

1. **实际成本账本**：商品、国际运输、保险、境内运输及服务费用，每个经济项目只能出现一次。
2. **计税账本**：哪些成本/调整进入海关价值、某项规费税基及进口 VAT 税基。

`customs_value` 是基数，不是到岸成本新增的一项。输入“申报海关价值”时也不能把它与商品成本再加一次。

### 4.2 成本项结构（概念）

```text
CostLine {
  id, kind, amount_minor, currency,
  included_in_invoice, included_in_declared_customs_value,
  valuation_treatment_rule_id,
  vat_base_treatment_rule_id,
  source_type, source_version,
  service_tax_inclusion,                 # 仅服务费用：gross/net/unknown
  status                               # known/unknown/not_applicable
}
```

- `kind` 受控枚举：goods、international_freight、insurance、domestic_delivery、clearance_service 等。
- 一般模式的 `goods_value` 是独立商品成本；页面若录入发票总额，必须列出其中运费/保险等，服务端得到 `invoice_goods = invoice_total - included_costs`。
- `invoice_goods` 与独立 `goods_value` 不同时接受为两个权威数值；同一费用不能多次标记包含。
- `included_in_invoice` 不等于该项应该进入任何国家的海关价值；法域策略决定。
- 含税 DDP 整包发票或费用拆分不清：停止自动估价，不用倒算税额猜商品净值。
- 出现特许权、关联交易、免费供料、佣金等复杂调整：V1 转人工；不开放一个可随意减税的“负调整”框。

### 4.3 两种估价模式

**guided**：从明确、可验证分项构造海关价值。EU/GB 可按适用规则加入到进口边境的相关费用；US 不使用统一 CIF 加法。若美国分项不足以执行已审核估价规则，要求客户提供已确认海关价值或转人工。

**declared_customs_value**：客户/报关行提供已确认海关价值（采用输入币种，转换到税费币种），系统记录来源声明、确认标记和已包含成本项；这只是用户估价假设，不表示海关认可。商品/运输费用仍单独存在于实际成本账本。无法识别哪些相关费用已进该基数时，VAT 只给部分/人工结果。

零运费、零保险必须是用户明确确认；空白不是零。不得仅根据 Incoterm 自动推断费用已包含。

## 5. 计算公式与依赖传播

下式只是受支持普通情形的框架，具体包含关系按规则决定，不作为所有进口程序的通用法律公式。

### 5.1 变量

```text
G       = 实际商品成本（税费币种）
F, I    = 国际运费、保险的实际成本
L       = 相关境内/已知后续目的地费用
CV      = 由国家估价策略形成的海关价值
D_i     = 第 i 项已确认适用关税
R_j     = 第 j 项已确认适用政府规费
B_k     = 第 k 项商业服务费用的客户支出口径
AV      = 按规则进入 VAT 基础、且未已含 CV 的附带费用
VB      = VAT 计税基础
V       = 进口 VAT
```

### 5.2 关税

对支持的从价组件：

```text
D_i = round(CV_or_rule_base × rate_i)
D = sum(适用且允许叠加的 D_i)
```

不能把所有候选费率相加：

- General / preferential / non-NTR 属于待遇选择，不是三笔累计税。
- 额外措施通过 `stack_group`、`exclusive_group` 和优先级执行。
- 优惠证明不齐时不自动选优惠，也不声明优惠“肯定不能用”；可显示默认待遇假设及待核实项。
- 从量、复合、最低/最高比较、配额、农业成分、附加代码/企业条件等 V1 不解析为简单百分比。
- 任何未知附加措施都必须保留覆盖缺口；不得因为接口未返回某项就证明该税不存在。

### 5.3 EU / GB 进口 VAT

```text
VB = CV
   + sum(按国家规则计入的关税/其他税费)
   + sum(未在 CV 中重复计算的相关附带费用 AV)
V  = round(VB × applicable_vat_rate)
```

- VAT 自身不进入自身税基。
- 到首个及已知后续目的地的运输等费用按法定范围处理。
- 不是所有服务费都盲目加 VAT 或盲目排除；必须标识其是否进入进口 VAT 基础、是否另有服务 VAT、客户支出为 gross 还是 net。
- 同一进口相关服务若在规则下应按零税率处理，不能再凭空收一次标准服务 VAT。
- 某项关税/相关费用未知，VB 和 V 的“完整金额”均未知；可提供另列的情景计算，但不进入已知税额小计。

### 5.4 美国规费

```text
MPF = round(clamp(eligible_base × mpf_rate, min_amount, max_amount))
HMF = round(eligible_merchandise_value × hmf_rate)   # 仅符合征收条件时
```

上式仅对审核为适用的条目执行。正式/非正式申报、运输模式、豁免、适用港口、手工附加费和按票范围由规则决定。未覆盖的进口类型不套正式申报公式。金额、最低/最高及比例必须绑定生效期和法源，不能直接将网页旧值固化。

美国 VAT 组件 `status=not_applicable, amount=null`，不是未知，也不是通用“所有税为零”。州销售/使用税列入范围外说明。

### 5.5 合计

```text
known_tax_subtotal       = sum(known 的关税组件 + known 的进口 VAT)
known_government_fees    = sum(known 的政府规费)
known_import_costs       = known_tax_subtotal + known_government_fees + 已确认商业费用
landed_cost_with_tax     = 实际成本账本的非重复成本 + 关税 + 政府规费 + 进口 VAT
```

- 各项商业费用若已在实际成本账本中，不在到岸成本里再加一次。
- VAT 未确定时 `known_tax_subtotal` 只含已知关税，旁边必须显示“VAT 待核实”。
- `total_tax`、`total_import_costs`、`landed_cost_with_tax` 分别按其依赖完整性判定；未知返回 null。
- overall 为 partial/manual_review/unsupported 时，首期不输出完整合计字段，界面只显示已知小计与必要情景值。
- 不输出“抵扣后净成本”；不自动从到岸预算减去进口 VAT。
- DDP / DAP 分组基于同一计算结果，不引入任何税额变化。

### 5.6 状态归并

组件状态：`known | unknown | conditional | not_applicable | unsupported`。

整体状态按以下优先级推导：

1. 不支持国家/地区/流程 → `unsupported`。
2. 存在复杂税率、人工覆盖、关键估价不清或特殊程序 → `manual_review`。
3. 支持范围内存在未知数据、费用或过期规则 → `partial`。
4. 条件、必需输入、范围内规则和费用齐全 → `estimated`。

客户端不能指定整体状态。为审计输出 `coverage[]`，每个维度有原因码、影响字段和所需动作；不是主观准确率打分。

低货值/特殊征收程序资格须作为独立 eligibility gate：按法域、生效日、货物本征价值（不盲用含运保的CV）、渠道、客户类型及平台代征状态匹配。缺少现行政策规则时不得依靠用户填写 ordinary/false 就判定为普通完整税额；转 partial/manual_review。具体阈值只放在已审核规则中，不在代码或前端常量中写死。

从现有运费工具带入的 source_type=demo 必须贯穿请求与结果，默认只构成情景预算，overall=manual_review。客户重新填写或确认真实合同运费时保存确认来源，不能自动把演示价升级为正式运费。

## 6. 数据源与 provider 设计

### 6.1 统一接口（示意）

```go
// 金额和业务字段详见请求合同；此处只表达模块边界。
type TariffProvider interface {
    Resolve(ctx context.Context, q TariffQuery) (TariffEvidence, error)
}
type VATProvider interface {
    Resolve(ctx context.Context, q VATQuery) (VATRule, error)
}
type FXProvider interface {
    Resolve(ctx context.Context, q FXQuery) (ExchangeRate, error)
}
type FeeProvider interface {
    Resolve(ctx context.Context, q FeeQuery) ([]FeeRule, error)
}
```

`TariffQuery` 至少含法域、编码、原产国、日期、程序、补充条件；返回原文证据、结构化组件、版本、覆盖状态、法源和 fresh/stale。provider 错误分为 unavailable、not_found、unsupported_expression、conditions_missing、date_not_covered。

### 6.2 HTS 适配

- 从现有服务读取，不修改已有对外检索合同。
- 严格解析整段纯从价表达，例如整段 `6.5%`；明确无条件 `Free` 才可为零。
- 有脚注/附带条件时，必须由结构化法源或审核规则解除风险；不因正则匹配百分比就略过脚注。
- `3.5¢/kg + 6%`、`See ...`、混合符号、多选待遇不自动算。
- General 仅为基础待遇证据；没有有效的原产地待遇与 Chapter 99/贸易措施覆盖记录，overall 不能为 estimated。
- 当前快照仅证明该发布版本，不推导完整历史和未来税率。

### 6.3 TARIC 适配：必须补足机器语义

当前 [Measure](<../internal/taric/measures.go#L16-L30>) 只有 Description/Rate/Area/Regulation/Conditional；没有稳定 measure_type、order_number、additional_code、condition_code 或叠加语义。

实施采用两级策略：

1. M0 验证官方机器数据或扩展采集，能稳定获得措施 ID、类型、有效期、地域、条件和法律依据后再自动转换。
2. 在覆盖不足时，仅对审核过的“编码 + 原产国 + 日期区间 + 程序”发布结构化规则快照；其他编码保留查询和人工测算入口。

不按多语言 Description 的关键词决定是否为基础税/反倾销；不将 `Conditional=false` 当作所有适用条件都满足。审核快照可以引用抓取证据，但必须保留审核人、依据和覆盖范围。

现有 Measures 返回 stale 缓存的路径仍可用于参考，税费计算器默认不把 stale 证据自动提升为完整结果；降级并显示 checked_at。现有全局串行抓取锁不适合直接承载高并发试算，应在 provider 前置同键合并、并发/队列上限和超时；对上下文等待必须可取消。

### 6.4 英国

新增 GB provider。以 [GOV.UK Trade Tariff](https://www.gov.uk/trade-tariff) 为官方入口，验证实际 API 的授权、可用性、许可、schema、日期/原产地参数、限流与缓存要求。

本轮访问候选 API 页面返回 403，因此本文不写一个假定可用的请求地址，也不承诺已接通。可用性未通过前英国开关默认关闭；可临时支持标注 manual_review 的用户自填税率情景，但不能显示“英国自动税率”。

### 6.5 VAT

- 每国有独立 `category`、地区范围、商品范围与有效日期。
- 标准税率可来自各国税务机关/TEDB，经审核后入库；减低/零税率必须额外证明商品适用性。
- 用户选择普通标准税率情景时明确记录适用假设，不宣称系统完成归类减免审核。
- TARIC 不包含国别 VAT，禁止以 TARIC 数据版本冒充 VAT 来源版本。

### 6.6 汇率

- 各国海关适用汇率与市场汇率分开；不无条件使用 ECB/实时市场价代替法定计税汇率。
- 同币种固定精确 1；其他情况必须有方向、适用期、发布方及版本。
- 无审核汇率时用户可自填情景汇率，但结果 manual_review，并保留预算用途标记。
- V1 所有输入费用同币种；后台模板若为税费币种，可在转换后加入，不能被当作输入币种重复换汇。

### 6.7 更新与陈旧策略

- 原始来源更新、解析、样本验证、人工审核、发布活动版本分开。
- 来源抓取成功仅生成候选，不直接覆盖已审核生产规则。
- 每个规则有 `review_due_at`；到期后按来源风险策略降级，不靠统一“永久有效”。
- 外部措施查询建议 fresh TTL 不超过既有 24 小时并遵守来源要求；陈旧参考与可执行快照分开。
- 更新失败保留最近安全版本；若复核过期/法定有效期已结束，则停止完整自动结果。
- 失败告警可复用现有邮件系统，但需独立事件键、去重和只通知管理员，不向访客发送。

## 7. 数据库设计

采用增量迁移，实施时核对最新版本；禁止重建或覆盖线上数据库。首期不建匿名试算历史表。

### 7.1 `duty_tax_rule_sets`

不可变发布包：`id, revision, jurisdiction, engine_schema_version, status(draft/published/revoked), content_hash, coverage_json, reviewed_by, published_by, created_at, published_at, revoked_at`。

- 发布后不原地改 payload；新建修订。revoked 用于安全撤销，历史记录保留。
- 国家/数据类型活动指针单独维护，同一请求事务性读取同一组版本。
- 每次请求持有 resolved bundle，禁止中途读到不同 VAT/关税版本。
- 可用于正式试算的外部证据须先冻结为无客户信息的不可变 evidence snapshot；bundle记录内容hash与ID。不得仅凭可能在15分钟内变化的共享cache复算。冻结版本、官方汇率与服务费版本至少保留到所有相关凭据过期；已关联询盘的版本按询盘保留策略保存。

### 7.2 `duty_tax_rules`

`id, rule_set_id, rule_key, kind, jurisdiction, origin_scope_json, code_scope_json, region_scope_json, procedure, effective_from, effective_to, review_due_at, payload_json, source_id`。

- kind：valuation / tariff / vat / government_fee / commercial_fee / coverage / region_policy。
- payload 为版本化、严格 schema 的受控结构，不存任意 JS/Go 表达式，不使用 eval。
- 税率字段包含 type、base_selector、rate_fraction、exclusive_group、stack_group、conditions、优先级及附加代码。
- 商业费用另有 site/locale/channel/service_scope、gross/net 与服务税处理；不能混作政府规费。
- 发布校验相同作用域冲突/日期重叠；多条有效规则没有明确优先关系时拒绝发布。

### 7.3 `duty_tax_sources`

`id, publisher, official_url, legal_reference, effective_from, effective_to, retrieved_at, reviewed_at, review_due_at, source_hash, parser_version, license_note, raw_reference`。

税则证据可供多个规则引用；只有 URL 而无法核对适用范围的记录不可发布。原始证据受控保存，界面只展示安全链接及必要摘要。

### 7.4 `duty_tax_exchange_rates`

`id, rule_set_id, from_currency, to_currency, rate_decimal, effective_from, effective_to, source_id, rounding_policy_version`。唯一性按币种对 + 规则版本 + 日期段校验。

### 7.5 `duty_tax_country_settings`

`country_code, enabled, allowed_regions_json, supported_procedures_json, tax_currency, legal_timezone, active_rule_sets_json, version, updated_by, updated_at`。

- 国家启用前校验必需数据和覆盖声明。
- 设置修改乐观锁；站点没有启用工具时页面/API 共同拒绝，不只隐藏前端入口。

### 7.6 `duty_tax_enquiry_snapshots`

仅在用户同意并提交询盘后保存：`id, submission_id, site_id, locale, request_json, result_json, rule_versions_json, evidence_hashes_json, engine_version, rounding_policy_version, result_hash, created_at`。

- 与现有表单提交建立唯一关系，不用一个长字符串塞进 page_context。
- 现有 PageContext 最多 20 项、每值 500 字符；它只适合来源摘要，不能承载完整快照。
- 保存时不信任客户端结果；服务端复算并冻结。
- 站点/Locale 数据权限沿用原询盘；删除/保留策略与询盘统一，邮件尽量不复制完整敏感交易快照。
- 历史结果保留原法源与版本；重算生成新记录，不覆盖旧快照。

所有规则管理动作写现有审计服务；不额外记录公开试算货值。迁移测试覆盖旧库升级、重复启动、索引/外键和不触碰现有内容/账号/SMTP 数据。

## 8. API 合同

### 8.1 公共接口

| 方法与路径 | 用途 | 约束 |
| --- | --- | --- |
| GET `/api/public/duty-tax/countries` | 已启用国家/范围/币种 | 不暴露内部费率包及密钥 |
| GET `/api/public/duty-tax/commodity-options` | 编码候选 | country / q / date；不接货值 |
| POST `/api/public/duty-tax/calculate` | 税费预估 JSON | no-store；独立限流；严格校验 |
| POST `/api/public/duty-tax/enquiries` | 明示提交询盘 | 表单令牌、隐私同意、幂等、防篡改复算 |
| POST `/preview/{siteCode}/duty-tax/calculate` | 无 JS 预览表单 | 同一领域服务，按 siteCode 验证站点 |
| POST `/duty-tax/calculate` | 正式站无 JS 表单 | Host 解析站点；响应 noindex/no-store |
| POST `/preview/{siteCode}/duty-tax/enquiries` | 预览询盘 | 现有预览安全机制；验证环境默认禁止真实邮件 |

JSON API 的站点从 Host 或服务器可验证的预览令牌解析。若请求通过主端口的 `/preview/{siteCode}` 页面调用 API，令牌绑定 siteCode/site_id/locale；不能直接信任请求体 site_id。静态来源页面链接允许带 country/code/origin，金额和联系信息不入 URL。

### 8.2 计算请求示例（结构示例，不代表实际税率可用）

```json
{
  "destination_country": "DE",
  "destination_region": "mainland",
  "delivery_country": "DE",
  "origin_country": "CN",
  "import_date": "2026-11-10",
  "commodity_code": "6109100010",
  "classification_confirmed": true,
  "transaction_type": "ordinary_commercial_import",
  "transport_mode": "sea",
  "entry_procedure": "standard",
  "delivery_term": "DDP",
  "input_currency": "EUR",
  "valuation": {
    "mode": "guided",
    "value_basis": "goods_only",
    "goods_value": "1000.00",
    "international_freight": "100.00",
    "insurance": "10.00",
    "domestic_delivery": "20.00",
    "zero_cost_confirmations": [],
    "invoice_inclusions": [],
    "special_adjustments_present": false
  },
  "vat_category": "standard",
  "vat_category_confirmed": true,
  "commercial_fee": {
    "mode": "unknown"
  },
  "special_conditions": {
    "special_regime": false,
    "preference_claimed": false,
    "excise_goods": false,
    "special_territory": false,
    "platform_tax_collection": false
  },
  "page_token": "server-issued-site-bound-token"
}
```

商品编码仅为格式示例，不能把示例隐含为某个税率或商品适用性。用户的 false 标记只是声明，不能覆盖 provider 发现的限制、消费税或贸易救济。

如有贸易措施所需信息未知，返回明确追问/部分结果，不要求访客用勾选框证明所有不存在的税项。

### 8.3 请求子结构与互斥规则

以下为 V1 请求合同的补充约束，前后端必须同步实现，不允许 handler 自行猜测：

- `valuation.mode=guided`：商品成本输入采用互斥联合类型。`value_basis=goods_only` 时要求 goods_value 且 invoice_inclusions 为空；`value_basis=invoice_total` 时要求 invoice_total 和每项已包含费用的金额及类别，不再接受 goods_value。服务端规范化为同一成本账本；必须显式提交 value_basis，不能将省略值作为接口默认。
- `valuation.mode=declared_customs_value`：必需 declared_customs_value、customs_value_confirmed、customs_value_source（customer/broker）、included_cost_ids；实际商品/运输账本仍需提供才有到岸成本。缺少实际账本只可算已知税项，不用 CV 代替真实成本。
- `commercial_fee.mode=unknown`：无金额，partial；`mode=none_confirmed`：明确没有该项的客户声明，不代表免除政府规费；`mode=user_amount`：要求 amount、input_currency、service_tax_inclusion、scope；`mode=template`：仅传模板ID，后端校验站点/范围/版本并取值。税基处理由规则决定，客户不能通过自填标记排除应纳费用。gross/net无法确认则相关支出或VAT税基为未知。
- `fx.mode=official`：传入币种对和日期，后端选审核版本；同币种为identity；`mode=manual`：要求 rate_decimal 和确认标记，整体 manual_review，不能伪装成官方汇率。
- `rate_overrides` 仅接受受限的 scenario 子对象：kind=duty/vat、rate_fraction、原文/依据备注和确认标记；始终 manual_review，并在独立 scenario_components 返回。原自动组件及其缺失项不被覆盖，不发布完整 totals。
- 税率、汇率输入范围和精度上限由受控 schema 配置并经边界测试；超过上限报错，不截断、钳制或四舍五入接受。业务税率不存在通用100%上限，不能把合法高税率静默变成100%。
- 政府规费所需 entry_procedure、运输方式、港口/豁免等由各国家能力元数据声明；缺少适用性条件返回字段追问或 unknown，不默认“formal且无豁免”。
- special_conditions 各字段支持 true/false/null；null表示客户不知道，不使用 false 零值隐式填充。需要补充核实的法定条件仍由 provider/规则判定。
- 对当前版本未知字段使用严格解码拒绝，长度和枚举清单前后端一致；JSON与无JS表单规范化到同一请求类型。

### 8.4 结果合同（字段示意）

```json
{
  "status": "partial",
  "tax_currency": "EUR",
  "engine_version": "dutytax-v1",
  "rounding_policy_version": "estimate-half-up-line-v1",
  "rule_versions": {"tariff": "...", "vat": "...", "fees": "..."},
  "components": [
    {
      "key": "base_duty",
      "kind": "duty",
      "status": "known",
      "amount": "55.50",
      "base": "1110.00",
      "rate_fraction": "0.05000000",
      "rule_id": "fixture-only",
      "source_refs": ["..."]
    },
    {
      "key": "commercial_clearance",
      "kind": "commercial_fee",
      "status": "unknown",
      "amount": null,
      "reason_code": "commercial_fee_missing"
    }
  ],
  "known_subtotals": {"taxes": "55.50", "government_fees": "0.00", "import_costs": "55.50"},
  "totals": {"taxes": null, "import_costs": null, "landed_cost_with_tax": null},
  "coverage": [
    {"key": "vat_base", "status": "unknown", "reason_code": "included_service_expenses_unconfirmed"}
  ],
  "assumptions": [],
  "excluded_items": [],
  "sources": [],
  "estimate_token": "short-lived-hmac-proof",
  "expires_at": "..."
}
```

上例数字来自第 12 节纯计算夹具，不用于生产；实际 components 必须列出 VAT 和所有适用/未知组件，上例省略部分仅展示合同形状。`known government_fees=0` 只有全部费用已确定不适用才允许；否则需 coverage 指明“当前已知部分为零，仍有未知项”，不能把它理解成规费总额。

### 8.5 HTTP 状态

- 200：请求可处理，包括 estimated/partial/manual_review/unsupported 业务结果。
- 400：JSON、类型、长度或格式无效。
- 403：来源或站点/预览令牌无效。
- 409：询盘提交时规则已撤销/凭据失效/结果需刷新，或幂等键冲突。
- 422：字段组合缺失或不一致，返回 `field_errors` 与可操作提示。
- 429：频率超限，附 Retry-After。
- 503：核心服务不可用，无法形成可信结果；若只有某 provider 不可用而能输出有价值的部分结果，返回 200 partial。

统一错误 code 用稳定枚举；本地化文案与内部错误分开，禁止向访客返回 SQL、密钥或上游完整错误页。

### 8.6 管理接口

拟放在 `/api/v1/system/duty-tax` 下：

- GET `/status`、`/countries`、`/rule-sets`、`/sources`。
- POST `/rule-sets` 创建草稿；PATCH `/rule-sets/{id}` 乐观锁更新草稿。
- POST `/rule-sets/{id}/validate` 与 `/simulate`。
- POST `/rule-sets/{id}/publish`、`/revoke`。
- PATCH `/countries/{country}` 开关及活动版本。

所有接口要求 session + system.manage；所有写操作加 requireCSRF 和审计。发布/撤销显示影响范围，建议敏感操作再认证并支持业务审核记录；不直接开放文件路径或任意公式执行。

## 9. 询盘与防篡改设计

1. 计算不落交易历史库，只返回结果和 15 分钟短期 HMAC 凭据。
2. 凭据载荷仅含 site_id、locale、request_hash、result_hash、engine_version、rule_versions、nonce、expires_at；不把交易原文塞入 URL/令牌。
3. 使用现有 Keyring 派生专用用途密钥；不复用登录 cookie 密钥上下文，不硬编码密钥。
4. 提交时携带原请求、estimate_token、联系方式、隐私同意、表单反机器人字段和幂等键。
5. 服务端校验凭据、输入 hash、站点、有效期，并使用冻结的有效版本复算；数据包已撤销或过期政策要求重核时返回 409，请用户刷新确认，不能悄悄改价后保存。
6. 表单提交、结果快照和邮件 outbox 同一业务事务或可恢复原子机制完成。网络发送不放进数据库事务，落库成功后由现有队列处理。
7. 幂等键按站点/凭据 nonce/有效期绑定并持久化唯一约束；重复点击不重复创建询盘或邮件。
8. 输入 hash 与来源版本可审计；客户填的结果文本不能提升税率可信度。
9. 无 JS 流程使用相同服务和隐藏表单凭据；表单令牌与估算凭据职责不同，不用其中一个替代另一个。

来源页面预填使用 POST 或标签页内临时状态；不以查询串传递货值。sessionStorage 如使用，只保存客户明确操作的临时草稿，刷新/关闭策略说明并提供清除；默认不持久化到 localStorage。

## 10. 前端与页面集成

- 共享 Go 页头/页脚与现有询盘组件风格；公式和金额只有服务端版本。
- 国家切换清除不兼容编码/税率/规则凭据，用户费用输入可保留但要求确认币种与税基。
- 请求使用 AbortController + 序号，晚返回不能覆盖当前国家/编码；关键字段编辑立即标记旧结果过期。
- 不用输入每个金额字符就访问外部税则接口。编码候选限速，金额计算点击提交。
- Loading 禁用重复按钮但保留取消/重试；网络失败保留输入，旧结果只可作为明确历史参考，不显示当前完整总额。
- 源代码使用固定 key 和 JSON 字典；货币/百分比由 Intl 本地化展示，数值合同不变。
- 对结果可达性设置 role/status、错误摘要和焦点移动，不只依靠颜色区分部分结果。
- 原生 POST 提供无 JS 降级：字段校验、候选确认、结果和询盘提交均保留。
- 打印页面包含输入口径、版本、时间、假设、未计项、结果状态；隐藏纯操作按钮，不隐藏风险。
- SEO 内容不得承诺实时税费、保证包税或覆盖所有国家。带参数页 noindex，POST 结果 no-store，无计算数据出现在 analytics URL。
- HTML 数据使用 html/template 和安全 JSON 序列化；前端使用 textContent，禁止将上游措施原文直接 innerHTML。

Go 页面集成需同步：模板 ParseFS、embed、publicSitePageData、固定路径判定、站点页脚、HTS/TARIC 链接、sitemap、预览 noindex 与 CSP。涉及 React 首页入口时重建相应模板产物，再重建 Go；只改 TSX 不会改变已内嵌程序。

## 11. 性能与安全

### 11.1 初始预算（待压测调整）

- 纯计算内核本机 P95 目标 < 20ms；有本地完整规则的 HTTP P95 目标 < 500ms，均是待验证目标。
- 计算 API 初始每 IP 20 次/分钟、burst 5；候选 60 次/分钟；询盘沿用并补充站点维度限制。
- JSON body 上限 32KiB，商品描述 500 字符；V1 只有一个商品对象，不接无限数组。
- 外部 provider 并发建议每来源最多 2，同键合并；队列等待和整体请求可取消。
- 外部请求超时总预算应小于现有默认请求超时（当前默认 10 秒）；建议上游单次 <= 5 秒，失败即降级，不在请求内无限重试。
- 外部响应大小限制、固定 HTTPS 域名白名单、重定向再校验、TLS 证书验证。schema 变更失败不返回零税率。

### 11.2 缓存边界

- 缓存不含客户货值：只缓存编码/原产地/日期/条件对应的公共税则证据。
- Key 至少含 jurisdiction、region、code、origin、date、procedure、conditions_hash、source_version/parser_version；缓存发布包还含 active revision。
- 用户商业费用/汇率情景不进入共享缓存。
- 计算结果响应 `Cache-Control: private, no-store`，反向代理/CDN 不得缓存 POST/带交易信息页面。
- 单一当前国家开关与规则撤销及时失效缓存；不得沿用已撤销版本给新请求。

### 11.3 安全清单

- 不接受用户指定上游 URL，避免 SSRF。
- 私密请求体和货值不进入访问日志/错误跟踪；只统计状态、耗时、国家与原因码。
- 公共计算验证 same-origin/表单令牌并限流，管理写接口 CSRF + RBAC。
- 不解密或输出无关 SMTP/AI/Git 凭据；外部密钥只服务端存储并使用既有加密机制。
- 服务费模板不可跨站点泄露；结果快照按原表单的数据权限读取。
- 预览/测试禁用真实 SMTP 和自动更新，不能运行生产数据库上的集成测试。

## 12. 确定性测试与算例

**本节全部税率、规费和 VAT 数字都是测试夹具，不代表当前任何实际商品的法定税负；不可作为生产 seed。**

### T1 EU 普通分项、各项已确认

```text
商品 G                   1000.00 EUR
国际运费 F                100.00 EUR
保险 I                     10.00 EUR
CV                       1110.00 EUR  # 夹具指定这三项全部进入 CV
基础关税率                   5%      # 虚构夹具
关税 D                     55.50 EUR
相关境内费用 L              20.00 EUR
清关服务 B                  30.00 EUR  # 夹具指定全额进入 VAT 基础，客户支出30，无另收服务VAT
VB = 1110 + 55.50 + 20 + 30 = 1215.50 EUR
VAT 夹具率                  20%
V                         243.10 EUR
税项合计                   298.60 EUR
进口附加成本 = D + V + B    328.60 EUR  # 此定义不含已在物流账本的 L
到岸成本 = G+F+I+L+B+D+V   1458.60 EUR
```

夹具明确没有其他适用税/规费，其他措施的完整覆盖由测试证据确认。生产中只有同等证据齐全才能为 estimated。改变 DDP/DAP，以上金额逐项不变。

### T2 发票包含国际运费与保险

```text
发票合计 1110.00，其中货物1000、运费100、保险10。
规范化实际成本 G=1000，F=100，I=10。
CV=1110，而不是1220；其他条件与T1相同，结果必须与T1完全一致。
```

### T3 美国纯计算夹具

```text
已确认 CV = 商品实际成本 = 10000.00 USD
可分列且在该夹具估价下不进入CV的国际运保费 = 1000.00 USD
基础关税率 5%，已审核附加率10%，允许同基数叠加：D=1500.00
MPF夹具：0.3%，最低25、最高100 → 30.00
HMF夹具：符合海运征收条件，0.1% → 10.00
商业报关费用：80.00，无其他费用或服务税
VAT：not_applicable
税项合计=1500.00；政府规费=40.00
进口附加成本=1500+40+80=1620.00
到岸成本=10000+1000+1620=12620.00 USD
```

将运输方式改为空运且夹具规则规定 HMF 不适用：HMF=null/not_applicable，完整政府规费=30.00，到岸成本12610.00。任何实际法定值均由正式规则提供。

### T4 未覆盖附加税

基础关税已知，但贸易救济/附加措施覆盖 unknown：overall=partial；完整 duty、VAT 基础及依赖 VAT 为未知。已知基础税可以显示，完整 total_tax/landed_cost=null。不得用 “+0” 补足未知项。

### T5 复杂税率

`3.5¢/kg + 6%`、`MIN/MAX ...`、有条件 Free、配额、多个待遇等：不自动抽取6%；manual_review，保留原文和官方链接。

### T6 规费夹具边界

税基1000 × 0.3%=3，适用25下限 →25；税基100000 ×0.3%=300，适用100上限 →100。按一票计算一次，不随件数重复。

### T7 精度和合计

输入 `0.10`、`0.20`、50%时不出现二进制浮点尾差；`0.01 × 50%` 默认 HALF_UP=0.01。采用第三位小数在4/5/6边界、接近应用金额上限、汇率8位小数、零税率和空值测试。展示合计必须等于被包含组件的展示金额之和。

### T8 数据与交易一致性

- 相同输入+相同 bundle/hash/engine 逐字节规范化结果一致。
- 发布新规则只影响新请求；旧询盘快照不被修改。
- 税率/成本/站点 ID 篡改、令牌过期/撤销、重复提交得到明确失败或幂等结果。
- 外部返回403/超时/空结构/陈旧缓存不生成0税率；部分依赖传播一致。

### 12.1 测试层次

1. 单元：金额解析、估价、税率语法、规则匹配、叠加/互斥、日期、状态传播和公式。
2. provider 契约：使用合法保存的官方样本，固定 schema、法源、条件；运行时不依赖联网。
3. SQLite 集成：迁移、发布事务、乐观锁、规则冲突、快照、询盘/邮件幂等、权限隔离。
4. HTTP：编码页预填、预览/Host解析、Origin/CSRF、限流、错误、no-store和无JS POST。
5. 前端：金额本地化、取消/竞态、字段失效、复制/打印、国家/编码重选。
6. 浏览器：六语站、桌面1440及手机320/390/768、键盘、无JS、弱网、接口异常；不把模拟视口当实体设备验证。
7. 人工法税复核：每个启用国家至少普通从价/零基础税/特殊措施/费用不全等真实案例；保存编码、日期、来源及复核人，不公开交易资料。

建议命令（实现后再执行，本次未运行）：

```sh
go test ./internal/dutytax/... ./internal/httpserver ./internal/app ./internal/database
go test ./...
go vet ./cmd/... ./internal/...
node --test frontend/tests/*.test.mjs
node scripts/verify-duty-tax.cjs
```

## 13. 实施拆分与完成定义

| 批次 | 任务 | 完成门槛 |
| --- | --- | --- |
| M0 | 法源/数据与许可、真实样本、英国API验证、国家覆盖矩阵 | 业务确认范围；不能核实的来源形成显式缺口 |
| M1-A | 领域类型、金额、账本、估价、覆盖依赖图 | T1–T7固定夹具及错误用例通过 |
| M1-B | 规则库、不可变发布、国家开关、provider | 来源证据可追踪，冲突/过期/撤销可阻断 |
| M1-C | 美国/EU/GB逐个适配 | 每国单独验收；未完成国家保持关闭 |
| M2-A | 页面、六语、SSR降级、编码/运费入口 | 同一服务端结果，多端/无JS可用 |
| M2-B | 询盘快照、幂等、防篡改、邮件 | 仅明示提交后落库，不重复邮件 |
| M2-C | 后台规则维护、审核、审计与监控 | 业务可停用问题规则，不需手工改数据库 |
| M3 | 数据副本演练、浏览器/安全/性能、灰度发布 | 真实案例复核+回退演练+上线检查清单通过 |

不能只交付前端计算器就宣称完成；国家税率/费用来源、数据审核和运维开关都是首期范围。纯手动情景可作为内部验证，但不替代目标中的自动税费能力。

## 14. 发布与回退

1. 先备份线上数据库和规则版本；在隔离副本演练，禁 SMTP 和自动同步，不将副本换回线上。
2. 新表/字段以兼容增量方式迁移，不修改现有账号、文章、询盘、SMTP和站点配置。
3. 前端模板/资源和 Go 程序一起发布；若部署环境有静态 HTML 快照，也核对入口与缓存版本。
4. 默认国家开关关闭；先后台真实样例试算，再按国家灰度启用。
5. 上线核对 clean URL可收录、结果noindex/no-store、所有站点/预览、无货值URL/日志及非预期邮件。
6. 规则错误先关闭对应国家/撤销版本；保留参考查询和人工询价，不影响已有 HTS/TARIC查询。
7. 程序回滚切回上版兼容二进制及对应静态资源；保留实时数据库和询盘，不用旧数据库覆盖新业务记录。
8. 已保存快照标出规则撤销风险，人工后续复核；不无声修改历史金额。

监控至少包含：provider失败率、规则复核过期、unknown/conditional占比、请求状态、耗时、限流、询盘转化与异常重复邮件。指标不得采集具体货值/客户联系方式。

## 15. 官方依据与实施前阻断项

已于2026-11-10查阅：

- [欧盟进口VAT基础](https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/taxable-amount_en)。
- [欧盟VAT税率框架及TEDB入口](https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en)。
- [TARIC官方范围说明](https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/eu-customs-tariff-taric_en)：VAT/消费税不在其内。
- [HMRC进口VAT估价](https://www.gov.uk/guidance/working-out-the-vat-value-using-the-customs-value-of-the-imported-goods)。
- [英国VAT类别](https://www.gov.uk/vat-rates)与[英国税则入口](https://www.gov.uk/trade-tariff)。
- [CBP规费表及法源提示](https://www.cbp.gov/trade/basic-import-export/user-fee-table)：网页自身提示可能滞后，正式费率要按当前法规核验。
- [ICC术语入口](https://iccwbo.org/business-solutions/incoterms-rules/incoterms-2020/)。

实施前必须补齐：美国现行估价与附加税/排除法源、各国具体VAT适用范围、低货值制度与征收程序、GB数据接口和许可、海关汇率、规费有效期、服务费真实来源与特殊领土矩阵。当前文档没有证明这些数据已经具备，不得把测试夹具、市场运费演示或抓取文本直接作为生产税费承诺。
