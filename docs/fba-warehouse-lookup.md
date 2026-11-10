# 美国仓库地图与附近查询

状态：2026-11-04 已发布线上：<https://freightvanta.com/tools/fba-warehouse-lookup>。本地工具地址：
`http://127.0.0.1:8180/preview/global/tools/fba-warehouse-lookup`。
正式站路径仍是 `/tools/fba-warehouse-lookup`。页面全部英语，页脚保留入口，顶部导航不增加工具。

## 界面与功能

按 `docs/prototypes/fba-map/` 的两张已确认效果图实现：

- Browse by state：真实美国州界，含 50 州和 DC，AK/HI 插图；点击州或州下拉更新结果。地图支持拖动、缩放、返回全国。
- 仓库代码、州简称/州名、城市、ZIP、街道查询，大小写不敏感、多词 AND；精确州代码优先。默认 California，清空立即清空结果。
- Find nearby：输入美国完整街道地址、城市和州、五位 ZIP 或 ZIP+4。唯一匹配自动查询，多个候选时展示明确的 Show nearby warehouses 按钮供选择；显示定位精度，查询 25 / 50 / 100 / 200 英里内已收录仓库，按球面直线距离排序。
- 地址改变时立即移除旧距离、取消旧请求；超时、无匹配、服务繁忙均提供恢复提示，不把错误街道自动降级到 ZIP 中心点。
- FBA / third-party 3PL 分开筛选；3PL 可按 Storage、FBA prep、Relabeling、Fulfillment、Returns 筛选。
- 已核实 3PL 运营商目录目前为空。三条加州 3PL 卡片是明确标注的交互示例，独立数据文件；预览默认开启示例，正式环境默认不显示，用户可通过复选框查看。
- 结果卡片显示代码、区域、城市、州、ZIP、街道、位置精度、来源；地图点与列表互相定位。地址复制成功显示提示，剪贴板不可用时展示可选择的完整地址。真实 FBA 地址可打开 Google Maps 导航。
- 下方人工精选 ONT8、LAX9、FTW1、MDW2、ABE8、TEB9，按美西/美中/美东切换；六个 3PL 地区入口打开对应州筛选，不冒充已有合作仓。
- 查询状态保留在网址并支持返回；近仓唯一地址自动查询，多个候选才需选择。手机地图在上、结果在下。
- 无 JavaScript 仍支持 GET 按 FBA 代码/州/城市/ZIP 查地址；附近定位与地图需要 JavaScript。
- 独立 TDK、canonical、WebApplication 结构化数据；干净页面可收录，仅加入美国 sitemap；所有参数页和本地预览 noindex。

## 地址数据和参考坐标

`frontend/assets/data/fba-warehouses.us.json`：87 条公开参考地址、27 州。
来源为 FBA Near Me 各记录；ABE8、CMH1、MDW2、MDW4、MIA1 的冲突经过 Warehouse Ninja 交叉复核。
保留来源链接、检查日期、完整邮编和前导零。它不是完整或实时 Amazon 目录，送仓以 Amazon 货件计划为准。

2026-11-04 批量对现有地址调用美国 Census 地理编码，保存 64 条州一致的地址范围匹配；剩余 23 条用对应的 2025 ZCTA 区域中心作近似点，明确标记 `zip-centroid`。街道路段匹配标记 `address-range`，也不是仓库大门位置。经纬度来源、匹配地址和日期保留在记录中。

坐标只用于参考地图和直线距离，不承诺驾驶距离、运输时间或入仓可用性。结果是否进入半径以对应参考点计算，近似点可能影响边界结果。无结果不等于当地没有仓库。

`scripts/prepare-us-warehouse-map.py` 显式构建坐标及城市/ZIP 索引；原始 Census 下载和匹配 CSV 保留在 `.tmp/fba-geo/` 便于复核。脚本复用缓存，刷新需先有意更新缓存并复核匹配数据。原始地址导入脚本为 `scripts/import-us-fba-reference.py`；重新导入地址后应重新生成坐标。

## 定位与地图来源

- `frontend/assets/data/us-location-index.json`：Census 2025 Gazetteer 的 32,058 个美国 place、33,642 个 ZIP/ZCTA 中心；城市和邮编可本地查询，不发外部请求。
- `/api/public/us-warehouse-location?q=...`：公开的 GET 定位接口，校验长度、限流、禁缓存。街道先调用固定 Census HTTPS 地址（5 秒主服务时限、最多 4 个并发）；失败或无结果时使用 Nominatim（10 秒上游时限）。所有候选限制美国，页面明确标注定位来源和精度；不接受调用者提供的外部 URL。
- 街道定位来源：<https://geocoding.geo.census.gov/geocoder/>。
- 地区索引：<https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/>。
- 地图边界：US Atlas v3；渲染使用本地 D3 v7、TopoJSON client v3。地图无外部瓦片或地图密钥依赖。
- 第三方示例：`frontend/assets/data/us-3pl-examples.json`，不是可发货目录，不提供虚构运营商、精确街道、合作关系、仓容或报价。

## 开发维护

页面模板 `frontend/fba-warehouses.html`；样式 `frontend/assets/css/warehouse-map.css`；交互 `frontend/assets/js/warehouse-map.mjs`；球面距离和过滤 `warehouse-map-model.mjs`。保留原 `fba-warehouses-model.mjs` 的文本搜索和复制格式化。
Go 页面和索引加载在 `internal/httpserver/fba_warehouses.go`、`warehouse_geocoder.go`。
数据、模板、静态库内嵌，修改后需重建并重启：`scripts/start-shipping-planner-preview.ps1 -Restart`。

线上服务器访问 Census 返回 HTML 拦截页，已增加 OpenStreetMap / Nominatim 备用服务，并通过真实线上地址查询验证。Census 的 `address-range` 和 OSM 的 `osm-reference` 分别显示街道路段估计与近似地图参考点，不能表示仓库大门。页面说明街道会发送到这些服务并提供 OSM 署名。

美国备用与欧洲街道查询共享 Nominatim 串行限流（间隔至少 1.1 秒）、24 小时内存缓存（最多 1024 项）。`CZCMS_WAREHOUSE_GEOCODER_URL` 可配置兼容上游或设为 `off`；保留旧的 `CZCMS_EU_GEOCODER_URL` 作为未设置新变量时的兼容配置。美国前端等待上限为 20 秒。

默认使用标准 HTTP(S)_PROXY 环境，可另设仅用于定位的 `CZCMS_GEOCODER_PROXY_URL`。Windows 本地启动器在未显式配置时读取现有桌面代理，部署不硬编码本机代理，TLS 校验保持开启。

本轮已同步美国首页静态快照中的页脚入口，详情见 `docs/deployment-ubuntu-ip.md`；数据库无需迁移。

## 本轮验证记录（2026-11-04）

- `go test ./...` 通过；最后的地址长度/专用站点端口/筛选 URL 检查后，`go test ./internal/httpserver ./internal/app` 再次通过。
- `node --test frontend/tests/*.test.mjs`：83 项通过，含球面距离、半径/服务/类型边界、坐标精度和示例隔离。
- Edge 实际浏览器：州点击/键盘/下拉、IN 隔离、清空、复制、地址候选确认、25/50 英里、排序、服务/类型切换、返回恢复、无脚本搜索均通过；无页面脚本错误。
- 边界场景：剪贴板拒绝后的手动复制、320/390/768/1600 宽无横向溢出、地图缩放、示例开关、地区入口、延迟响应失效、定位服务错误、地图资源失败时保留文本查询均通过。
- 实际请求 Census 完整街道地址成功（Moreno Valley / Washington, DC）；外部服务偶发超时按页面错误提示重试，不自动伪造结果。城市和 ZIP 查询使用内置索引。
- 新界面机械检查通过；桌面和手机视觉检查完成。截图在 `output/fba-map/implemented-*.png`，浏览器记录在 `.tmp/fba-map/live-results.json` 和 `edge-results.json`。


## 查询操作修正（2026-11-04）

用户测试发现：地址已匹配，但只有一条候选时仍需再点一次不明显的地址行，容易误以为没有附近仓库。
已改为唯一地点匹配时自动查询并显示结果；多个候选才要求选择，按钮明确写 Show nearby warehouses。
选择前的侧栏显示等待查询/选择提示，不把尚未选定地点表示为 0 个附近仓库；选定后在输入区也显示半径和结果数量。
静态资源版本升级至 20261104.3，避免浏览器沿用旧脚本。

验证：`node scripts/verify-warehouse-nearby.cjs` 检查实际页面上的唯一候选自动查询、多候选选择、编辑后旧距离清空和无匹配状态。
`node scripts/verify-warehouse-nearby.cjs --live` 调用实际 Census 服务，两个测试地址无需第二次点击：ONT8 地址 50 英里内 17 条（含 3 条明确标注的 3PL 示例），MDW2 地址 4 条。
9 项相关文本/距离/过滤测试通过，桌面和 390px 手机预览无页面错误、无横向溢出。新界面机械检查通过。

## 线上验收（2026-11-04）

已随六国版本发布。公网英语页面、51 个州/DC 地图形状、邮编、真实 ONT8 街道查询、多候选选择、类型筛选、旧距离清空、首页页脚入口、SEO 和 390px 手机布局通过；无脚本或资源加载错误。生产示例开关默认关闭。91761 和 ONT8 街道地点选择后，50 英里范围均显示 14 条已收录 FBA 参考地址。线上结果使用实际 OSM 备用服务，不能把预览中含示例的 17 条结果当作生产目录数量。
