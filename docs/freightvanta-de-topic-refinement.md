# 德语专题页文案核对与排版优化

日期：2026-10-13。范围：德语 6 个服务专题页、4 个行业专题页。用户提供的文案文档作为内容依据，本轮保留业务文案、原图、板块顺序和德语品牌风格。英文专题页保持原排版。

## 文案核对

10 页的 SEO Title、Meta Description 和 H1 均与附件一致。附件完整展开的 9 页，首屏 Lead 和共 54 条 FAQ 问题及答案全部匹配。产品采购页在附件中只列摘要，现有代码包含完整内容及 8 条 FAQ，未删减。

| 专题 | 路径 | FAQ 数 | 文案核对 |
| --- | --- | ---: | --- |
| 产品采购 | `/product-sourcing` | 8 | Title、Meta、H1 一致；正文沿用完整模板 |
| 批量采购 | `/services/bulk-procurement` | 6 | SEO、H1、Lead、FAQ 一致 |
| 包装与品牌 | `/services/packaging-branding` | 6 | SEO、H1、Lead、FAQ 一致 |
| 仓储与库存 | `/services/inventory-storage` | 6 | SEO、H1、Lead、FAQ 一致 |
| 自有品牌与白标 | `/services/private-white-label` | 6 | SEO、H1、Lead、FAQ 一致 |
| 全球履约 | `/services/worldwide-fulfillment` | 6 | SEO、H1、Lead、FAQ 一致 |
| 跨境电商 | `/industries/cross-border-ecommerce` | 6 | SEO、H1、Lead、FAQ 一致 |
| 消费品 | `/industries/consumer-goods` | 6 | SEO、H1、Lead、FAQ 一致 |
| 工业零部件 | `/industries/industrial-components` | 6 | SEO、H1、Lead、FAQ 一致 |
| 时效货物 | `/industries/time-critical-cargo` | 6 | SEO、H1、Lead、FAQ 一致 |

标题、介绍、场景、流程、准备清单、范围、FAQ 和询价引导属于访客内容，保留在页面。SEO 字段放入页面元数据，CMS 和制作备注保留在文档。附件中消费品标签的 `KONSUMGLÜTER` 拼写错误未引入页面，继续使用正确的 `KONSUMGÜTER`。

`output/de-topic-refinement/copy-audit.json` 记录逐项对照；`content-preservation.json` 与最终构建的 `final-content-preservation.json` 对模板业务文本及图片替代文字做保留检查，949 条文本均存在于生成 HTML 中。

## 排版调整

- 首屏标题改为 2.1–3.1rem、1.16 行高、34ch 最大宽度，手机端使用德语自动断词。
- 首屏正文与图片采用等宽两栏，图片保留原裁切；流程摘要横跨整行，手机端也显示备注。
- 加入概览、流程、范围、准备、FAQ 和询价的页内导航；锚点避开固定导航并支持键盘焦点。
- 板块间距收敛至 52–80px，概览采用标题与正文左右布局。
- 场景、流程与 FAQ 使用清晰的无衬线小标题，保留主要标题的 IBM Plex Serif。
- 范围说明用勾号表示包含项、箭头表示待确认项；相关服务采用桌面两列。
- 询价区减轻边框并移除硬偏移阴影和背景网格，保留完整表单。

实现位于 `frontend/topic-template/src/components/de/GermanTopicPage.tsx` 与 `src/de-topic-refinement.css`；样式只作用于德语专题页。

## 验证与交付

结论：可交付。通过一次桌面/手机批量视觉检查、集中修正长标题与断词、一次确认；没有更换图片或商业文案。浏览器确认覆盖全部 10 页的 1440px、390px 布局，并检查 320px 横向溢出。

- 20 组浏览器检查均无页面异常、控制台错误、HTTP 错误或横向溢出；图片滚动加载后均成功解码。
- 页内链接目标均存在；流程、FAQ、询价及首屏按钮的跳转位置位于固定导航下方。
- 原生 FAQ 可展开，页面可见 FAQ 数量与 FAQPage 结构化数据一致。
- 桌面服务超级下拉包含全部 6 个专题链接；切换英文保留包装专题路径，英文页面不包含德语优化类。
- `npm run typecheck`、`npm run build` 与 `.tools/go/bin/go.exe test ./cmd/... ./internal/... ./frontend/...` 通过。
- 已重新构建并重启本地 CMS，德语预览运行于 `http://localhost:8082`。

证据位于 `output/de-topic-refinement/browser-review.json`、`before-*.png` 和 `after-*.png`。Playwright 的分区截图可能包含固定导航遮盖；这是截图滚动位置造成的捕获现象。一次为隐藏导航而注入截图样式的尝试被站点 CSP 拒绝，原始记录保存在 `browser-review-capture-tool-errors.json`；已移除截图样式注入并单独重跑纯功能检查，最终记录无错误。未修改站点 CSP。

复查脚本：`frontend/topic-template/review-de-refinement.mjs`。使用 `--checks-only` 可只执行功能与布局检查，避免重复生成截图。
