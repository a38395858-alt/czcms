# 英德专题页 v18 复刻交付

日期：2026-10-13。来源：用户提供的 `freightvanta-english-homepage-development (18).zip`。已完成英语 10 页、德语 10 页，保留原包文案、布局、图片、字体和响应式结构。

| 专题 | 英语入口 | 德语入口 |
| --- | --- | --- |
| 产品采购 | [Product Sourcing](http://localhost:8081/product-sourcing) | [Produktbeschaffung](http://localhost:8082/product-sourcing) |
| 批量采购 | [Bulk Procurement](http://localhost:8081/services/bulk-procurement) | [Großeinkauf](http://localhost:8082/services/bulk-procurement) |
| 包装与品牌 | [Packaging & Branding](http://localhost:8081/services/packaging-branding) | [Verpackung & Branding](http://localhost:8082/services/packaging-branding) |
| 库存仓储 | [Inventory Storage](http://localhost:8081/services/inventory-storage) | [Lagerhaltung](http://localhost:8082/services/inventory-storage) |
| 自有品牌与白标 | [Private & White Label](http://localhost:8081/services/private-white-label) | [Eigenmarke & White Label](http://localhost:8082/services/private-white-label) |
| 全球履约 | [Worldwide Fulfillment](http://localhost:8081/services/worldwide-fulfillment) | [Fulfillment](http://localhost:8082/services/worldwide-fulfillment) |
| 跨境电商 | [Cross-border Ecommerce](http://localhost:8081/industries/cross-border-ecommerce) | [Grenzüberschreitender E-Commerce](http://localhost:8082/industries/cross-border-ecommerce) |
| 消费品 | [Consumer Goods](http://localhost:8081/industries/consumer-goods) | [Konsumgüter](http://localhost:8082/industries/consumer-goods) |
| 工业零部件 | [Industrial Components](http://localhost:8081/industries/industrial-components) | [Industriekomponenten](http://localhost:8082/industries/industrial-components) |
| 时效敏感货物 | [Time-critical Cargo](http://localhost:8081/industries/time-critical-cargo) | [Zeitkritische Fracht](http://localhost:8082/industries/time-critical-cargo) |

上述页面也可通过管理端口的 `/preview/global/{路径}` 和 `/preview/germany/{路径}` 访问。正式域名使用相同的路径和模板；本地预览保持 noindex。

询盘已接入 CMS 表单收件记录，按站点和语言保存，敏感字段加密。参考文件控件记录文件名与元数据，不上传文件内容，页面上已有说明。

已通过前端类型检查、构建和应用代码范围内的 Go 测试。桌面 1440×1000、手机 390×844 共 40 次浏览器检查验证了模板标识、标题、图片和溢出；菜单、FAQ、表单校验与反馈已核对。采购/包装的英德首屏共 8 组与原包渲染对照，手机首屏像素一致。

证据：`output/topic18-review/report.json`、`interactions.json`、`pixel-comparison.json` 和页面截图。两张手机采购长截图以分段拼接方式避开 Chromium 长图截取限制。

独立复核工具未能传递任务正文，已用本地对照复核替代，范围结论为 `ship`。详细记录见 `freightvanta-topic-v18-review.md`。

本次未创建隐私、Cookie、条款、Impressum、Datenschutz 等附属内容页；原模板中的这些目标仍需在 CMS 发布或配置实际网址。部分原包图片沿用 Pexels 远程地址。其他语言不在本次复刻范围。

后续修改专题正文请编辑 `frontend/topic-template/src/content/en-global/topics` 与 `src/content/de/topics`，再按 README 构建前端和 Go 程序。
