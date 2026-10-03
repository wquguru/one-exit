#!/usr/bin/env python3
"""Parse the three templates and reject a dialer config that would not load."""

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
POLICY = "SG_Residential"
RULE_TYPES = {
    "DOMAIN-SUFFIX",
    "DOMAIN-KEYWORD",
    "IP-CIDR",
    "IP-CIDR6",
    "IP-ASN",
    "PROCESS-NAME",
}


def fail(message):
    print(message, file=sys.stderr)
    sys.exit(1)


def compile_filter(label, pattern):
    if not isinstance(pattern, str) or not pattern.strip():
        fail(f"{label} is empty")
    try:
        re.compile(pattern)
    except re.error as exc:
        fail(f"{label} is not a regex: {exc}")


def check_party():
    path = ROOT / "clash-party" / "override.yaml"
    doc = yaml.safe_load(path.read_text())
    if not isinstance(doc, dict):
        fail(f"{path.name} is not a mapping")

    proxies = doc.get("proxies+")
    if not isinstance(proxies, list) or not proxies:
        fail("proxies+ is missing")
    leaf = proxies[0]
    if leaf.get("name") != POLICY:
        fail(f"residential proxy must be named {POLICY}")
    if leaf.get("dialer-proxy") != "Dialer-Res":
        fail("dialer-proxy must be Dialer-Res")
    for key in ("server", "port", "username", "password"):
        if key not in leaf:
            fail(f"residential proxy missing {key}")

    groups = doc.get("proxy-groups+")
    if not isinstance(groups, list) or not groups:
        fail("proxy-groups+ is missing")
    dialer = groups[0]
    if dialer.get("name") != "Dialer-Res" or dialer.get("type") != "url-test":
        fail("first proxy group must be url-test Dialer-Res")
    compile_filter("Dialer-Res filter", dialer.get("filter"))
    compile_filter("Dialer-Res exclude-filter", dialer.get("exclude-filter"))
    fallback = dialer.get("empty-fallback")
    if not isinstance(fallback, str) or not fallback.strip() or fallback == "DIRECT":
        fail("empty-fallback must be a node name, not DIRECT")

    rules = doc.get("+rules")
    if not isinstance(rules, list) or not rules:
        fail("+rules is missing")
    for rule in rules:
        check_rule(rule, POLICY)


def check_rule(rule, policy):
    if not isinstance(rule, str):
        fail(f"rule is not a string: {rule!r}")
    parts = [part.strip() for part in rule.split(",")]
    if len(parts) < 3 or parts[0] not in RULE_TYPES:
        fail(f"unrecognized rule: {rule}")
    target = parts[2]
    if target != policy:
        fail(f"rule policy is {target}, expected {policy}: {rule}")


def js_string(source, name):
    match = re.search(rf'const {name} = "((?:\\.|[^"\\])*)"', source)
    if not match:
        fail(f"missing const {name}")
    return match.group(1)


def check_flclash():
    path = ROOT / "flclash" / "claude-google.js"
    source = path.read_text()
    if '"dialer-proxy": DIALER' not in source:
        fail("FlClash leaf must use dialer-proxy DIALER")
    compile_filter("FlClash FILTER", js_string(source, "FILTER"))
    exclude = re.search(r'"exclude-filter": "((?:\\.|[^"\\])*)"', source)
    if not exclude:
        fail("FlClash exclude-filter is missing")
    compile_filter("FlClash exclude-filter", exclude.group(1))
    fallback = js_string(source, "FALLBACK")
    if not fallback.strip() or fallback == "DIRECT":
        fail("FlClash FALLBACK must be a node name, not DIRECT")


def check_shadowrocket():
    path = ROOT / "shadowrocket" / "one-exit.module"
    lines = path.read_text().splitlines()
    if not lines[0].startswith("#!name=") or "[Rule]" not in lines:
        fail("shadowrocket module is missing the name header or [Rule]")
    found = False
    in_rules = False
    for line in lines:
        stripped = line.strip()
        if stripped == "[Rule]":
            in_rules = True
            continue
        if not in_rules or not stripped or stripped.startswith("#"):
            continue
        found = True
        check_rule(stripped, "SG_Residential")
    if not found:
        fail("shadowrocket rules are empty")


def main():
    check_party()
    check_flclash()
    check_shadowrocket()
    print("templates ok")


if __name__ == "__main__":
    main()
