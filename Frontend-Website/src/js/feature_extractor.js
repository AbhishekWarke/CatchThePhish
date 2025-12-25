// src/js/feature_extractor.js
// Extract the SAME 28 FEATURES as Python (data_28.csv)

export function extractFeaturesFromUrl(url) {
  url = String(url || "").trim();

  // Ensure URL has a scheme (Python auto-added http:// for parsing)
  let fixedUrl = url;
  if (!/^[a-zA-Z]+:\/\//.test(url)) {
    fixedUrl = "http://" + url;
  }

  let parsed;
  try {
    parsed = new URL(fixedUrl);
  } catch (e) {
    parsed = new URL("http://invalid-url.xyz");
  }

  const scheme = parsed.protocol.replace(":", "").toLowerCase();
  const hostname = parsed.hostname || "";
  const path = parsed.pathname || "";
  const full = url;
  const query = parsed.search || "";

  const f = {};

  // 1. Basic structural lengths
  f.url_length = full.length;
  f.hostname_length = hostname.length;
  f.path_length = path.length;
  f.query_length = query.length;

  // 2. Simple counts
  f.count_dots = (full.match(/\./g) || []).length;
  f.count_hyphens = (full.match(/-/g) || []).length;
  f.count_digits = (full.match(/[0-9]/g) || []).length;

  const specialChars = /[@%:=?&+$,;_~]/g;
  f.count_special_chars = (full.match(specialChars) || []).length;

  f.count_slashes = (full.match(/\//g) || []).length;

  // 3. HTTPS check
  f.is_https = scheme === "https" ? 1 : 0;

  // 4. Hostname / TLD / subdomains
  const hostParts = hostname.split(".").filter(Boolean);
  const subdomainCount = Math.max(0, hostParts.length - 2);
  f.subdomain_count = subdomainCount;

  const tld = hostParts.length > 0 ? hostParts[hostParts.length - 1] : "";
  f.tld_length = tld.length;

  const suspiciousTlds = new Set([
    "xyz","top","shop","fit","loan","live","club","online","site","pw",
    "icu","info","biz","click","win","country"
  ]);
  f.is_suspicious_tld = suspiciousTlds.has(tld) ? 1 : 0;

  // 5. IP address check
  f.is_ip = /^[0-9.]+$/.test(hostname) ? 1 : 0;

  // 6. Subdomain length
  f.first_subdomain_length =
    hostParts.length > 2 ? hostParts[0].length : 0;

  // 7. Multiple subdomains?
  f.has_multiple_subdomains = subdomainCount > 1 ? 1 : 0;

  // 8. Starts with number?
  f.starts_with_number = hostname[0] >= "0" && hostname[0] <= "9" ? 1 : 0;

  // 9. Repeated characters?
  f.contains_repeated_chars = /(.)\1\1/.test(full) ? 1 : 0;

  // 10. Keyword flags
  const loginRegex = /(login|signin|account|verify|secure|update|confirm|auth)/i;
  f.contains_login_keyword = loginRegex.test(full) ? 1 : 0;

  const financeRegex = /(bank|paypal|wallet|payment|invoice|credit|card|billing)/i;
  f.contains_finance_keyword = financeRegex.test(full) ? 1 : 0;

  // 11. Encoded characters
  f.contains_encoded_chars = /%[0-9A-Fa-f]{2}/.test(full) ? 1 : 0;

  // 12. Email pattern inside URL
  f.contains_email_pattern =
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(full) ? 1 : 0;

  // 13. Hex pattern
  f.contains_hex_pattern = /[0-9a-fA-F]{6,}/.test(full) ? 1 : 0;

  // 14. UUID-like patterns
  const uuidRegex1 =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const uuidRegex2 = /[0-9a-fA-F]{8,}[-_][0-9a-fA-F]{4,}/;
  f.contains_uuid_pattern =
    uuidRegex1.test(full) || uuidRegex2.test(full) ? 1 : 0;

  // 15. Ratios
  f.digit_ratio = hostname.length
    ? f.count_digits / hostname.length
    : 0;

  f.special_char_ratio = full.length
    ? f.count_special_chars / full.length
    : 0;

  // 16. Entropy
  f.entropy_hostname = computeEntropy(hostname);
  f.entropy_path = computeEntropy(path);

  return f;
}

// Shannon entropy function
function computeEntropy(str) {
  if (!str) return 0;
  const freq = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;

  return Object.values(freq)
    .map(n => {
      const p = n / str.length;
      return -p * Math.log2(p);
    })
    .reduce((a, b) => a + b, 0);
}
