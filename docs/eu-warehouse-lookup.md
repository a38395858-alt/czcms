# 五国仓库地图与附近查询

2026-11-04：已发布五国线上功能。网站使用各国当地语言，沟通与维护说明使用中文。

线上地址：<https://de.freightvanta.com/tools/fba-warehouse-lookup>、<https://fr.freightvanta.com/tools/fba-warehouse-lookup>、<https://es.freightvanta.com/tools/fba-warehouse-lookup>、<https://it.freightvanta.com/tools/fba-warehouse-lookup>、<https://nl.freightvanta.com/tools/fba-warehouse-lookup>。各站首页页脚入口同步更新。

| 站点 | 本地入口 | 地图 | 当前参考地址 |
| --- | --- | --- | --- |
| 德国 | http://127.0.0.1:8180/preview/germany/tools/fba-warehouse-lookup | 16 个联邦州 | 4 FBA + 1 第三方仓 |
| 法国 | http://127.0.0.1:8180/preview/france/tools/fba-warehouse-lookup | 本土 13 个大区，含科西嘉 | 6 FBA + 1 第三方仓 |
| 西班牙 | http://127.0.0.1:8180/preview/spain/tools/fba-warehouse-lookup | 17 个自治区 + 休达、梅利利亚，含加那利和巴利阿里群岛 | 9 FBA |
| 意大利 | http://127.0.0.1:8180/preview/italy/tools/fba-warehouse-lookup | 20 个大区，含西西里和撒丁岛 | 9 FBA |
| 荷兰 | http://127.0.0.1:8180/preview/netherlands/tools/fba-warehouse-lookup | 欧洲荷兰 12 个省 | 17 第三方仓 |

共 47 条独立参考地址。荷兰未确认 FBA 收货仓，只有真实运营商的第三方仓；不能把配送站或其他国家的 FBA 仓放到荷兰站。西班牙、意大利尚未加入有明确地址来源的第三方仓，筛选为 3PL 时如实显示空状态。不是全量、实时库存、容量、合作商或可预约状态目录。

## 功能与国别隔离

- 复用美国工具的蓝白界面和各站头部、页脚，工具只增加页脚入口。
- 点选地图行政区、键盘选择、地区下拉、仓库代码、运营商名称、城市、邮编和街道关键词搜索。支持重音折叠、大小写和多词匹配；荷兰完整邮编空格、意大利前导零保留。
- 按本国地址、城市或邮编查询附近仓库，25 / 50 / 100 / 200 **公里**，球面直线距离排序，支持 FBA / 3PL 筛选。唯一候选立即显示结果，多候选选择后显示；编辑地址立即清除旧距离并取消旧请求。
- 各国有独立地图、仓库目录、邮编索引、默认地区、精选地址、地区入口、文案及 SEO。地图由真实边界绘制，RFC 7946 多边形在投影前转换绕向，避免 D3 把某个国家绘成整个地球。
- 地址复制、手动选择兜底、公开来源和导航；可分享 URL，浏览器返回恢复状态。无 JavaScript 时保留服务器文本查询。
- 公共域名干净地址可索引；搜索参数页 noindex，canonical 指向本国工具干净地址。本地预览 noindex，各站 sitemap 包含干净工具地址。结构化数据标明对应语言。

## 来源与定位精度

地址快照为公开目录 FBA Near Me、AMZ Prep 和运营商 Active Ants / Monta 官网。每个结果附具体来源。德国 LEJ1 的原目录街道/邮编错误，已按有明确 LEJ1 名称的 [OSM 独立设施记录](https://www.openstreetmap.org/way/112590309) 更正。STR1 冲突、法国 CEDEX 邮寄地址、部分街道不完整记录未纳入。不会仅凭目录国家名或仓库代码猜地址。

地图数据来自 geoBoundaries gbOpen，保存上游机构、版本、下载来源及许可证到每国 `warehouse-regions.*.source.json`。德国来源 BKG（德国数据署名许可 2.0），法国等地图来源与许可逐国见 source 文件；意大利使用 ADM2 的 20 大区，而非 ADM1 的五个宏观地区。法国不含海外大区，荷兰不含加勒比地区。

邮编/城市参考位置来自 GeoNames，CC BY 4.0，约 13.6 万条地点记录。仓库地图点均为明确标注的邮编或城市近似中心，不是实测仓门。荷兰完整邮编的本地定位使用四位数字区域。距离也只是参考点之间的直线距离，不代表驾车里程或尾程时效。

`GET /api/public/eu-warehouse-location?country=de|fr|es|it|nl&q=...` 首先使用独立本国邮编/城市索引；街道不会偷偷降级为邮编中心。街道查询通过服务端固定的 Nominatim 服务处理，限制国家并验证响应国别/坐标；页面注明地址会发送到 OpenStreetMap / Nominatim，提供 OSM 署名。定位只是公开地图参考点，不保证门牌匹配。没有调用美国 Census。

Nominatim 请求与美国备用服务共享全站串行限流、间隔至少 1.1 秒，仅显式提交时触发，24 小时内存缓存（最多 1024 项），无自动补全或批量接口；按 IP 限流、10 秒上游超时、TLS 校验、响应大小限制。`CZCMS_WAREHOUSE_GEOCODER_URL` 可配置兼容服务或设为 `off` 关闭外部街道定位；未设置时兼容原 `CZCMS_EU_GEOCODER_URL`，本地邮编/城市仍可用。调用者不能指定上游 URL。系统已有的地理编码代理配置同时适用于该服务。更大流量应切换到自建或有合同的地理编码服务。

## 更新与验证

嵌入式目录是 `frontend/assets/data/warehouse-country.{de,fr,es,it,nl}.json`；可直接按来源审核后更新。重新准备资料时依次运行：

```powershell
python scripts/prepare-eu-warehouse-data.py
python scripts/import-eu-fba-reference.py
python scripts/build-eu-warehouse-countries.py
```

不自动抓取线上数据、不自动部署。数据准备缓存留在 `.tmp/eu-warehouses/`，地图来源及发布目录独立保存在前端 assets。准备脚本不会利用 Nominatim 批量生成仓库坐标。

验证包括后端国别隔离、SSR、邮编与重音、站点端口转发、SEO，以及前端公里距离、地图球面边界、真实浏览器五国桌面与 390px 手机布局。五国邮编 50 km 分别出现 2 / 1 / 4 / 1 / 12 条参考结果；五个本国街道地址也已使用实际定位服务检查，法国多个候选需要用户选定。美国原工具保留原地图、英里和现有数据。截图是 Chromium / Edge 模拟视口，不代表已做实体 iPhone 或 Android 触摸测试。

上线后公网 Edge 浏览器再次完成五国桌面与 390px 手机检查，使用真实本国邮编和街道定位，结果数与本地一致；语言、地图、代码搜索、类型筛选、编辑后清空距离、首页页脚、canonical、参数页 noindex 和 sitemap 通过。无页面脚本异常、坏资源或横向溢出。公网记录位于 `.tmp/server-deploy/warehouse-public-results.json`。
