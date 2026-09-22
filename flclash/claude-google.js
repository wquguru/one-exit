// FlClash 覆写脚本（≥ 0.8.85）
// 安装：配置 → 覆写脚本 → 粘贴 → 订阅 ⋮ → 更多 → 覆写 → 关联此脚本 → 下拉刷新
// 不要把 Clash Party 的 +rules / proxies+: 贴进来。

const main = (config) => {
  const LANDING = "SG_Residential";

  config.proxies = config.proxies || [];
  config.proxies.push({
    name: LANDING,
    type: "http",
    server: "<HOST>",
    port: 0,
    username: "<USERNAME>",
    password: "<PASSWORD>",
    "dialer-proxy": "DIRECT",
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
    "PROCESS-NAME,com.android.vending," + LANDING,
    "PROCESS-NAME,com.google.android.apps.walletnfcrel," + LANDING,
  ];
  config.rules = pin.concat(config.rules || []);
  return config;
};
