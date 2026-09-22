# one-exit

三份模板，把 Claude 和 Google（含 Gmail、Google Pay）钉在同一条静态住宅代理上。

出口 IP 由这条代理决定。中转只负责从你这边连上代理端口。默认直连。直连超时再改 `dialer-proxy`，填你订阅里一个固定节点的名字，不要填自动测速组。

三台设备填同一组地址、端口、用户名、密码。

验收只看这个地址，三端正文必须是同一个 IP：

```bash
curl -x http://127.0.0.1:7890 https://ipv4.webshare.io/
```

手机浏览器打开 `https://ipv4.webshare.io/`。

## 文件

| 文件 | 用在 |
| --- | --- |
| `clash-party/override.yaml` | macOS Clash Party。配进覆写，不要改 `work/config.yaml` |
| `flclash/claude-google.js` | 安卓 FlClash ≥ 0.8.85。Party 的 YAML 在这里不生效 |
| `shadowrocket/rules.txt` | iOS Shadowrocket。节点和策略组要先建好，规则从列表顶部加 |

把尖括号占位换成你的代理信息。Clash Party 改完后在界面里刷新当前订阅。FlClash 要在订阅上关联这段脚本再下拉刷新，只粘贴不生效。

Mac 上 Chrome 会用 QUIC 绕过系统代理。打开 `chrome://flags/#enable-quic`，设成 Disabled。Claude Code 不读系统代理，终端需要：

```zsh
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
```
