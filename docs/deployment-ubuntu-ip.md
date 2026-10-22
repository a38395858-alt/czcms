# Ubuntu IP 部署

部署目标：`170.106.116.93`，Ubuntu 26.04 LTS / amd64。

- 网站：<https://170.106.116.93/>
- 后台：<https://170.106.116.93/admin>
- 健康检查：<https://170.106.116.93/healthz>
- 后台保留本地已有账号和密码；服务器 SSH 账号与网站账号分开。

## 运行结构

Nginx 接收 80/443 请求，HTTP 自动跳转 HTTPS；Go 应用监听 `127.0.0.1:8080`。
服务以独立 `czcms` 用户运行，生产环境关闭本地语言预览端口。

| 路径 / 服务 | 用途 |
| --- | --- |
| `/opt/czcms/releases/<UTC时间>/czcms` | 每次发布的 Linux 程序，内嵌前端资源 |
| `/opt/czcms/current` | 当前发布的符号链接 |
| `/var/lib/czcms/data/czcms.db` | 在线 SQLite 数据库 |
| `/var/lib/czcms/uploads` | 媒体文件 |
| `/var/lib/czcms/themes` | 模板包文件 |
| `/var/lib/czcms/backups` | 服务器新建的加密备份 |
| `/etc/czcms/production.env` | 生产配置和密钥，仅 root 可读（0600） |
| `/etc/nginx/sites-available/czcms` | Nginx 配置 |
| `czcms.service` | 应用服务，开机启动，异常退出自动重启 |
| `clamav-daemon.service` / `clamav-freshclam.service` | 上传扫描与病毒库更新 |
| `czcms-certbot-renew.timer` | 每 6 小时检查 IP 证书续期 |

仓库中的 `deploy/ubuntu/` 保存实际使用的服务和 Nginx 配置，不包含凭据。
数据库通过 SQLite backup API 生成一致快照后迁移，媒体、模板文件同步迁移。
原应用主密钥用于保留加密数据的可读性，备份密钥与安装令牌在服务器重新生成。
本地历史备份和开发日志留在本地；生产备份使用独立新密钥。
部署只修改服务器副本的主站绑定：`www.example.com` 改为服务器 IP。

2026-10-20 首次发布目录为 `/opt/czcms/releases/20261020T060504Z`。
迁移时核对了 1 个用户、11 条内容、13 个语言版本、31 个媒体记录、
2 个模板和 1 条表单提交；用户记录逐字段校验一致。

## HTTPS

证书由 Let's Encrypt 签发，使用 IP 标识和 `shortlived` 配置。
证书有效期较短，必须保持续期定时器、80 端口和 ACME challenge 路径可用。
Certbot 5.8 位于 `/opt/certbot/bin/certbot`，续期成功后自动检查并重新加载 Nginx。

```sh
sudo systemctl list-timers czcms-certbot-renew.timer
sudo systemctl start czcms-certbot-renew.service
sudo journalctl -u czcms-certbot-renew.service -n 30 --no-pager
sudo /opt/certbot/bin/certbot certificates
sudo /opt/certbot/bin/certbot renew --dry-run --run-deploy-hooks --no-random-sleep-on-renew --cert-name czcms-ip
```

以后绑定域名时，需要同步修改后台站点域名、Nginx `server_name` / 跳转目标，
并为域名申请和配置证书。

## 日常操作

```sh
sudo systemctl status czcms nginx clamav-daemon --no-pager
sudo journalctl -u czcms -n 100 --no-pager
sudo systemctl restart czcms
curl --fail https://170.106.116.93/healthz
```

后续更新应构建新的 Linux amd64 程序、上传到新的 release 目录，校验后切换
`/opt/czcms/current` 并重启服务。不要用旧迁移包覆盖生产数据库和媒体目录。
更新前通过后台导出完整加密备份，并独立保管生产主密钥和备份密钥。

2026-10-22 共享头部更新发布到 `/opt/czcms/releases/20261022T062752Z-header`。
此次仅替换内嵌前端资源的程序，线上内容、用户密码、SMTP 配置、媒体和 Nginx 配置保留。
更新前通过 SQLite backup API 保存一致快照到
`/var/lib/czcms/deploy-backups/20261022T062752Z-header/czcms.db`（root 专用目录，文件权限 0600）。
旧版本 `/opt/czcms/releases/20261020T060504Z` 保留，可切回其符号链接并重启服务。
上传与安装后的程序 SHA-256 一致，账号摘要校验一致，服务健康检查通过。
公网 18 个页面确认仅有一个共享头部；桌面首页、专题、文章列表、文章详情及六种语言的
手机菜单检查通过，没有 JavaScript 报错。新增头部样式、交互脚本均返回 200，禁止抓取规则保留。

## 搜索引擎抓取开关

2026-10-22 按要求禁止线上网站的搜索引擎抓取和索引。
Nginx 在 HTTP / HTTPS 的 `/robots.txt` 返回以下完整规则，覆盖应用生成的规则：

```text
User-agent: *
Disallow: /
```

HTTPS 所有响应统一添加 `X-Robots-Tag: noindex, nofollow, noarchive`，
并隐藏应用原有的同名响应头，避免产生重复策略。
HTTP 响应同样添加该头；robots 文件禁止缓存，其他 HTTP 页面继续跳转 HTTPS。
此配置不依赖后台自定义 robots 规则，也不影响正常访客浏览及证书验证。

以后恢复搜索引擎抓取时，需移除 `deploy/ubuntu/nginx.conf` 及线上配置中的
两处 robots 拦截和禁止索引响应头、HTTPS 代理的 `proxy_hide_header X-Robots-Tag`，
再检查后台各站点的 robots 自定义规则及页面索引设置。
robots 是自愿遵守的爬虫协议，不能阻止不遵守规则的采集程序；已收录页面也不会立即消失。

## 邮件与其他语言

SMTP 配置随数据库保留。发件人与收件人均为 `38395858@qq.com`，
服务器 `smtp.qq.com`，端口 `465`，TLS。
2026-10-20 已在生产服务器加密保存 SMTP 授权码，测试邮件获得 QQ SMTP 接受，
并已启用表单邮件转发。授权码不保存在文档或仓库中。
后续更换授权码时，在 QQ 邮箱网页版的“设置 → 账户”中生成新授权码，
到后台“系统设置 → 邮件转发”保存后发送测试邮件。此处填写授权码，不是 QQ 登录密码。

尚未绑定正式域名的其他语言站点仍可通过 `/preview/germany`、`/preview/france`、
`/preview/spain`、`/preview/italy`、`/preview/netherlands` 检查，预览页保持 noindex。
为其他站点绑定正式域名并配置 DNS / HTTPS 后，会显示相应的公开语言入口。

## 上线检查

- 默认信任库成功校验公网 HTTPS 证书，HTTP 请求跳转 HTTPS。
- 主站首页、10 个专题、登录页、SEO 文件、健康检查及 5 个语言站的首页和专题共 25 个页面返回 200。
- 页面引用的 112 个本站静态资源检查通过，没有返回 HTML 错误页。
- `/admin` 未登录时跳转登录页，SMTP 接口未登录返回 401，已初始化的 `/setup` 跳转登录页。
- 登录 Cookie 带有 `__Host-` 前缀、Secure 和 HttpOnly。
- 网站进程仅监听回环地址；Nginx、应用、扫描器及证书定时器已启用。
- Certbot 模拟续期及 Nginx 自动重载检查成功，续期服务运行结果为 success。
- IP 绑定与多语言专题回归测试通过，迁移时没有发送真实邮件。
