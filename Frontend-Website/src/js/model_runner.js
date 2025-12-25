// ------------------------------
// 1) Load LR model JSON
// ------------------------------
console.log(">>> MODEL RUNNER LOADED (TEST)");

export async function loadModelJson() {
  const resp = await fetch('/model_rules.json');
  if (!resp.ok) throw new Error("Failed to load model_rules.json");
  return await resp.json();
}

// ------------------------------
// 2) Build LR feature vector
// ------------------------------
export function buildFeatureVector(modelJson, f) {
  return modelJson.feature_names.map(name => Number(f[name] || 0));
}

// ------------------------------
// 3) Logistic regression inference
// ------------------------------
export function predictWithLogistic(modelJson, featuresObj) {
  const vector = buildFeatureVector(modelJson, featuresObj);
  const weights = modelJson.coefficients;
  const intercept = modelJson.intercept;

  let score = intercept;
  for (let i = 0; i < vector.length; i++) {
    score += weights[i] * vector[i];
  }

  return 1 / (1 + Math.exp(-score));
}

// ------------------------------
// 4) Domain override layer
// ------------------------------
export function applyDomainOverrides(url, prob) {
  const h = extractHostname(url);

  const trusted = [
    "google.com","www.google.com",
    "github.com","www.github.com",
    "chatgpt.com","www.chatgpt.com",
    "openai.com","www.openai.com",
    "paypal.com","www.paypal.com",
    "microsoft.com","www.microsoft.com"
  ];

  if (trusted.includes(h)) {
    return { prob: Math.min(prob, 0.15), message: `Trusted domain: ${h}` };
  }

  const dev = ["vercel.app","netlify.app","github.io"];
  if (dev.some(d => h.endsWith(d))) {
    return { prob: Math.min(prob, 0.35), message: `Developer hosting: ${h}` };
  }

  return { prob, message: null };
}

function extractHostname(url) {
  try {
    if (!/^[a-zA-Z]+:\/\//.test(url)) url = "http://" + url;
    return new URL(url).hostname.toLowerCase();
  } catch (_) {
    return "";
  }
}

// ------------------------------
// 5) Probability → LABEL
// ------------------------------
export function mapProbToLabel(prob) {
  if (prob < 0.40) return { label: "SAFE", color: "green" };
  if (prob < 0.70) return { label: "SUSPICIOUS", color: "orange" };
  return { label: "DANGEROUS", color: "red" };
}
