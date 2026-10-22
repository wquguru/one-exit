# 功能域名与 Linux 网络核对

三份模板中的下面 9 条规则均默认生效，统一指向 `SG_Residential`，让相关功能的请求也使用与 Claude 相同的住宅出口。

现有配置如果已经把这些域名交给默认代理，它们可能早已走代理。这次补充把它们明确交给住宅节点，避免继续由原配置中的其他出口处理。

## 规则与功能

| 功能 | 域名 | 用途与请求触发场景 |
| --- | --- | --- |
| CLI 更新说明 | `raw.githubusercontent.com` | Claude Code 获取更新说明；交互式会话启动时缓存未覆盖当前版本，或查看更新说明时会请求。 |
| GitHub 功能 | `github.com` | GitHub 授权、插件与插件市场下载等功能使用的地址。 |
| GitHub 功能 | `api.github.com` | GitHub 集成功能查询仓库、PR 等信息时使用的 API。 |
| Linux 拼写字典 | `gvt1.com` | 覆盖字典下载中的 `redirector.gvt1.com` 和下载跳转后的子域名；用于请求这些地址的 Linux 桌面应用。 |
| 网页资源 | `cdnjs.cloudflare.com` | 图表、预览或网页内容引用该站点时，从这里加载资源。 |
| 网页资源 | `cdn.jsdelivr.net` | 图表、预览或网页内容引用该站点时，从这里加载资源。 |
| 网页资源 | `esm.sh` | 图表、预览或网页内容引用该站点时，从这里加载模块。 |
| 网页资源 | `unpkg.com` | 图表、预览或网页内容引用该站点时，从这里加载程序包。 |
| Foundry 登录 | `login.microsoftonline.com` | 使用 Microsoft Foundry 并采用 Microsoft Entra 登录时，处理登录认证；模型服务地址另外按实际配置核对。 |

Claude Code 官方说明列出了[更新说明和 GitHub 插件请求](https://code.claude.com/docs/en/network-config)。Electron 的 Linux 拼写检查会[从 Google CDN 下载字典](https://www.electronjs.org/docs/latest/tutorial/spellchecker)，Chromium 的[相关提交](https://chromium.googlesource.com/chromium/src/+/b2c43c13c9b6a49ec26cc5fdd178b4f2b612a8a9)给出了 `redirector.gvt1.com` 下载地址。Foundry 的登录方式见[Claude Code 文档](https://code.claude.com/docs/en/microsoft-foundry)，Entra 的登录端点见[Microsoft 文档](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)。

## 生效方式与影响

规则已分别加入 [Clash Party 的 `+rules`](../clash-party/override.yaml)、[FlClash 的 `pin` 数组](../flclash/claude-google.js)和 [Shadowrocket 的 `[Rule]`](../shadowrocket/one-exit.module)。把规则更新到本地模板后，按客户端流程重新加载配置或重启连接即可生效。住宅节点的填写和导入方法见 [README](../README.md#住宅-http-代理)；更新时保留本地填写的住宅代理信息。

除 `gvt1.com` 使用 `DOMAIN-SUFFIX` 覆盖下载跳转子域名外，其余 8 条均用 `DOMAIN` 精确匹配表中的主机名。域名匹配只看主机名；例如 `raw.githubusercontent.com/anthropics/...` 中的路径不会命中 `anthropic` 域名关键词。

GitHub、CDN 和 Microsoft 登录都是共享服务。这些规则按目标域名分流，其他应用访问同一域名时也会使用住宅出口；相关下载和资源请求会计入住宅代理流量。

自定义模型网关、远程 MCP、企业日志服务和软件包仓库，应按实际使用的主机名核对。`modelcontextprotocol.io` 只覆盖这个域名，无法覆盖部署在其他地址上的 MCP 服务。

## 在 Linux 上适配时核对网络路径

以下供把桌面模板适配到兼容客户端时参考；仓库提供的客户端及平台入口见 [README](../README.md#文件)。域名条目生效的前提是连接已经进入相应客户端的规则引擎。

1. **分别检查程序的入口。** 核对桌面应用、CLI、登录浏览器，以及实际使用的 VM 或容器。系统代理只影响采用该代理设置的程序；使用 TUN 时，也要检查这些环境的连接是否被接管。Cowork 等功能先确认任务是在本地还是云端执行，再在实际执行位置核对网络；具体部署方式见 [Cowork 架构说明](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview)。VM、容器或云端工作环境的连接应分别验证。
2. **单独检查 DNS。** 域名规则没有代替完整的 DNS 配置。检查系统解析、浏览器安全 DNS 和应用独立解析的路径，以及客户端最终选择的 DNS 上游。
3. **明确 UDP 的处理。** Clash Party 和 FlClash 模板使用 HTTP 住宅节点。Mihomo 遇到不支持 UDP 的节点时，UDP 请求会继续向后匹配规则；原配置应明确让这些请求走哪个支持 UDP 的出口，或按功能需要拒绝。Shadowrocket 按其客户端行为分别核对。见 [Mihomo 规则说明](https://wiki.metacubex.one/config/rules/)。
4. **分别检查本机和代理端的 IPv6。** 两条 `IP-CIDR6` 规则只拒绝指定网段；`no-resolve` 不会为匹配本条规则主动触发解析。HTTP 代理接收目标域名时，目标解析在代理端完成，本机规则管不到代理端最终选用的 IPv4 或 IPv6。见 [Mihomo 的 no-resolve 说明](https://wiki.metacubex.one/config/rules/#no-resolve)和 [Chromium HTTP 代理说明](https://chromium.googlesource.com/chromium/src/+/HEAD/net/docs/proxy.md#http-proxy-scheme)。

验证时，实际触发所需功能，在客户端连接记录中查看对应域名、命中的规则和最终出口。对 VM 或容器，也要从内部发起请求检查。IP 查询网页只显示该网页请求的出口，不能代替其他应用连接的核对。
