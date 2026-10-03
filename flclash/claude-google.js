// FlClash 覆写脚本（≥ 0.8.85）
// 安装：工具 → 进阶配置 → 脚本 → 添加，用 URL 导入本文件的 raw 链接。
// 配置 → 选中机场 → 右侧配置 → 覆写 → 脚本 → 选中刚添加的脚本 → 仪表盘重启连接。
// 不要把 Clash Party 的 +rules / proxies+: 贴进来。
// 默认先经 Dialer-Res 再连住宅端口。出口 IP 仍是这条住宅代理。
// 默认收台湾、日本、新加坡、美国、韩国，不含香港。
// 节点名里没有这些地区时，改 FILTER，并把 FALLBACK 写成一个真实节点名，不要写 DIRECT。
// 回滚（中转入口全灭，并且接受 TLS 被掐）：删掉 Dialer-Res 那一组，dialer-proxy 改成 "DIRECT"。

const main = (config) => {
  const LANDING = "SG_Residential";
  const DIALER = "Dialer-Res";
  const FILTER = "(?i)(台湾|台灣|日本|新加坡|美国|美國|韩国|韓國|\\b(TW|JP|SG|US|KR)\\b)";
  const FALLBACK = "<一个真实节点名>";

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
    "empty-fallback": FALLBACK,
  });

  const pin = [
    "DOMAIN-SUFFIX,clau.de," + LANDING,
    "DOMAIN-KEYWORD,anthropic," + LANDING,
    "DOMAIN-KEYWORD,claude," + LANDING,
    "DOMAIN-KEYWORD,modelcontextprotocol," + LANDING,
    "IP-CIDR,160.79.104.0/21," + LANDING + ",no-resolve",
    "IP-CIDR6,2607:6bc0::/48," + LANDING + ",no-resolve",
    "IP-ASN,399358," + LANDING + ",no-resolve",
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
  ];
  config.rules = pin.concat(config.rules || []);
  return config;
};
