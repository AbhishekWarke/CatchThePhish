// Frontend-Website/src/js/overrides.js

const TRUSTED_DOMAINS = [
  "google.com", "gmail.com", "youtube.com", "openai.com",
  "microsoft.com", "office.com", "windows.com", "apple.com",
  "icloud.com", "support.apple.com",

  "instagram.com", "facebook.com", "twitter.com", "x.com",
  "linkedin.com",

  "amazon.com", "amazon.in",
  "paypal.com", "stripe.com",

  "github.com", "gitlab.com",
  "stackoverflow.com",

  "gov.in", "india.gov.in",

  // ONLY THESE TWO ARE TRUSTED DEV DOMAINS
  "abhinikfrontend.vercel.app",
  "catchthephish.vercel.app"
];

const DEV_HOST_SUFFIXES = [
  "vercel.app",
  "netlify.app",
  "github.io",
  "pages.dev",
  "web.app",
  "herokuapp.com",
  "glitch.me",
  "firebaseapp.com"
];

function _getHostname(url) {
  try {
    if (!/^[a-zA-Z]+:\/\//.test(url)) url = "http://" + url;
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.trim().replace(/^https?:\/\//, "").split(/[/?#]/)[0].toLowerCase();
  }
}

function _endsWithAny(host, list) {
  return list.some((d) => host === d || host.endsWith("." + d));
}

export function applyDomainOverrides(url, prob) {
  const hostname = _getHostname(url);

  // ----------------------------------------------------
  // 1. DEV HOSTING → ALWAYS UNVERIFIED (EXCEPT YOUR SITES)
  // ----------------------------------------------------
  if (
    _endsWithAny(hostname, DEV_HOST_SUFFIXES) &&
    !_endsWithAny(hostname, [
      "abhinikfrontend.vercel.app",
      "catchthephish.vercel.app"
    ])
  ) {
    return {
      prob: Math.max(prob, 0.40), // force SUSPICIOUS range
      labelOverride: "UNVERIFIED",
      color: "orange",
      message:
        "Hosted on a developer platform. This may be a legitimate project or a phishing page. Treat with caution."
    };
  }

  // ----------------------------------------------------
  // 2. TRUSTED DOMAINS → FORCE SAFE
  // ----------------------------------------------------
  if (_endsWithAny(hostname, TRUSTED_DOMAINS)) {
    const newProb = Math.min(prob, 0.15);
    return {
      prob: newProb,
      labelOverride: "FORCED_SAFE",
      color: "green",
      message: `Trusted domain detected: ${hostname}.`
    };
  }

  // ----------------------------------------------------
  // 3. IP ADDRESS → HIGH RISK
  // ----------------------------------------------------
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return {
      prob: Math.max(prob, 0.85),
      labelOverride: null,
      color: "red",
      message: "IP-based URLs are commonly used in phishing attacks."
    };
  }

  return { prob, labelOverride: null, color: null, message: null };
}
