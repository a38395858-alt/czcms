# 计算器多语种落地 — 按国家分目的地

> 决策：目的地按国家分；每个国家的目的港、区域划分、时效、价格、SEO 关键词都独立。
> 状态：蓝图定稿，按国家逐个实现，先德文站。

## 一、每个国家一套的四个维度

| 维度 | 说明 |
|---|---|
| 目的港 | 该国的实际海港 + 空港 + 内陆堆场 |
| 区域划分 | 表格分组用（如德国北部/西部/南部/东部） |
| 线路数据 | 20 个中国起运地 × 7 个目的地的时效与价格 |
| SEO | 该国搜索习惯的标题、描述、关键词、FAQ |

## 二、五国港口与区域

### 德国 de

| 区域 | 目的港 |
|---|---|
| 北部 | Hamburg（汉堡港）、Bremerhaven（不来梅哈芬） |
| 西部 | Duisburg（杜伊斯堡内陆港）、Düsseldorf |
| 南部 | Munich（慕尼黑铁路堆场）、Stuttgart |
| 东部 | Berlin、Leipzig（莱比锡铁路堆场） |

关键词主干：`Versand von China nach Deutschland`、`Seefracht China Deutschland`、`Sammelgut`、`Zollabfertigung`、`Einfuhrumsatzsteuer 19%`、`EORI`、`Laufzeit`

### 法国 fr

| 区域 | 目的港 |
|---|---|
| 北部 | Le Havre（勒阿弗尔）、Dunkerque |
| 南部 | Marseille-Fos（马赛福斯） |
| 西部 | Nantes / Saint-Nazaire |
| 内陆 | Paris CDG（空运）、Lyon |

关键词主干：`expédition Chine France`、`fret maritime Chine France`、`groupage`、`dédouanement`、`TVA 20%`、`EPR`、`Triman`、`délai de transit`

### 西班牙 es

| 区域 | 目的港 |
|---|---|
| 东部 | Valencia（瓦伦西亚）、Barcelona（巴塞罗那） |
| 南部 | Algeciras（阿尔赫西拉斯） |
| 北部 | Bilbao（毕尔巴鄂） |
| 内陆 | Madrid（马德里铁路堆场） |

关键词主干：`envío de China a España`、`transitario`、`grupaje`、`despacho de aduanas`、`IVA 21%`、`plazo de tránsito`

### 意大利 it

| 区域 | 目的港 |
|---|---|
| 北部 | Genoa（热那亚）、La Spezia（拉斯佩齐亚）、Trieste（的里雅斯特） |
| 南部 | Naples（那不勒斯）、Gioia Tauro |
| 内陆 | Milan（米兰堆场）、Verona |

关键词主干：`spedizione dalla Cina all'Italia`、`spedizioniere`、`groupage`、`sdoganamento`、`IVA 22%`、`tempi di transito`

### 荷兰 nl

| 区域 | 目的港 |
|---|---|
| 主港 | Rotterdam（鹿特丹） |
| 次港 | Amsterdam（阿姆斯特丹）、Moerdijk |
| 内陆 | Venlo（芬洛）、Tilburg |

关键词主干：`verzending van China naar Nederland`、`zeevracht`、`expediteur`、`douane-inklaring`、`btw 21%`、`levertijd`、`Rotterdam hub`

## 三、每套需要交付的东西

1. `assets/data/shipping-planner.demo.json` 的国家变体（或按站点 id 拆分）
2. `shipping-planner.mjs` 里一套语言文案（约 90 条）
3. 路由注册：该站 `/tools/shipping-calculator`
4. 首页入口区块（`sp-tool-link`）的本地化
5. SEO：title / description / keywords / FAQ schema
6. 参考表：区域分组换成该国区域名

## 四、实施顺序

1. 德国（de）— 完整跑通，给用户验收
2. 法国（fr）
3. 西班牙（es）
4. 意大利（it）
5. 荷兰（nl）
