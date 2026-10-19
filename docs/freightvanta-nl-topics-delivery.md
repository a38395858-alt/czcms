# FreightVanta 荷兰语专题页交付

已按用户确认的现有荷兰语 Deltaraster 风格接入 6 个服务页与 4 个行业页。完整原文保存在 freightvanta-nl-topic-copy-source.md；9 页完整文案由 import-nl-copy.py 导入，采购页保留原有荷兰语长文案，并采用本次提供的 Title/H1。

## 预览

荷兰语本地站点：http://localhost:8086/ 。CMS 通用预览：http://localhost:8080/preview/netherlands/ 。路由在独立语言端口下省略 /nl；实际站点和通用预览由 CMS 上下文生成语言与页面链接。

| 页面 | 本地路径 |
| --- | --- |
| Sourcing in China | /product-sourcing |
| Grootschalige inkoop in China | /services/bulk-procurement |
| Verpakking en merk | /services/packaging-branding |
| Opslag en vrijgave van voorraad | /services/inventory-storage |
| Eigen merk en white label | /services/private-white-label |
| Orderverwerking | /services/worldwide-fulfillment |
| Grensoverschrijdende e-commerce | /industries/cross-border-ecommerce |
| Consumentengoederen | /industries/consumer-goods |
| Industriële onderdelen | /industries/industrial-components |
| Tijdkritische vracht | /industries/time-critical-cargo |

## 已实现

- Archivo Black 标题、IBM Plex Sans 正文、蓝灰底色、绿色主按钮与橙色细节，延续已运行荷兰语首页。
- 文案按原板块顺序展示：决策说明、场景、流程、范围、准备资料/工作模型、FAQ、关联页面、荷兰语询盘。没有把制作备注或 CMS 字段清单发布为客户文案。
- 首页与专题页导航提供全部六项服务和四个行业。语言切换保留当前专题路径，普通预览和通用预览均可返回正确首页。
- 全荷兰语表单标签、校验、文件选择/移除、发送与成功状态。参考文件只传文件名等元信息，界面如实说明。
- 服务范围与需确认项完整保留；SEO、hreflang、FAQ/Breadcrumb/Service-or-Organization JSON-LD 由可见内容和 CMS 域名上下文生成。
- 荷兰语专题图片复用项目本地素材，修复首次检查发现的外部图库解码失败；没有新增生图或仓储容量承诺。

## 验证

- 两套前端 TypeScript 检查、构建通过；专题预渲染输出六种语言共 60 页。
- 文案核对：10 页、482 条原文/内容片段、58 组 FAQ，全部通过。
- 浏览器：10 页 × 桌面/手机共 20 例，另检查 320px 无横向滚动；无控制台异常、资源错误或缺失锚点。图片均可解码，FAQ 与 JSON-LD 一致。
- 首页菜单进入专题、菜单 Escape、NL→FR 保留专题、通用预览首页返回、表单校验与文件移除通过；无 JavaScript 情况下 10 页正文和 FAQ 可见。
- 另五种语言包装页桌面/手机共 10 例回归通过。
- `.tools/go/bin/go.exe test ./cmd/... ./internal/... ./frontend/...` 全部通过，覆盖各语言正式域名/预览渲染、实际询盘加密保存和跨站 token 拒绝。
- 浏览器成功状态使用拦截响应，不向用户实际数据库插入测试询盘；真实存储由隔离 Go 测试验证。

证据：output/nl-topics/copy-audit.json、browser-review.json、regression.json、confirmation.json 及截图。设计简报、复核和设计文档比较分别见 freightvanta-nl-topics-brief.md、freightvanta-nl-topics-review.md、freightvanta-nl-topics-design-check.md。

## 复核与限制

独立复核任务及一次重试都未接收到正文，文档任务也返回空任务结果；已按同一规范在本线程完成检查并如实记录，没有独立审核结论。旧 PRODUCT/设计说明/索引存在版本漂移，本次普通页面扩展保留这些文件，差异记录在设计比较文档中。共享构建包仍有 Vite 大文件提示。

本地服务已重建并启动；未提交、推送或发布到外部环境。
