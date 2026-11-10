# dsh-openfin

[English](README.en.md) | 中文

[![ci](https://github.com/5777-wq/dsh-openfin/actions/workflows/ci.yml/badge.svg)](https://github.com/5777-wq/dsh-openfin/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dsh-openfin?label=npm)](https://www.npmjs.com/package/dsh-openfin)
[![license](https://img.shields.io/badge/license-MIT-black)](LICENSE)

> 装进 DeepSeek Harness 的金融看板与白话学院：A股/港股/美股/商品/加密行情、行业热力图、异动榜、财经快讯，加上 25 篇白话金融文章与 293 条金融词典，全部作为 **DSH 里的一个原生页面**（不是 iframe，不是外链）。

![行情页](docs/screenshots/market.jpg)

## 它是什么

OpenFin 把两块东西放进同一个 DSH 页面：

- **行情**：11 个全球标的（上证、深证、创业板、恒生、纳指、标普、道指、COMEX 黄金、美元指数、BTC、ETH）+ A股 96 个行业板块的市值热力图 + 涨跌幅/成交额异动榜 + 东方财富财经快讯。点任意板块，在热力图下方展开成分股。
- **学院**：`opencode` 式的白话金融读物——7 场危机复盘、13 个标的百科、概念与周期文章，共 25 篇，正文带术语链接；再加一个 293 条的金融词典（含「今日一词」）。

页面是 DSH 侧边栏里的一行，点开就是整页，跟随宿主主题（浅色/深色/第三方皮肤）、语言（中/英）与窗口宽度；动效只动 `transform`/`opacity`，并遵守 `prefers-reduced-motion`。

| 学院 | 词典 |
|---|---|
| ![学院](docs/screenshots/academy.jpg) | ![词典](docs/screenshots/glossary.jpg) |

| 板块成分股 | 文章阅读 |
|---|---|
| ![板块](docs/screenshots/sector.jpg) | ![文章](docs/screenshots/article.jpg) |

## 安装

**桌面端**：打开 **插件** 页 → 右上 **+ 安装** → 粘贴

```text
github:5777-wq/dsh-openfin
```

**`dsh web`**：

```sh
dsh plugin --profile web add github:5777-wq/dsh-openfin
```

**预构建 tarball**（无需构建、无需 `allowBuilds`）：

```sh
dsh plugin --profile web add https://github.com/5777-wq/dsh-openfin/releases/latest/download/dsh-openfin.tgz
```

装完刷新页面，在侧边栏点 **OpenFin**；若侧边栏没有出现，重启一次 DSH。

## 需要什么

- DeepSeek Harness **0.2.2-rc.1** 或更新的 0.2.x（`engines.dsh` 已声明）。
- 能访问公开行情接口的网络（东方财富 / Binance / OKX / CoinGecko 任一可达）。
- 不需要 API key，不需要登录，不需要 Python 或本地编译。

## 数据与隐私

- 行情由插件的 **Host 半场**在 DSH 进程里请求公开接口，浏览器只和 `127.0.0.1` 同源通信，因此没有浏览器 CORS 问题，也不暴露第三方域名给页面。
- 所有数据请求都是匿名 `GET`；插件不上报、不写盘、不读取你的任何文件与会话。
- 行情快照缓存 30 秒（页面按返回的 `refreshMs` 轮询）；单个上游失败时返回其余部分并标注「部分数据延迟」，不会整页报错。
- 文章与词典随插件发布，来自 MIT 协议的姊妹项目：[openfin-academy](https://github.com/5777-wq/openfin-academy)、[openfinlens](https://github.com/5777-wq/openfinlens)。署名见 [NOTICE.md](NOTICE.md)。

## 交互

| 位置 | 操作 |
|---|---|
| 侧边栏 **OpenFin** | 打开整页 |
| **行情**页签 | 指数卡片实时刷新；点板块展开成分股；异动榜切涨幅/跌幅/成交额；快讯点开新标签 |
| **学院**页签 | 搜索、按栏目筛选、点卡片看正文；正文里的绿色术语可点开释义 |
| **词典**页签 | 今日一词 + 293 条词条；点卡片原地展开比喻/数字/坑 |
| 右上刷新按钮 | 立刻拉一次快照（轮询照常） |

## 开发

```sh
npm install
npm run build        # 生成 client/client.js（单文件 ModuleLoader 产物）
npm run check        # 校验 manifest/补丁/locale/图标/产物/数据
node --test "tests/**/*.test.mjs"
```

内容来自姊妹仓库，重新生成：

```sh
node scripts/sync-academy.mjs --academy ../openfin-academy --openfinlens ../openfinlens
```

结构：

```text
index.js                  Host 半场入口（注册 /dsh-openfin 路由）
lib/                      行情抓取、缓存、快照组装、学院数据、HTTP 路由
client/src/               页面源码（React，打包成单文件）
client/client.js          提交的构建产物（安装时不需要构建）
data/                     文章索引、25 篇正文、293 条词典（由 sync 脚本生成）
locale/                   中英文字典（插件管理页也读这里）
docs/SPEC.md              接口与模块契约
```

## 已知边界

- 行情是公开接口的聚合，可能延迟或缺失；页面会标注，不构成投资建议。
- 学院正文是中文原文；英文界面只翻译界面文案。
- 仅测试了 DSH 0.2.2-rc.1 桌面端与 `dsh web`。

## 许可

MIT。第三方署名与许可全文见 [NOTICE.md](NOTICE.md) 与 [LICENSES/](LICENSES/)。
