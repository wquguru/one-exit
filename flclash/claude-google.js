// FlClash 覆写脚本（≥ 0.8.85）
// 安装：工具 → 进阶配置 → 脚本 → 添加，用 URL 导入本文件的 raw 链接。
// 配置 → 选中机场 → 右侧配置 → 覆写 → 脚本 → 选中刚添加的脚本 → 仪表盘重启连接。
// 不要把 Clash Party 的 +rules / proxies+: 贴进来。
// 默认先经 Dialer-Res 再连住宅端口。出口 IP 仍是这条住宅代理。
// 默认收台湾、日本、新加坡、美国、韩国，不含香港。测速只看本机到中转，不看中转到住宅。
// 名字里没有这些地区的节点（例如 Fast、Balancer、TLS）不会进组。要收它们就放宽 FILTER。
// 默认不写 empty-fallback。这一项只能填订阅里的节点名，不能填策略组名，也不能填 DIRECT。
// 名字不存在时整份配置会被拒绝，哪怕组里已经有节点。订阅更新把节点改名后也会一起挂。
// 节点名完全没有地区词、组会被滤空时，再给 Dialer-Res 加上 "empty-fallback"。
// 不要把中转成员写成 US、JP 这类组名。各组机场的策略组名字不一样。
// 回滚（中转入口全灭，并且接受 TLS 被掐）：删掉 Dialer-Res 那一组，dialer-proxy 改成 "DIRECT"。

const main = (config) => {
  const LANDING = "SG_Residential";
  const DIALER = "Dialer-Res";
  const FILTER = "(?i)(台湾|台灣|日本|新加坡|美国|美國|韩国|韓國|\\b(TW|JP|SG|US|KR)\\b)";

  config.proxies = config.proxies || [];
  config.proxies.push({
    name: LANDING,
    type: "http",
    server: "<HOST>",
    port: 0,
    username: "<USERNAME>",
    password: "<PASSWORD>",
    "dialer-proxy": DIALER,
    // "dialer-proxy": "DIRECT",
  });

  config["proxy-groups"] = config["proxy-groups"] || [];
  config["proxy-groups"].push({
    name: DIALER,
    type: "url-test",
    hidden: true,
    url: "https://www.gstatic.com/generate_204",
    interval: 300,
    tolerance: 50,
    lazy: false,
    "include-all": true,
    filter: FILTER,
    "exclude-filter": "(?i)倍率|IPv6|到期|剩余|官网|失联|故障|香港|\\bHK\\b",
  });

  const pin = [
    // 住宅代理连 2607:6bc0 会 502。放在域名规则前面，拒绝 IPv6，让客户端改走 IPv4。
    "IP-CIDR6,2607:6bc0::/48,REJECT,no-resolve",
    "IP-CIDR6,2607:6bc0:11::/48,REJECT,no-resolve",
    "DOMAIN-SUFFIX,clau.de," + LANDING,
    "DOMAIN-SUFFIX,claudemcpcontent.com," + LANDING,
    "DOMAIN-KEYWORD,anthropic," + LANDING,
    "DOMAIN-KEYWORD,claude," + LANDING,
    "DOMAIN-KEYWORD,modelcontextprotocol," + LANDING,
    "DOMAIN-KEYWORD,browser-intake," + LANDING,
    "IP-CIDR,160.79.104.0/21," + LANDING + ",no-resolve",
    "IP-ASN,399358," + LANDING + ",no-resolve",
    "DOMAIN-SUFFIX,sentry.io," + LANDING,
    "DOMAIN-SUFFIX,datadoghq.com," + LANDING,
    "DOMAIN-SUFFIX,growthbook.io," + LANDING,
    "DOMAIN-SUFFIX,usefathom.com," + LANDING,
    "DOMAIN-SUFFIX,hcaptcha.com," + LANDING,
    "DOMAIN-SUFFIX,stripe.com," + LANDING,
    "DOMAIN-SUFFIX,stripe.network," + LANDING,
    "DOMAIN-SUFFIX,stripecdn.com," + LANDING,
    "DOMAIN-SUFFIX,intercom.io," + LANDING,
    "DOMAIN-SUFFIX,intercomcdn.com," + LANDING,
    "DOMAIN-SUFFIX,challenges.cloudflare.com," + LANDING,
    "DOMAIN-SUFFIX,siftscience.com," + LANDING,
    "DOMAIN-SUFFIX,segment.io," + LANDING,
    "PROCESS-NAME,com.anthropic.claude," + LANDING,
    "DOMAIN-SUFFIX,webshare.io," + LANDING,

    "DOMAIN-SUFFIX,google.com," + LANDING,
    "DOMAIN-SUFFIX,googleapis.com," + LANDING,
    "DOMAIN-SUFFIX,gstatic.com," + LANDING,
    "DOMAIN-SUFFIX,googleusercontent.com," + LANDING,
    "DOMAIN-SUFFIX,gmail.com," + LANDING,
    "DOMAIN-SUFFIX,recaptcha.net," + LANDING,
    "DOMAIN-SUFFIX,withpersona.com," + LANDING,
    "PROCESS-NAME,com.android.vending," + LANDING,
    "PROCESS-NAME,com.google.android.apps.walletnfcrel," + LANDING,

    // 相关功能统一走住宅出口；用途和网络核对见 docs/service-domains.md。
    // 同一域名上的其他软件流量也会走住宅出口。

    // Claude Code 更新说明下载。
    "DOMAIN,raw.githubusercontent.com," + LANDING,

    // GitHub 授权、插件/插件市场下载，以及仓库、PR 等 API 请求。
    "DOMAIN,github.com," + LANDING,
    "DOMAIN,api.github.com," + LANDING,

    // Google CDN：包括 Linux 拼写字典下载及其 gvt1.com 子域名跳转。
    "DOMAIN-SUFFIX,gvt1.com," + LANDING,

    // 图表、预览或网页内容引用的第三方程序库和模块。
    "DOMAIN,cdnjs.cloudflare.com," + LANDING,
    "DOMAIN,cdn.jsdelivr.net," + LANDING,
    "DOMAIN,esm.sh," + LANDING,
    "DOMAIN,unpkg.com," + LANDING,

    // Microsoft Entra 登录，例如 Foundry 使用 Entra 身份验证时。
    "DOMAIN,login.microsoftonline.com," + LANDING,
  ];
  config.rules = pin.concat(config.rules || []);
  return config;
};
