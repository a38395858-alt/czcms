# WhatsApp 联系入口

六个语言站共用 `frontend/head.html` 中的联系入口，号码为 `+86 13538281696`，链接使用不含加号和空格的 `8613538281696`。

- 电脑：新标签打开 `https://web.whatsapp.com/send?phone=8613538281696`。未登录 WhatsApp Web 时需先登录。
- 手机：打开 `https://wa.me/8613538281696`，由 WhatsApp 接管对话。
- 入口位于 React 挂载范围之外，首页、专题、联系页、文章和工具页共用；无 JavaScript 时仍有可用链接。
- 电脑显示右侧居中的图标和文字，手机为右下角图标，并避让底部隐私偏好提示。
- 点击只打开对话，不自动发送消息，不显示未经证实的在线状态或未读消息数。

样式与手机适配在 `frontend/assets/css/public-contact.css`、`frontend/assets/js/public-contact.js`；无外部聊天脚本或 iframe。

## 新消息邮件提醒

当前账号使用 WhatsApp／WhatsApp Business 手机应用，**尚未启用新消息邮件提醒**。网页跳转无法获知是否有实际消息，不能用点击按钮替代新消息事件。

后续若接入 WhatsApp Business 官方 API，可通过已验证签名的入站消息 webhook 去重后发送邮件。需要先完成 Meta 账号、号码和 webhook 配置，并安全配置接口凭据；不通过抓取个人 WhatsApp Web 会话实现。

## 验证

`node scripts/verify-whatsapp-contact.cjs` 检查六语首页、采购专题、联系页和编码工具的桌面／手机入口，共 48 个组合，并拦截 WhatsApp 目标验证号码与新标签跳转，不发送真实消息。

设置 `WHATSAPP_CHECK_ORIGIN=live` 后验证正式域名；`WHATSAPP_CHECK_OUTPUT` 可指定证据目录。局部修改后的 Go 验证包括共用页头、专题服务端渲染、联系表单入库，已有功能测试继续通过。
