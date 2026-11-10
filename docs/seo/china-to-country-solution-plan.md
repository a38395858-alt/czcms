# 「从中国运输到 XX 国」解决方案页 — 文案与板块方案

> 状态：方案稿，待确认后进入实现
> 适用：freightvanta.com（US）、de / fr / es / it / nl 六个子站
> 日期：2026-11-03

---

## 一、结论先行

1. **这是一个「线路页（lane page）」，不是新闻页。** 不放 "Latest update / 本月运价" 这类会过期的内容，
   全部板块做成常青结构，一年后仍然成立。
2. **六个站共用一套骨架，不共用一套文案。** 骨架（板块顺序与目的）一致，标题、关键词、合规重点
   按国家重写 —— 美国讲 ISF / Section 301，德国讲 EORI / Einfuhrumsatzsteuer，法国讲 EPR / Triman。
3. **最大的分歧点是「要不要放价格」。** 竞品都在放价格表，但本站现有的编辑规范明确要求
   "no unverified claims"。见第六节，需要你拍板。

---

## 二、竞品拆解（证据）

### 样本 A：CARGOLO — 德国

https://www.cargolo.com/de/versand-von-china-nach-deutschland/

板块顺序：

```
H1 Versand von China nach Deutschland
  → 询价入口（持货地/目的地/日期）
  → 三个信任数字（150+ 伙伴 / 1700+ 报价 / 4 条运输方式）
  → H2 成本：分运输方式 × 分货量的中位数与区间表
  → H3 一个完整价格包含什么（费用构成表）
  → H3 我们需要哪些信息
  → H2 运输方式对比：See / Bahn / Luft / LKW
     → 每个方式一个小节 + 何时划算 + 询价按钮
  → 计算器入口
```

它的语言特征：**Sammelgut**（拼箱）、**Komplettcontainer**（整柜）、**Einfuhrumsatzsteuer**（进口增值税）、
**Zollabfertigung**（清关）、**Laufzeit**（时效）、**Incoterm**。全是德国进口商实际会用的词。

### 样本 B：ZHL — 法国

https://zhlfreight.com/shipping-from-china-to-france/

板块顺序：

```
H1 Shipping from China to France | Costs, Transit Times & Customs Guide
  → 合规导语（Regime 42 取消 / 20% TVA / EPR + Triman）
  → 运价表（按方式）
  → 到岸成本由什么决定
  → 选哪种方式（决策表）
  → 港口选择（Le Havre vs Marseille-Fos）
```

它的语言特征：**dédouanement**（清关）、**TVA à l'importation**（进口增值税）、
**EPR / Triman**（法国特有的生产者责任延伸）、**dégroupage**（拆箱）。

### 两个样本的共同点

| 共同点 | 说明 |
|---|---|
| 价格必须出现 | 两个样本都把成本放在首屏之后第一屏 |
| 时效必须出现 | 每个运输方式都标天数 |
| 合规单列一节 | 而且是该国特有的合规，不是通用套话 |
| 有「需要你提供什么」 | 降低询价摩擦 |
| 有方式对比表 | 帮用户自己做决策 |

---

## 三、页面骨架（10 个板块）

对应现有的 10 种 section 类型，无需新增组件。

| # | 板块 | 组件类型 | 目的 | SEO 作用 |
|---|---|---|---|---|
| 1 | Hero | `hero` | 一句话说清「中国 → 目的国」，给主 CTA | H1 承载主关键词 |
| 2 | 线路概览 | `decision` | 起运港/机场、目的港、可用方式 | 承载「港口/机场」长尾词 |
| 3 | 方式对比 | `comparison` | 海运/空运/铁路/快递，各自适合什么 | 承载「sea freight / air freight」词族 |
| 4 | 成本构成 | `scopeTable` | 一个完整报价包含哪几块，容易漏什么 | 承载「cost / 费用」词族 |
| 5 | 门到门流程 | `workflow` | 6 步：提货→出口→主段→进口→派送→签收 | 承载「door to door」词族 |
| 6 | 单证与合规 | `checkpoints` | 目的国特有的清关要求 | 承载「customs / Zoll / douane」词族 |
| 7 | 货物场景 | `scenarios` | 电商补货 / 家具 / 机械 / 样品 | 承载场景长尾词 |
| 8 | 需要你提供 | `checklist` | 询价所需信息 | 降低跳出 |
| 9 | FAQ | `faq` | 6–8 问，出 FAQPage schema | 抢 People Also Ask |
| 10 | 相关 + 询盘 | `related` + `enquiry` | 内链 + 转化 | 内链权重 |

**刻意不放的板块**：新闻式更新、月度运价播报、客户评价墙。前两个会过期，第三个没有可信数据源。

---

## 四、六个语种的关键词语义表

### 4.1 英语（freightvanta.com → 美国）

| 类型 | 关键词 |
|---|---|
| 主词 | shipping from China to USA |
| 次词 | China to USA freight forwarder / ocean freight China to US / air freight China to US |
| 长尾 | door to door shipping from China to USA / cost to ship from China to USA / how long does shipping from China to USA take / FCL vs LCL from China / customs clearance China to USA |
| 语义场 | freight forwarder, customs broker, ISF (Importer Security Filing), HTS code, Section 301 tariff, drayage, port of Los Angeles / Long Beach, Savannah, Houston, LCL, FCL, CBM, demurrage |

美国语境注意：
- 必须出现 **ISF**（10+2 申报，船开前 24 小时）和 **Section 301**（对华加征关税），这是美国进口商最关心的两件事，德国/法国的合规词在英文页里不要出现。
- 用 **"customs broker"** 而不是 "customs agent"，美国行业习惯不同。
- 度量用 **磅/立方英尺 可省略**，但 CBM 和 kg 行业通用，保留。

### 4.2 德语（de.freightvanta.com）

| 类型 | 关键词 |
|---|---|
| 主词 | Versand von China nach Deutschland |
| 次词 | China Transport / Spedition China Deutschland / Seefracht China Deutschland |
| 长尾 | Kosten Versand China Deutschland / Laufzeit Seefracht China / Sammelgut China / Zollabfertigung China Import / Container aus China |
| 语义场 | Sammelgut (LCL), Komplettcontainer (FCL), Einfuhrumsatzsteuer (19%), Zollanmeldung, EORI-Nummer, Incoterm, Laufzeit, Seefracht, Luftfracht, Bahnfracht, CBM, Verzollung |

德语语境注意：
- **Sammelgut** 是德国人对 LCL 的日常说法，只写 "LCL" 会丢失搜索量。
- **Einfuhrumsatzsteuer** 必须提，19% 是德国进口商算成本的核心；
- 德国人偏好 **Sie** 还是 **du**：B2B 物流一律用 **Sie**，现有德文站已经是 Sie，保持一致。
- 复合词要用连字符或软连字符断行（现有站点已处理）。

### 4.3 法语（fr.freightvanta.com）

| 类型 | 关键词 |
|---|---|
| 主词 | expédition Chine France |
| 次词 | fret Chine France / transport maritime Chine France / transitario 不可用（那是西语） |
| 长尾 | délai de transit Chine France / dédouanement import Chine / coût fret Chine France / conteneur Chine France / groupage Chine |
| 语义场 | dédouanement, TVA à l'importation (20%), EPR, Triman, groupage (LCL), conteneur complet (FCL), connaissement (B/L), incoterm, délai |

法语语境注意：
- **groupage** 是 LCL 的法语说法；
- 法国特有的 **EPR + Triman** 标识要求，是法国海关扣货的高频原因，值得单列；
- 用 **vous**，现有法文站已是 vous。

### 4.4 西班牙语（es.freightvanta.com）

| 类型 | 关键词 |
|---|---|
| 主词 | envío de China a España |
| 次词 | transitario China España / flete marítimo China España / transporte aéreo China |
| 长尾 | cuánto cuesta enviar de China a España / tiempo de tránsito China España / despacho de aduanas importación / contenedor China España / grupaje |
| 语义场 | transitario (货代), despacho de aduanas, IVA a la importación (21%), grupaje (LCL), contenedor completo (FCL), conocimiento de embarque, plazo de tránsito |

西班牙语语境注意：
- **transitario** 是西班牙本土对货代的说法（拉美多用 agente de carga），用 transitario；
- **grupaje** = LCL；
- 用 **usted**（B2B 正式），与现有西语站一致。

### 4.5 意大利语（it.freightvanta.com）

| 类型 | 关键词 |
|---|---|
| 主词 | spedizione dalla Cina all'Italia |
| 次词 | spedizioniere Cina Italia / trasporto marittimo Cina Italia / trasporto aereo Cina |
| 长尾 | quanto costa spedire dalla Cina / tempi di transito Cina Italia / sdoganamento importazione / container Cina Italia / groupage |
| 语义场 | spedizioniere, sdoganamento, IVA all'importazione (22%), groupage (LCL), container completo (FCL), polizza di carico, resa Incoterm |

意大利语语境注意：
- **sdoganamento** 是清关的标准词；
- **spedizioniere** = 货代；
- 用 **Lei**（正式）。

### 4.6 荷兰语（nl.freightvanta.com）

| 类型 | 关键词 |
|---|---|
| 主词 | verzending van China naar Nederland |
| 次词 | zeevracht China Nederland / luchtvracht China / expediteur China Nederland |
| 长尾 | kosten verzending China Nederland / levertijd zeevracht China / douane-inklaring import / container China Nederland / groupage |
| 语义场 | expediteur (货代), douane-inklaring, btw bij invoer (21%), groupage (LCL), volledige container (FCL), cognossement, levertijd |

荷兰语语境注意：
- **expediteur** 是货代；
- **btw bij invoer** = 进口增值税；
- 荷兰是鹿特丹转口枢纽，可强调「经鹿特丹进入欧洲内陆」；
- 用 **u**（正式）。

---

## 五、英文页完整文案（母版）

> 其余五个语种按此结构翻译重写，不是逐字机翻。

**URL**：`/china-to-usa-shipping`
**Meta title**：`Shipping from China to the USA: Ocean, Air & Door-to-Door Plans | FreightVanta`
**Meta description**：`Plan a shipment from China to the United States: supplier pickup, export documents, ocean or air freight, US customs, and delivery to the final address.`

### Hero

- kicker：`China → United States`
- H1：`Shipping from China to the United States, planned as one sequence.`
- body：`Supplier pickup, export documents, the ocean or air leg, ISF and customs entry, then delivery to the final address. One plan shows each handoff, who owns it, and what is still open.`
- 主 CTA：`Request a China–US shipping plan`
- 次 CTA：`See the door-to-door steps`
- rail：
  1. `Supplier pickup`
  2. `Export clearance`
  3. `Ocean or air leg`
  4. `ISF and customs entry`
  5. `Delivery and proof of delivery`

### 板块 2 — 线路概览（decision）

H2：`What decides the route into the United States`

正文要点：
- 起运：深圳 / 上海 / 宁波 / 青岛 出发，华南与华东的截关时间不同
- 目的港：Los Angeles / Long Beach（美西）、Savannah / New York（美东）、Houston（墨湾）
- 空运：PVG / HKG → LAX / ORD / JFK
- 决定因素：体积（CBM）、时效、货值、目的 ZIP、是否整柜

### 板块 3 — 方式对比（comparison）

H2：`Ocean, air, rail, or express: what each one is for`

| 方式 | 适合 | 时效（行业区间，待运营确认） | 成本特征 |
|---|---|---|---|
| Ocean FCL | ≥ 约 15 CBM，可等 | 美西约 14–20 天港到港 | 单柜成本最低 |
| Ocean LCL | 1–15 CBM | 约 18–30 天门到门 | 按 CBM 计，有最低收费 |
| Air freight | 高货值、急件 | 约 5–8 天门到门 | 按计费重量，抛重比 1:6000 |
| Rail / 多式联运 | 内陆点 | 视线路 | 介于海空之间 |
| Express | < 100 kg 样品 | 3–5 天 | 单价最高，门到门最省事 |

> 时效数字标 **[待运营确认]** 后再上线；不确认则改为定性描述（"faster than ocean, costlier per kg"）。

### 板块 4 — 成本构成（scopeTable）

H2：`What a complete China–US quote has to cover`

| 环节 | 谁负责 | 容易漏掉的部分 |
|---|---|---|
| 中国端提货 | 供应商 / 我方 | 工厂装卸费、等待费 |
| 出口报关 | 我方 | 商检、出口退税资料 |
| 主段运费 | 我方 | 旺季附加费 PSS、燃油附加费 |
| 美国清关 | 进口商 / 报关行 | ISF 申报、HTS 归类、Section 301 附加税 |
| 目的港费用 | 收货人 | 码头操作费、滞箱费 demurrage |
| 派送 | 我方 | 住宅地址附加费、尾板费、预约费 |

### 板块 5 — 门到门流程（workflow）

H2：`Six handoffs from the supplier door to the US address`

1. `Supplier pickup` — 确认备货完成时间与装车条件
2. `Export clearance` — 报关资料与截关时间对齐
3. `Main leg` — 订舱/订舱位，拿到可核对的船期或航班
4. `ISF and customs entry` — 船开前 24 小时完成 ISF；到港前完成 entry
5. `Port to door` — 提柜、拆柜、预约派送
6. `Proof of delivery` — 签收单与异常记录归档

### 板块 6 — 单证与合规（checkpoints）

H2：`US import requirements that stop shipments most often`

- `ISF (10+2)` — 未按时申报会产生罚款，必须在装船前 24 小时提交
- `HTS classification` — 归类决定关税税率与 Section 301 附加税
- `Section 301 tariffs` — 中国原产货物多数在加征清单内，需按 HTS 核对
- `Commercial invoice & packing list` — 金额、原产地、贸易术语必须一致
- `FDA / EPA / FCC` — 按品类触发，食品接触材料、电子、化学品常被忽略
- `Bond` — 进口商需有单次或年度海关保证金

### 板块 7 — 货物场景（scenarios）

H2：`Where this lane is usually used`

- `E-commerce restock` — 补货节奏与 FBA 入仓预约
- `Furniture and home goods` — 体积大、抛重高，LCL 与 FCL 的临界点
- `Industrial components` — 规格书与到货批次一致性
- `Samples and launch stock` — 空运或快递，抢上市时间

### 板块 8 — 需要你提供（checklist）

H2：`What we need to price the lane`

- 中国提货地址与联系人
- 目的地址（含 ZIP）与收货时间窗
- 件数、外箱尺寸、毛重，或整柜需求
- 货物描述与 HS 编码（如已知）
- 期望到货日与可接受的时效区间
- 贸易术语（FOB / EXW / DDP 等）

### 板块 9 — FAQ（6 条）

1. `How long does shipping from China to the USA take?`
2. `What does it cost to ship a 20ft or 40ft container from China?`
3. `Do I need a customs bond to import into the US?`
4. `What is ISF and when must it be filed?`
5. `Is LCL or FCL cheaper for my volume?`
6. `Can you ship door to door and handle customs?`

### 板块 10 — 相关（related）

- `Ocean freight` → `/services/...`
- `Air freight`
- `Customs coordination`
- `Warehousing & fulfillment`
- `China product sourcing`

### 询盘

- 标题：`Tell us the product, the route, and the date you need it.`
- 按钮：`Request a China–US shipping plan`

---

## 六、德文页完整文案（对照样本）

**URL**：`/versand-china-deutschland`
**Title**：`Versand von China nach Deutschland: Seefracht, Luftfracht & Tür-zu-Tür | FreightVanta`
**Description**：`Sendung von China nach Deutschland planen: Abholung beim Lieferanten, Export, Seefracht oder Luftfracht, Zollabfertigung und Zustellung bis zur Zieladresse.`

### Hero

- kicker：`China → Deutschland`
- H1：`Versand von China nach Deutschland – als eine durchgehende Kette geplant.`
- body：`Abholung beim Lieferanten, Exportdokumente, Seefracht oder Luftfracht, Zollabfertigung und Zustellung bis zur Zieladresse. Ein Plan zeigt jede Übergabe, wer sie verantwortet und was noch offen ist.`
- 主 CTA：`Transport von China nach Deutschland anfragen`

### 板块标题（德文）

| 板块 | 德文标题 |
|---|---|
| 线路概览 | `Was die Route nach Deutschland entscheidet` |
| 方式对比 | `Seefracht, Luftfracht, Bahn oder Kurier: wofür was passt` |
| 成本构成 | `Was ein vollständiges Angebot enthalten muss` |
| 流程 | `Sechs Übergaben von der Lieferantentür bis zur Zieladresse` |
| 合规 | `Was bei der Einfuhr nach Deutschland am häufigsten blockiert` |
| 场景 | `Wofür diese Route typischerweise genutzt wird` |
| 需要你提供 | `Was wir für ein Angebot brauchen` |
| FAQ | `Häufige Fragen zum Versand von China nach Deutschland` |

### 德国合规要点（这节必须本地化，不能照搬美国）

- `EORI-Nummer` — 进口商必须有
- `Einfuhrumsatzsteuer` — 19%，可作 Vorsteuer 抵扣
- `Zollanmeldung` — 通过 ATLAS 申报
- `CE / Produktsicherheit` — 按品类触发
- `Verpackungsregister LUCID` — 包装法注册，德国特有
- `Incoterm` — 决定谁承担哪一段

---

## 七、其余四语：标题与关键句

### 法语

- H1：`Expédition de Chine vers la France, organisée comme une seule chaîne.`
- 板块标题：`Ce qui détermine la route vers la France` / `Maritime, aérien, ferroviaire ou express` / `Ce qu'un devis complet doit couvrir` / `Six étapes du fournisseur à la livraison` / `Les exigences douanières qui bloquent le plus souvent` / `À quoi sert cette ligne` / `Ce dont nous avons besoin pour chiffrer`
- 合规：`TVA à l'importation 20 %`、`EPR`、`logo Triman`、`numéro EORI`

### 西班牙语

- H1：`Envío de China a España, planificado como una sola cadena.`
- 板块标题：`Qué determina la ruta hacia España` / `Marítimo, aéreo, ferroviario o exprés` / `Qué debe cubrir una cotización completa` / `Seis entregas desde el proveedor hasta la puerta` / `Los requisitos aduaneros que más bloquean` / `Para qué se usa esta ruta` / `Qué necesitamos para cotizar`
- 合规：`IVA a la importación 21 %`、`número EORI`、`despacho de aduanas`

### 意大利语

- H1：`Spedizione dalla Cina all'Italia, pianificata come un'unica catena.`
- 板块标题：`Cosa determina la rotta verso l'Italia` / `Marittimo, aereo, ferroviario o espresso` / `Cosa deve coprire un preventivo completo` / `Sei passaggi dal fornitore alla consegna` / `I requisiti doganali che bloccano più spesso` / `A cosa serve questa rotta` / `Cosa ci serve per quotare`
- 合规：`IVA all'importazione 22 %`、`numero EORI`、`sdoganamento`

### 荷兰语

- H1：`Verzending van China naar Nederland, gepland als één keten.`
- 板块标题：`Wat de route naar Nederland bepaalt` / `Zee, lucht, spoor of koerier` / `Wat een complete offerte moet dekken` / `Zes overdrachten van leverancier tot voordeur` / `De douane-eisen die het vaakst blokkeren` / `Waarvoor deze route wordt gebruikt` / `Wat we nodig hebben voor een offerte`
- 合规：`btw bij invoer 21 %`、`EORI-nummer`、`douane-inklaring`、`鹿特丹转口`

---

## 八、SEO 落地清单

| 项 | 做法 |
|---|---|
| URL | EN `/china-to-usa-shipping`；DE `/versand-china-deutschland`；FR `/expedition-chine-france`；ES `/envio-china-espana`；IT `/spedizione-cina-italia`；NL `/verzending-china-nederland` |
| H1 | 每页一个，含「中国 → 目的国」 |
| H2 | 8 个，覆盖方式/成本/清关/时效四个词族 |
| Schema | `Service` + `FAQPage` + `BreadcrumbList` |
| 内链 | 从 Solutions 菜单进来；页内链到 6 个服务页 + 4 个行业页；从相关服务页回链 |
| hreflang | 六语互指（站点已具备） |
| 图片 alt | 含线路语义，如 `Container terminal at the Port of Los Angeles` |
| 更新信号 | 不放日期；用「结构常青 + 数据可核对」 |

---

## 九、需要你确认的四件事

1. **价格放不放？**
   竞品都放。本站现有规范禁止未核实数字。三个选项：
   - A. 只讲「成本由什么构成」，不放数字（最安全，转化靠询盘）
   - B. 放区间，但标注「以实际报价为准」并由运营提供数据
   - C. 放「按货量估算」的区间表（需要真实历史数据支撑）

2. **时效数字从哪来？**
   我可以先写定性描述，也可以等你给运营口径后填具体天数。

3. **六个站同时上，还是先 en + de？**
   建议先做 en + de 验证转化，再复制到 fr/es/it/nl。

4. **URL 用 `/china-to-usa-shipping` 还是挂在 `/solutions/china-to-usa`？**
   前者对 SEO 更直接，后者对站点结构更整齐。

---

## 十、下一步

确认以上四点后，我会：
1. 在 `content/<lang>/topics/` 新增六个线路页内容文件
2. 在 Solutions 菜单加入对应入口
3. 构建并预渲染，逐页检查
4. 用 Search Console 的 URL 检查工具验证收录前状态
