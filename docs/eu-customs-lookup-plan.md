# 欧洲五站海关商品编码查询方案

调研日期：2026-11-05。德国、法国、西班牙、意大利和荷兰五站已于2026-11-06完成实现并上线。当前实现与限制见 `docs/eu-taric-implementation.md`；本文其余部分保留原调研方案，不能据此声称国家税费层已接入。

## 现有功能

目前 `/tools/hts-code-lookup` 只在美国英语站启用，后台使用 USITC 的美国 HTS 数据，详情页展示美国 General、Special、Column 2 等税率。欧洲站应单独接入欧盟和适用国家的数据，复用搜索、复制、分页和详情布局。

## 国家与编码

| 站点 | 页面与关键词语言 | 编码体系 | 国家层处理 |
| --- | --- | --- | --- |
| 德国 | 德语 | 8 位 CN、10 位 TARIC；德国进口申报还涉及 11 位国家编码 | 以德国 EZT 核对国家细分、国内税费及限制；未获得国家数据时只展示已验证的欧盟层级 |
| 法国 | 法语 | 8 位 CN、10 位 TARIC | 法国 RITA 用于核对国家税费、附加代码及申报要求 |
| 西班牙 | 西班牙语 | 8 位 CN、10 位 TARIC | 西班牙国内税费与适用要求独立处理 |
| 意大利 | 意大利语 | 8 位 CN、10 位 TARIC | 意大利国内税费与适用要求独立处理 |
| 荷兰 | 荷兰语 | 8 位 CN、10 位 TARIC | 荷兰国内税费与适用要求独立处理 |

五国共享欧盟商品分类与共同关税体系，不应人为生成五套不同的欧盟编码。HS 前六位通常是跨税则比较的起点，后续细分必须按对应版本与商品描述核对。美国 `3909505000` 可提示从 `390950` 搜索欧洲细分，不能直接改标签变成欧洲编码，也不能给德国编码随意补一位。

## 查询流程

目的国家随站点默认确定；原产国默认中国并允许修改；查询日期用于匹配有效税则。商品原产国与发货地分别处理。

输入支持代码前缀、完整代码及本国语言商品关键词。关键词索引使用对应语言的官方商品描述，另设搜索同义词；法定描述与备注不以机器翻译结果替代。结果展示 CN/TARIC 编码、当地语言描述、单位及可用的关税措施，并提供复制和详情入口。

详情沿用美国页面的主要布局，替换为欧盟分类路径、基础第三国关税、优惠及适用条件、附加代码、贸易救济措施、法规依据、生效日期及数据版本。各税率逐项保留适用条件，不能把多个措施直接相加或统一改成一个百分比。美国 Column 1/Column 2、Section 301 等专属项目只保留在美国页面。

国家增值税和消费税与欧盟关税分开；TARIC 不提供这些国家税费。只有取得该国商品对应的可靠来源时才展示具体数值，否则明确说明需进一步核对。税额测算若后续加入，还需要完税价格、数量、币种等输入。

## 数据接入

欧盟委员会说明 TARIC 数据每日向成员国管理部门传送，并公开 Excel 原始数据。建议建立独立的欧盟每日同步与本地检索，不沿用美国每月更新任务。保存生效起止日期、语言、国家适用范围、原产国条件、措施类型、附加代码、法规与原始来源。

同步采用完整校验后整体替换；失败保留上一份有效数据并沿用后台通知邮箱报警。查询和税率缓存包含税则体系、代码、原产国、目的国、日期及附加代码，避免不同条件混用。

官方查询页本次显示最后更新日期为 2026-11-04。本次访问官方全量下载入口被转到临时不可用页面，法国 RITA 应用返回 500；这些入口的数据下载、语言覆盖与国家层接入仍须完成验证，不能据此宣称已接入完整或实时数据。

## 地址与 SEO

建议欧洲五站使用独立工具路径 `/tools/taric-code-lookup`，详情为其后的有效商品代码；美国保持现有地址。以下标题是页面实施候选：

| 语言 | 标题 |
| --- | --- |
| 德语 | Zolltarifnummer suchen – TARIC und Einfuhrzölle |
| 法语 | Recherche de code douanier – TARIC et droits de douane |
| 西班牙语 | Consulta de códigos arancelarios – TARIC y aranceles |
| 意大利语 | Ricerca codice doganale – TARIC e dazi |
| 荷兰语 | Goederencode zoeken – TARIC en invoerrechten |

搜索页、详情页、页脚入口、说明和错误状态均使用本站语言。跨站语言切换仅链接经过验证的同一欧盟编码；美国和欧盟不同细分之间不声明等价详情页。

## 实施顺序与验收

1. 验证官方数据下载、版本、许可及多语言字段，建立欧盟分类与措施数据模型。
2. 先完成德国、法国的本地搜索和详情查询，使用真实代码验证本国语言及原产国／日期筛选。
3. 复用到西班牙、意大利、荷兰；补齐五站页脚、SEO 和语言切换。
4. 接入可核实的国家附加信息，德国 11 位国家码与法国国家层信息分别验证。

验收包括准确编码／前缀／本国语言检索、法定描述完整性、税率适用条件、历史日期、错误编码、无国家数据时的明确状态、复制、手机布局、同步失败继续服务，以及美国查询结果不受影响。

## 已核对的官方来源

- 欧盟 TARIC 说明：<https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/eu-customs-tariff-taric_en>
- 欧盟 CN 说明：<https://taxation-customs.ec.europa.eu/customs/common-customs-tariff-cct/tariff-classification-goods/combined-nomenclature_en>
- 欧盟 TARIC 查询（含多语言选择）：<https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en>
- 德国海关编码结构说明：<https://www.zoll.de/EN/Businesses/Movement-of-goods/Import/Duties-and-taxes/Normal-customs-clearance/Customs-Tariff/customs-tariff_node.html>
- 德国 EZT：<https://auskunft.ezt-online.de/ezto/Welcome.do>
- 法国 RITA 应用入口：<https://www.douane.gouv.fr/rita-encyclopedie/public/accueil/init.action>（本次返回服务错误，需恢复后核验）
