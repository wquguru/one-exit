# one-exit

三份模板，让 Claude、Google（含 Gmail、Google Pay）、Persona、Stripe、人机验证，以及 Sentry、Datadog、Sift、Segment 走同一条静态住宅代理。Claude Code 更新说明、GitHub、常用网页资源 CDN 和 Microsoft Entra 登录的相关域名也使用这个出口。Anthropic 的 IPv6 段直接拒绝，避免住宅代理对 `2607:6bc0` 返回 502。

出口 IP 由这条住宅代理决定。本机先连订阅里的中转节点，再由中转去连住宅端口。直连时这一跳上的握手是明文，有的站点会在 TLS 开始后被掐断，同时 webshare 仍可能显示住宅 IP。

Clash Party 和 FlClash 用隐藏的测速组 `Dialer-Res` 做中转。默认收台湾、日本、新加坡、美国、韩国，不含香港。测速组换的是中转，出口 IP 不变。测速只看本机到中转。名字里没有这些地区的节点不会进组，需要时再放宽 `filter`。默认不写 `empty-fallback`：写上的名字必须是订阅里的节点，不能是策略组名，也不能是 `DIRECT`；名字不存在时整份配置起不来。中转入口全部不可用时，按配置注释把 `dialer-proxy` 改回 `DIRECT`。

Shadowrocket 没有这段正则。住宅节点建好后就设「代理通过」，指向一个固定节点，或指向你自己建的测速策略组。留空就是直连。

三台设备填同一套地址、端口、用户名和密码。做法和核对见下文。推文：[Claude 订阅方案（从 0 到 1 完整版，含支付和身份认证）](https://x.com/wquguru/status/2106041666922783181)。

## 文件

| 文件 | 用在 |
| --- | --- |
| `clash-party/override.yaml` | macOS Clash Party。用链接导入覆写。 |
| `flclash/claude-google.js` | 安卓 FlClash ≥ 0.8.85。Clash Party 那份 YAML 在 FlClash 里不会生效 |
| `shadowrocket/one-exit.module` | iOS Shadowrocket。加成本地模块，规则指向节点名 `SG_Residential` |

三份模板均默认包含上述功能域名的分流规则。各域名的用途、触发请求的功能，以及 Linux、Cowork、DNS、UDP 核对方法，见[服务域名与网络核对](docs/service-domains.md)。这些规则也会影响其他应用访问同一域名的流量。

## 住宅 HTTP 代理

Clash Party 和 FlClash 导入之后，住宅节点 `SG_Residential` 里仍是占位符。在本地把下面四项换成你的 HTTP 代理，三台设备用同一套：

| 字段 | 模板里现在是 | 换成 |
| --- | --- | --- |
| `server` | `<HOST>` | 代理地址 |
| `port` | `0` | 真实端口 |
| `username` | `<USERNAME>` | 用户名 |
| `password` | `<PASSWORD>` | 密码 |

改完不要再从链接更新这两份覆写。更新会把这四项盖回占位符。

Shadowrocket 的模块里没有这四项。地址、端口、用户名和密码写在首页那个 HTTP 节点上，备注必须是 `SG_Residential`。

## Clash Party

左侧「覆写」粘贴下面的链接导入：

`https://raw.githubusercontent.com/wquguru/one-exit/main/clash-party/override.yaml`

导入后按上一节改 `SG_Residential` 的地址、端口、用户名和密码。改完不要再更新这份覆写。然后打开内核设置，点旋转按钮重启服务。

## FlClash

覆写是一段 JavaScript，不是 Clash Party 那份 YAML。只粘贴、不在订阅上选中，不会生效。

1. 工具 → 进阶配置 → 脚本 → 添加，选择通过 URL 导入：

   `https://raw.githubusercontent.com/wquguru/one-exit/main/flclash/claude-google.js`
2. 打开刚导入的脚本，按「住宅 HTTP 代理」改掉 `server`、`port`、`username`、`password`。`port` 现在是 `0`，必须改成真实端口。不要重新从 URL 导入，否则这四项会被盖回占位符。
3. 配置 → 选中机场配置，点右侧配置按钮 → 覆写 → 脚本 → 选中刚添加的脚本。
4. 回到仪表盘，重启连接。

## Shadowrocket

不要改现有的懒人配置，也不要逐条点加规则。导出的配置里 `[Proxy]` 和 `[Proxy Group]` 是空的，节点在首页列表里；规则直接写节点备注。模块里的规则优先于配置文件，更新订阅不会把这几条冲掉。

1. 首页添加节点，类型 HTTP。备注必须是 `SG_Residential`，和模块里的策略名一致。地址、端口、用户名、密码和另外两台用同一套。模块里没有这些字段。
2. 点这个节点后面的 ⓘ，设置「代理通过」。选一个固定节点，或选一个测速分组。这一项写不进配置文件，留空就是从手机直连住宅端口。
3. 底部「配置」→「模块」→ 右上角 ＋，粘贴下面的链接再下载：

   `https://raw.githubusercontent.com/wquguru/one-exit/main/shadowrocket/one-exit.module`
4. 首页全局路由选「配置」。选「代理」时这些规则不生效。

## 核对

三台设备打开后，页面正文必须是同一个 IP：

```bash
curl -x http://127.0.0.1:7890 https://ipv4.webshare.io/
```

手机浏览器打开 `https://ipv4.webshare.io/`。

Mac 上的 Chrome 会用 QUIC 绕过系统代理。打开 `chrome://flags/#enable-quic`，设为 Disabled。Claude Code 不走系统代理，终端里加上：

```zsh
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
```
