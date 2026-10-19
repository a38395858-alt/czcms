# 表单收件箱 · 实施与验收

范围：把六种语言首页询盘、60 个专题页询盘、资源订阅以及 CMS 联系页表单汇总到中文后台。访客提交后必须得到数据库保存结果；管理员可以查看来源、检索客户、分页、更新状态与内部备注。

## Direction contract

THESIS：这是供日常运营使用的 Operate 页面；按提交记录处理需求，沿用现有 CMS 的筛选、表格和详情面板。

OWN-WORLD：沿用 admin.css 的白色画布、冷灰背景、钴蓝操作色和系统字体。使用既有侧栏、按钮和表格，不增加新的品牌系统。

STORY：管理员先看到待处理记录，再按站点/语言/状态定位客户，打开详情后记录沟通进展。

FIRST VIEWPORT：顶部标题与刷新；第二行站点、语言、搜索；随后状态筛选和分页表格。桌面详情在右侧，窄屏详情在列表上方。主操作是“保存跟进”。

FORM：既有后台普通扩展，代码实现。无新视觉世界抽签、无新图像资产。沿用既有界面与 PRODUCT.md 任务优先原则。

FINISH：unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## 实现

- 后台路由：`/admin#/admin/form-inbox`，查看权限 content.read，跟进权限 content.write；服务端按账号站点与 locale 范围过滤。
- 所有提交进入 form_submissions；客户字段、备注分别加密。状态更新带版本冲突检查与审计。
- 首页取消模拟成功与 mailto 提交，订阅接入同源接口。重复提交、令牌、来源、蜜罐和限流校验继续生效。
- 参考附件目前仅保存文件名、大小、类型，前台和后台均有说明；未实现文件二进制上传、邮件通知或订阅群发。
- 无搜索时使用数据库分页；客户字段搜索仅对当前权限范围内的密文解密检索。

## 验证记录

- Go 项目包测试：`go test ./internal/... ./cmd/... ./frontend`；不要使用 `go test ./...` 扫描 tmp/var 中下载的 Go 工具链测试源。
- 两个首页项目 TypeScript 检查和 Vite 构建通过。构建存在既有包体积和静态 index.html 的 VITE_SITE_URL 提示，CMS 运行页面使用服务器注入站点信息。
- 隔离 QA 数据库、端口 8091 验证首页提交 → 收件箱 → 详情 → 保存跟进；桌面 1440px 和手机 390px 无横向溢出、无 JavaScript 错误。
- 证据：`.impeccable/review/form-inbox/desktop.png`、`.impeccable/review/form-inbox/mobile.png`。截图内容为人工合成 QA 数据；不进入正常业务数据库。
- 六语言首页、专题、订阅共 18 次浏览器提交均返回 201 和真实编号，无 JavaScript 错误；结果写入 `.tmp/inboxqa/all-forms-results.json`。

- CMS 自建联系页：真实令牌、同意勾选、POST 入库与收件箱解密检索已通过集成测试。
- 手机端原有辅助文字定位引起横向溢出，已将其定位范围约束到表格单元格；最终截图文档宽度 390px，与视口一致。桌面为 1440px。
- CSS 检测结果为空。修复窄屏说明宽度，以及状态筛选下保存成功提示丢失。

## 文档收尾与评审结论

- 本次属于既有后台普通扩展。对照 PRODUCT.md、DESIGN.md、admin.css 与收件箱 CSS/JS：继续使用系统字体、白色面板、冷灰分区、钴蓝操作色，以及既有按钮和表格；详情在 1250px 以下移到列表上方，700px 以下筛选改为两列。页面布局与状态样式仅记录于此，不提升为全站设计规则。
- Finish reviewer 结论：**SHIP**，范围限定为已解决的四项：手机横向溢出、标题说明宽度、状态筛选下保存反馈持续可见、验证文档纠正。代码证据为表格单元格定位约束、标题容器可收缩与说明宽度解除限制、详情之外的 `role="status"` 提示；验证证据沿用上节桌面/手机截图及集成测试记录。本次文档检查未重新执行浏览器或测试。
- 既有文档漂移：DESIGN.md 仍为 seed，主色与字体待定，但 admin.css 已定义 OKLCH 钴蓝和系统字体栈；文档圆角目标约 8px，现有全局圆角令牌为 5/7/10px。这些差异先于本扩展，本次仅报告，不修改全站实现或设计规范。
- 文档结果：追加本页证据与有限范围评审结论；保留 DESIGN.md 与 `.impeccable/design.json`。没有新交付位图；上节 PNG 是隔离 QA 环境的人工合成数据截图，仅作评审证据。

- 最终运行版本已替换并重启，本地 8080–8086 服务正常；后台未登录访问会转到登录页。测试库隔离于业务库，QA 服务已关闭。状态筛选内保存的浏览器复验通过，关闭详情后手机文档宽度仍为 390px。
