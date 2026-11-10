# gpt-image 生图技能使用说明

## 已安装

技能名：`gpt-image-design`。本机技能目录中的 SKILL.md 已被当前 Harness 技能目录识别，可用自然语言调用：

> 用 gpt-image-design，参照现有 FreightVanta 网站，生成英文进口税费计算器的桌面和手机效果图。只做图片，不改代码。

或：

> 用 gpt-image-design，基于上一张效果图改版，保留蓝白风格，突出税费明细。生成一个新版本，不覆盖旧图。

## 模型与服务

- 用户授权的兼容接口：`https://aikey.work`
- 已通过模型列表验证：`gpt-image-2`
- 每次生成一张，无自动收费重试。
- 参考图模式请求 Images edits 接口；无参考图请求 Images generations。
- 第三方服务内部模型执行无法独立核实，生成来源记录会如实保存请求的模型名。

## 凭据

凭据保存在本机用户目录 `.dsh/image-generation/connection.json`，API Key 使用 Windows 当前用户 DPAPI 加密。技能、当前项目、Git及图片元数据不包含密钥。

不要将此配置复制到项目或发到聊天中。需要轮换时，在本机交互终端执行：

```powershell
& "$env:USERPROFILE\.agents\skills\gpt-image-design\scripts\configure.ps1"
```

脚本会隐藏输入新密钥。同一Windows用户可读取加密凭据；这不等同于隔离不可信插件或主机管理员。

## 生成与输出

当前项目的提示词：

- [英文桌面版提示词](<duty-tax-desktop-prompt.txt>)
- [英文手机部分估算状态提示词](<duty-tax-mobile-prompt.txt>)

命令示例：

```powershell
python "$env:USERPROFILE\.agents\skills\gpt-image-design\scripts\generate_image.py" `
  --prompt-file "docs/design/duty-tax-desktop-prompt.txt" `
  --out "docs/design/duty-tax-desktop-v2.png" `
  --model gpt-image-2 --size 1536x1024 --quality high `
  --reference ".impeccable/review/hts-detail/desktop.png"
```

新版本必须选择新文件名，不覆盖原图。输出PNG自带提示词与来源，还会保存同名 `.png.json`，用于核对模型、参考图hash、尺寸与时间。不要把签名下载地址或完整API响应写入项目。

## 本次已生成效果图

- [桌面端英文概念图](<duty-tax-desktop-v1.png>)：1536×1024，左侧货物/费用输入，右侧示例税费明细及询价。
- [手机端英文概念图](<duty-tax-mobile-v1.png>)：1024×1536，展示美国情景的部分预估、未知附加税与需核实费用。

两次请求均使用 gpt-image-2 与同一官网参考图，图片已逐张查看。桌面版示例55.50关税、243.10进口VAT、328.60进口费用及1458.60到岸成本与文档演示算例一致；手机版50.00只显示已知费用小计，未给出完整总额。

正式开发时须把手机版 What needs checking 下的蓝色对勾改为待核实/信息图标，避免被误解为已经通过审核。其他金额、商品编码和税率仍是视觉演示，不能直接写入生产税率配置。

## 评审边界

- 生图输出是视觉概念图，不是已实现网页，不代表税率适用或完成真实计税。
- 桌面示例采用开发文档中的演示算例；不用于真实申报。
- 手机示例故意展示未知附加税、规费与服务费，不能把已知小计看作完整DDP总价。
- AI可能生成细小文字、对齐或金额瑕疵，正式开发仍以需求和技术文档为准。
- 参考图片已人工查看，内容为现有网站界面，不含客户询盘或私密配置。生成过程会将相关参考图和提示词发送给授权第三方接口。
