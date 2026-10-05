# FreightVanta 多语言首页模板方向

目标：各语言站点使用相同业务内容和 SEO 字段，但拥有独立的模板结构、视觉语气和交互形式。不能通过只换颜色或替换标题来伪装成不同模板。

## 共用内容契约

所有站点都保留以下业务内容：

- 国际运输主张：FreightVanta 协调海运、空运、陆运、清关、仓储和履约；
- 服务：Seefracht / Ocean freight、Luftfracht / Air freight、Land & letzte Meile；
- 流程：了解货物 → 制定方案 → 协调交接 → 持续跟进；
- 行业：电商零售、消费品、工业组件、时效货物；
- 网络、资源文章、报价表单、FAQ 和页脚合规链接。

每个 Locale 可以独立翻译文案、图片、CTA、航线描述和表单提示，但不改变字段语义和 SEO 结构。

## 六个站点的模板性格

### English / Global — Pacific Operations

- 结构：透明信息层 + 大面积海军蓝 Hero + 路线数据层；
- 视觉：太平洋蓝、冷白、橙色节点；使用地图/航线只在全球站；
- 版式：Hero 双栏，服务使用横向 Tab，流程使用里程碑；
- 语气：direct、confident、practical；
- 重点 CTA：`Get a shipment plan`；
- 适用对象：全球访问者和美国 B2B 采购团队。

### Deutsch / Germany — Industrial Precision

- 结构：瑞士工业排版，黑色服务目录、编号清单和严格基线；
- 视觉：石墨黑、钢蓝、信号红，禁止国旗式黑红金装饰；
- 版式：大标题 + 信息侧栏，服务使用带规则的目录行，流程使用双栏模块；
- 语气：präzise、verlässlich、verantwortlich；
- 重点 CTA：`Transport planen` / `Angebot anfordern`；
- 适用对象：德国制造、进口商、工业和合规敏感型客户。

### Français / France — Route & Savoir-faire

- 结构：杂志式叙事，但不使用通用衬线模板；Hero 采用左侧短句宣言，右侧用大幅港口细节图；
- 视觉：午夜蓝、酒红、浅灰和少量奶油白；
- 版式：服务做成“能力章节”与图文交错，不用三张卡片；案例和资源采用大标题目录；
- 语气：humain、soigné、maîtrisé；
- 重点 CTA：`Parler à un expert`；
- 适用对象：法国品牌、奢侈品/消费品供应链和欧洲进口商。

### Español / Spain — Warm Trade Network

- 结构：温暖、开放的横向模块；Hero 采用大标题和港口/仓库场景，下面以“从源头到客户”展开；
- 视觉：深靛蓝、陶土橙、阳光黄、明亮白；不使用整页渐变；
- 版式：服务区域采用大号数字和宽行，行业区域采用不等宽拼贴；
- 语气：claro、ágil、cercano；
- 重点 CTA：`Planificar un envío`；
- 适用对象：西班牙电商、零售、进口商和跨地中海贸易团队。

### Italiano / Italy — Crafted Flow

- 结构：强调“每次交接都被精心管理”；Hero 采用大幅货物细节图与短文案，服务以横向故事流展开；
- 视觉：炭黑、地中海蓝、赭石黄、象牙白；
- 版式：图像与文字交替的长滚动，产品/消费品行业优先展示；
- 语气：curato、concreto、personale；
- 重点 CTA：`Parla con un esperto`；
- 适用对象：意大利制造、时尚、家居、食品和消费品出口企业。

### Nederlands / Netherlands — Clear Route Control

- 结构：港口控制台风格，顶部为清晰的路线状态条，主内容以“当前节点/下一节点”组织；
- 视觉：深青绿、荷兰橙、雾蓝、白色；橙色只表达行动和节点；
- 版式：横向路线图、紧凑数据表、可展开 FAQ，强调效率和可追踪性；
- 语气：nuchter、duidelijk、efficiënt；
- 重点 CTA：`Plan uw zending`；
- 适用对象：荷兰港口贸易、欧洲分拨、电商和跨境履约团队。

## 模板文件策略

每个站点绑定独立的 `theme_package`，共用安全数据契约，但允许独立模板文件：

```text
themes/
  global-pacific/
    pages/home.html
    assets/home.css
    assets/home.js
  germany-precision/
    pages/home.html
    assets/home.css
    assets/home.js
  france-savoir-faire/
    pages/home.html
    assets/home.css
    assets/home.js
  spain-trade-network/
    pages/home.html
    assets/home.css
    assets/home.js
  italy-crafted-flow/
    pages/home.html
    assets/home.css
    assets/home.js
  netherlands-route-control/
    pages/home.html
    assets/home.css
    assets/home.js
```

模板不允许直接复制另一站点的页面文件后只替换颜色。每个模板都要有独立的 DOM 区块顺序、导航方式、Hero 结构和服务/流程呈现方式。

## 开发验收

1. 切换站点后，至少有三项可见结构变化：导航结构、Hero 构图、服务呈现方式、流程呈现方式或资源布局；
2. 同一篇内容在各站点可以使用独立标题、摘要、图片、SEO、canonical 和 hreflang；
3. 每个模板在 320px、768px、1440px 下分别验证；
4. 所有模板保留报价表单、FAQ、隐私政策、结构化数据和可访问性；
5. 不使用虚构客户、评价、物流时效或覆盖数字；
6. 模板切换和发布写入审计日志，并支持回滚。

## 实施顺序

1. 先完成 Global、Germany、France 三套完整模板视觉稿并确认；
2. 完成 Spain、Italy、Netherlands 三套视觉稿；
3. 将六套模板接入站点语言绑定；
4. 用同一套首页内容分别预览、切换、移动端验收和 SEO 检查。
