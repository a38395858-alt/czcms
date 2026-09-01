# 单页面、联系表单与模板资源

## 页面规则

- 单页面在“内容管理 → 单页面”下维护，页面类型为 `page`。
- `page_layout` 支持 `standard`、`contact`、`landing`、`custom`。
- `index_policy` 支持 `index`、`noindex`；新建单页面默认 `noindex`，联系页建议保持 `noindex`。
- 只有 `index_policy=index` 且已发布、已绑定可渲染模板的页面进入该站点的 `sitemap.xml`。
- 前台同时输出 `meta robots` 与 `X-Robots-Tag`，避免仅依赖 Sitemap 控制收录。

## 联系表单流程

1. 新建或编辑单页面，将布局切换为“联系页面”并保存。
2. 选择“联系我们”单页面模板并首次保存后，系统在同一事务中自动创建并绑定标准安全询盘表单，无需手工创建或绑定。
3. 已绑定表单默认提供查看询盘；确有特殊字段需求时进入“高级字段设置”。询盘状态支持新询盘、处理中、已联系、无效和已关闭。
4. 前台只在已发布的联系页面渲染表单；预览端口会自动使用 `/preview/{site}/forms/{key}/submit`，正式域名使用 `/forms/{key}/submit`。

表单提交由服务端再次校验必填项、邮箱、电话、下拉选项和同意复选框。请求还必须通过 HMAC 表单令牌、来源校验、蜜罐、IP 限流与 10 分钟重复提交检查；字段内容使用主密钥加密后保存，后台读取时按站点 / Locale 权限解密。

## 模板 CSS / JS

模板编辑器中的“样式与交互”资源包含：全站 CSS、单页面 CSS、联系页 CSS、全站 JS、联系页 JS。资源具备：

- 2 MiB 大小和 UTF-8 校验；
- CSS / JS 安全规则，禁止动态脚本、外部资源、Cookie 与敏感存储访问；
- 版本号、乐观锁和修订记录；
- 通过校验后才允许保存，前台按页面布局加载对应资源。

## 相关接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/forms?site_id=&locale=` | 查询当前范围的表单 |
| GET | `/api/v1/forms/{formID}` | 读取表单及字段 |
| POST | `/api/v1/forms` | 创建表单 |
| PUT | `/api/v1/forms/{formID}` | 按版本更新表单 |
| GET | `/api/v1/content-locales/{contentLocaleID}/form` | 查询页面绑定 |
| PUT | `/api/v1/content-locales/{contentLocaleID}/form` | 绑定表单 |
| GET | `/api/v1/forms/submissions` | 按站点 / Locale 查看加密询盘 |
| PUT | `/api/v1/forms/submissions/{submissionID}` | 更新询盘状态 |
