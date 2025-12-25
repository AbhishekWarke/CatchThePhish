# build_features_28.py
import csv
import os
import re
import math
from urllib.parse import urlparse

# Matches the JS specialChars set: @ % := ? & + $ , ; _ ~
SPECIAL_RE = re.compile(r'[@%:=\?&\+\$\,;_~]')
# Encoded char
ENCODED_RE = re.compile(r'%[0-9A-Fa-f]{2}')
# email-like
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
# hex long
HEX_RE = re.compile(r'[0-9a-fA-F]{6,}')
# uuid-like
UUID1_RE = re.compile(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}')
UUID2_RE = re.compile(r'[0-9a-fA-F]{8,}[-_][0-9a-fA-F]{4,}')
# login/finance keywords (same as JS)
LOGIN_RE = re.compile(r'(login|signin|account|verify|secure|update|confirm|auth)', re.I)
FINANCE_RE = re.compile(r'(bank|paypal|wallet|payment|invoice|credit|card|billing)', re.I)

SUSPICIOUS_TLDS = set([
    "xyz","top","shop","fit","loan","live","club","online","site","pw",
    "icu","info","biz","click","win","country"
])

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    ent = 0.0
    L = len(s)
    for v in freq.values():
        p = v / L
        ent -= p * math.log2(p)
    return ent

def is_ip_hostname(hostname: str) -> bool:
    # hostParts of digits and dots only
    return bool(re.fullmatch(r'\d+(?:\.\d+){3}', hostname))

def extract_28_features(raw_url: str) -> dict:
    u = raw_url.strip()
    # ensure scheme present (JS added http:// when missing)
    if not re.match(r'^[a-zA-Z]+://', u):
        fixed = 'http://' + u
    else:
        fixed = u

    try:
        p = urlparse(fixed)
    except Exception:
        p = urlparse('http://invalid-url.xyz')

    scheme = (p.scheme or '').lower()
    hostname = (p.hostname or '')  # doesn't contain port
    path = p.path or ''
    query = ('?' + p.query) if p.query else ''

    full = raw_url  # to match JS which used original full input when counting chars

    # counts
    count_dots = full.count('.')
    count_hyphens = full.count('-')
    count_digits = len(re.findall(r'[0-9]', full))
    count_special_chars = len(SPECIAL_RE.findall(full))
    count_slashes = full.count('/')  # JS used full.match(/\//g)

    features = {}
    # 1-4 lengths
    features['url_length'] = len(full)
    features['hostname_length'] = len(hostname)
    features['path_length'] = len(path)
    features['query_length'] = len(query)

    # counts
    features['count_dots'] = count_dots
    features['count_hyphens'] = count_hyphens
    features['count_digits'] = count_digits
    features['count_special_chars'] = count_special_chars
    features['count_slashes'] = count_slashes

    # is https
    features['is_https'] = 1 if scheme == 'https' else 0

    # hostname parts & tld
    host_parts = [p for p in hostname.split('.') if p]
    subdomain_count = max(0, len(host_parts) - 2)
    features['subdomain_count'] = subdomain_count
    tld = host_parts[-1] if len(host_parts) >= 1 else ''
    features['tld_length'] = len(tld)
    features['is_suspicious_tld'] = 1 if tld in SUSPICIOUS_TLDS else 0

    # is ip
    features['is_ip'] = 1 if is_ip_hostname(hostname) else 0

    # first subdomain length
    features['first_subdomain_length'] = len(host_parts[0]) if len(host_parts) > 2 else 0

    # multiple subdomains flag
    features['has_multiple_subdomains'] = 1 if subdomain_count > 1 else 0

    # starts with number?
    features['starts_with_number'] = 1 if hostname and hostname[0].isdigit() else 0

    # repeated chars (three in a row)
    features['contains_repeated_chars'] = 1 if re.search(r'(.)\1\1', full) else 0

    # keyword flags
    features['contains_login_keyword'] = 1 if LOGIN_RE.search(full) else 0
    features['contains_finance_keyword'] = 1 if FINANCE_RE.search(full) else 0

    # encoded, email pattern, hex, uuid
    features['contains_encoded_chars'] = 1 if ENCODED_RE.search(full) else 0
    features['contains_email_pattern'] = 1 if EMAIL_RE.search(full) else 0
    features['contains_hex_pattern'] = 1 if HEX_RE.search(full) else 0
    features['contains_uuid_pattern'] = 1 if (UUID1_RE.search(full) or UUID2_RE.search(full)) else 0

    # digit ratio (digits / hostname length) — JS did hostname.length ? digits/hostname.length : 0
    features['digit_ratio'] = (features['count_digits'] / len(hostname)) if len(hostname) else 0.0

    # special char ratio (specials / full length)
    features['special_char_ratio'] = (features['count_special_chars'] / len(full)) if len(full) else 0.0

    # entropy hostname/path
    features['entropy_hostname'] = shannon_entropy(hostname)
    features['entropy_path'] = shannon_entropy(path)

    return features

def main():
    in_path = os.path.join("data", "data.csv")  # generated earlier
    out_path = os.path.join("data", "data_28.csv")

    if not os.path.exists(in_path):
        print(f"ERROR: {in_path} not found. Run generate_dataset.py first.")
        return

    rows = []
    with open(in_path, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for rec in r:
            url = rec['url']
            label = rec.get('label', '0')
            feats = extract_28_features(url)
            feats['label'] = int(label)
            feats['url'] = url
            rows.append(feats)

    # field order must match model JSON expectations exactly
    fieldnames = [
        'url', 'label',
        'url_length','hostname_length','path_length','query_length',
        'count_dots','count_hyphens','count_digits','count_special_chars','count_slashes',
        'is_https','subdomain_count','tld_length','is_suspicious_tld','is_ip',
        'first_subdomain_length','has_multiple_subdomains','starts_with_number',
        'contains_repeated_chars','contains_login_keyword','contains_finance_keyword',
        'contains_encoded_chars','contains_email_pattern','contains_hex_pattern','contains_uuid_pattern',
        'digit_ratio','special_char_ratio','entropy_hostname','entropy_path'
    ]

    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for rec in rows:
            # ensure all fields exist
            out = {k: rec.get(k, 0) for k in fieldnames}
            w.writerow(out)

    print(f"Wrote {len(rows)} feature rows to {out_path}")

if __name__ == "__main__":
    main()
