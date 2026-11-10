# 欧洲五站海关编码查询

2026-11-06 已发布线上。发布版本为 `20261106T044015Z-all-revisions`，完整发布与回退记录见 `docs/deployment-ubuntu-ip.md`。下表保留本地开发入口。

正式入口分别为 `https://de.freightvanta.com/tools/taric-code-lookup`、`https://fr.freightvanta.com/tools/taric-code-lookup`、`https://es.freightvanta.com/tools/taric-code-lookup`、`https://it.freightvanta.com/tools/taric-code-lookup`、`https://nl.freightvanta.com/tools/taric-code-lookup`。已包含搜索框下方8组本国语言常用编码入口。国家数据范围限制不变。

## 入口

| 站点 | 本地查询地址 | 语言 |
| --- | --- | --- |
| 德国 | http://127.0.0.1:8180/preview/germany/tools/taric-code-lookup | 德语 |
| 法国 | http://127.0.0.1:8180/preview/france/tools/taric-code-lookup | 法语 |
| 西班牙 | http://127.0.0.1:8180/preview/spain/tools/taric-code-lookup | 西班牙语 |
| 意大利 | http://127.0.0.1:8180/preview/italy/tools/taric-code-lookup | 意大利语 |
| 荷兰 | http://127.0.0.1:8180/preview/netherlands/tools/taric-code-lookup | 荷兰语 |

详情在上述地址后加 `/3909509090`；搜索 `390950` 可查看五个欧盟末级细分。美国示例 `3909505000` 不属于本版欧盟分类，显示本国语言 404 恢复页面，提示按 HS 前六位搜索。德国 11 位国家编码不自动生成。

五站首页和内页页脚提供入口，主导航未增加工具项目。五语语言切换保持同一欧盟编码；英语入口返回美国 HTS 搜索页，不将两个税则体系的细分视为等价。

## 官方数据及检索

独立 `internal/taric` 服务和数据快照，未复用美国 General/Special/Column 2 税率模型。采用欧盟委员会公开 TARIC 多语言章节分类树，版本日期 **2026-11-06**，每种语言 **16,752** 个末级编码，共享相同代码集合。商品描述、分类层级、补充单位及分类注释来自官方语言版本。标题可结合上级商品名解释“其他”；法定末级描述单独保留。

数据入口：`https://ec.europa.eu/taxation_customs/dds2/taric/nomenclaturetree/`。下载器读取 `nomenclaturetree_{language}_{YYYYMMDD}.js` 章节索引及 `nomenclaturetree_{language}_{YYYYMMDD}_{chapter}_{language}.js`；仅解析数组数据，不执行远程 JavaScript。原始来源目录、快照日期、获取时间和 SHA-256 保存在 `internal/taric/data/current.meta.json`。

支持完整十位码、带空格或小数点的编码、前缀、本国语言多词检索和常见重音归一化；每页25条；输入防抖300ms；支持复制、无结果、清空和无 JavaScript 的表单搜索。嵌入快照可离线提供分类检索，测试机器上德语关键词检索基准约 **7ms**，不代表所有部署环境的接口性能承诺。

## 税率与适用条件

详情页以目的站点对应国家展示，原产国默认为 `CN`，可输入其他 ISO 两字母国家代码；原产国与发货地在界面上明确区分。选定措施日期后，通过官方 `measures.jsp` 和其生成的详情链接查询当时对应代码、原产国和日期的进口措施。

逐项展示本国语言措施名称、官方税率或金额、地域范围、法规编号和有条件措施标记。仅纳入进口措施，出口措施不混入；缺少税率不按零处理；不同措施不相加。官方链接与所选条件保持一致。条件是否满足、附加代码、证明文件及排除项由用户在官方查询中继续核实，本工具没有自动判定资格。

分类树显示当前本地快照日期；措施查询允许其他历史日期，并明确提示历史日期还应核对当时的官方商品分类。若代码在所选日期没有精确对应的详情链接，不能改用另一个代码的措施。

措施缓存保存在 `taric_measure_cache`，按语言、代码、原产国、日期区分，24小时内复用。上游失败且存在旧响应时保留并显示过期状态；无可用响应时显示本国语言错误，保留重新查询和官方链接。切换原产国或日期会清除旧结果，避免条件与屏幕结果错配。

**未接入的国家层数据：** 德国第11位国家细分、法国 RITA 国家层，以及五国具体商品的增值税、消费税及国家补充要求。页面均用本国语言说明范围，并链接国家官方查询渠道。当前不是完税总额计算器或具有约束力的归类裁定。

## 更新、保护与 SEO

独立每日更新：UTC **03:15** 下载全部五语章节，校验最小条数、编码唯一性及五语代码集合一致性后原子替换。配置项 `CZCMS_TARIC_SYNC_ENABLED=true`。失败保留前版，通过既有 `QueueSystemAlert` 通知后台配置邮箱。与美国每月更新任务分离。服务关闭时取消下载。

分类在内存中检索；缓存数据库查询使用参数绑定；公开搜索与措施查询设频次限制；输入长度、国家代码、日期和详情码均校验；上游 HTML 仅提取文字，展示文本经过模板或 DOM 文本节点转义。

五语独立标题、描述和详情商品元数据；预览禁止索引；生产无参数详情页可索引，带查询条件页 noindex 并保留规范地址；同一欧盟编码的五语 alternate 不包含美国详情。各国家 sitemap 收录工具查询入口。

## 验证与复查

完整 Go 测试与原有88项前端测试通过。新增测试覆盖五语真实分类、原产国／日期缓存隔离、上游失败保留和报警、恶意输入、限流、404恢复、元数据、站点地图、页脚入口及美国 HTS 回归。浏览器验证脚本为 `scripts/verify-eu-taric.cjs`，结果和截图位于 `.impeccable/review/eu-taric/`。它验证五语关键词、精确代码、复制、防抖、真实措施、320/390/768/1440宽度、无JS查询及错误恢复。具体浏览器结果以该目录 `verification.json` 为准。

后续如需国家税费或条件自动判断，须单独接入相应官方国家数据及完整适用条件，不能直接用一般增值税率填充商品记录。

## 最终修正与证据范围（2026-11-06）

独立复核的最终记录为 `disposition: ship`，原清单两项修正均为 `resolved`，剩余清单为 `clear`：修改原产国／日期以及查询成功后同步正文和来源侧栏的全部官方措施链接；无效 ISO 原产国或日期禁用这些链接；桌面法规列至少保留112px，使短法规编号完整呈现。最后一轮只对上述两项修正评分，未发现该批次引入的可见回归，不能据此声称重新审查了全页或整个站点。首轮审查和最终评分均保存在 `.impeccable/review/eu-taric/finish-review.md`。

最新 `verification.json` 的 `errors` 为空，`officialLinksSync`、`invalidOriginLinksDisabled`、`shortRegulationsUnbroken` 均为 `true`。12张截图已重新捕获，覆盖德语搜索以及五语详情的1440和390宽度；320、768仅有行为／溢出验证，没有对应视觉截图。完整Go测试和88项前端测试是在最终修正前通过；最终修正后通过的是针对TARIC／HTS的Go测试及 `scripts/verify-eu-taric.cjs`。文档复核没有重跑测试、浏览器或检测器。

样式核对以现有美国HTS源码和桌面／手机截图为依据：工具沿用淡蓝页面底、海军蓝文字、Segoe UI、蓝色操作、白色文档、细线表格和桌面来源侧栏，EU措施表在手机端按字段纵向重排。国家站点既有页头／页脚继续使用各自样式；本次没有引入栅格图片或新的设计系统规则。根 `DESIGN.md` 仍是既有中文后台seed，与本次公共工具的适用范围不同；这项既有差异已记录而未修复，`PRODUCT.md`、根设计文件、未存在的sidecar状态及美国任务的build state均保持原状。详细对照记录见 `.impeccable/review/eu-taric/documentation.md`。本地交付及国家税费未接入的边界不变。
