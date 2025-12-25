// Frontend-Website/src/components/HeroSection.jsx
import React, { useEffect, useRef, useState } from "react";
import "./hero.css";

import { extractFeaturesFromUrl } from "../js/feature_extractor";
import {
  loadModelJson,
  predictWithLogistic,
  mapProbToLabel,
} from "../js/model_runner";
import { applyDomainOverrides } from "../js/overrides";

export default function HeroSection({ onSearch }) {
  const [url, setUrl] = useState("");
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const resultRef = useRef(null);

  const Spinner = ({ size = "md" }) => {
    const sizeClass =
      size === "sm"
        ? "ctp-spinner--sm"
        : size === "lg"
        ? "ctp-spinner--lg"
        : "ctp-spinner--md";
    return <div className={`ctp-spinner ${sizeClass}`} aria-hidden="true" />;
  };

  // Load model only once
  async function ensureModel() {
    if (model) return model;

    if (loadingModel) {
      while (loadingModel) await new Promise((r) => setTimeout(r, 30));
      return model;
    }

    setLoadingModel(true);
    try {
      const m = await loadModelJson();
      setModel(m);
      return m;
    } catch (err) {
      console.error("Failed to load model:", err);
      throw err;
    } finally {
      setLoadingModel(false);
    }
  }

  // EXPLANATION OF FEATURES
  function explainShort(features, prob) {
    if (!features) return "";

    const reasons = [];

    if (features.is_ip)
      reasons.push("URL uses a raw IP address (common in phishing).");
    if (features.contains_email_pattern)
      reasons.push("Email-like string inside URL (possible data exfiltration).");
    if (!features.is_https)
      reasons.push("URL does not use HTTPS (unsafe connection).");
    if (features.subdomain_count > 3)
      reasons.push("Too many subdomains — suspicious domain structure.");
    if (features.count_digits > 6)
      reasons.push("Large number of digits — uncommon in real services.");
    if (features.contains_encoded_chars)
      reasons.push("Contains encoded characters — used to hide payloads.");
    if ((features._raw || "").includes("@"))
      reasons.push("Contains '@' which can hide host redirection.");

    const brands = [
      "paypal",
      "amazon",
      "google",
      "apple",
      "netflix",
      "facebook",
      "instagram",
      "bank",
      "login",
      "secure",
      "account",
      "verify",
    ];
    const lower = (features._raw || "").toLowerCase();
    for (const b of brands) {
      if (
        lower.includes(b) &&
        !lower.includes(b + ".com") &&
        !lower.includes("www." + b)
      ) {
        reasons.push(`Contains "${b}" but not the official domain — impersonation.`);
        break;
      }
    }

    const pct = (prob * 100).toFixed(1);
    const risk = prob < 0.4 ? "LOW" : prob < 0.7 ? "MEDIUM" : "HIGH";

    if (reasons.length)
      return `${reasons[0]} (Phishing probability: ${pct}%, Risk: ${risk}).`;

    if (prob < 0.4)
      return `No strong phishing signals. (Probability: ${pct}%, Risk: ${risk}).`;
    if (prob < 0.7)
      return `Some suspicious lexical signals. (Probability: ${pct}%, Risk: ${risk}).`;
    return `Strong phishing indicators detected. (Probability: ${pct}%, Risk: ${risk}).`;
  }

  // ================================================
  // MAIN SUBMIT HANDLER
  // ================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return alert("Please paste a URL first.");

    if (onSearch) {
      try {
        onSearch(url.trim());
      } catch {}
    }

    let m = null;
    try {
      m = await ensureModel();
    } catch (err) {
      alert("Could not load ML model.");
      return;
    }
    if (!m) return;

    setBusy(true);
    setShowDetails(false);

    try {
      const cleanUrl = url.trim();
      const features = extractFeaturesFromUrl(cleanUrl);
      features._raw = cleanUrl;

      // ML prediction
      const rawProb = predictWithLogistic(m, features);

      // Domain Overrides
      const overrideRes = applyDomainOverrides
        ? applyDomainOverrides(cleanUrl, rawProb, features)
        : null;

      let overrideMessage = null;
      let finalProb = rawProb;

      if (overrideRes) {
        if (overrideRes.message) overrideMessage = String(overrideRes.message);
        if (typeof overrideRes.prob === "number") finalProb = overrideRes.prob;
      }

      // SHORT EXPLANATION
      const short = explainShort(features, finalProb);

      // RISK TEXT
      const shortInterpText =
        finalProb < 0.4
          ? "Low risk — appears legitimate based on lexical features."
          : finalProb < 0.7
          ? "Medium risk — some suspicious signals detected."
          : "High risk — avoid entering credentials.";

      const mapped = mapProbToLabel(finalProb);

      setResult({
        url: cleanUrl,
        prob: finalProb,
        label: mapped.label,
        color: mapped.color,
        features,
        short,
        shortInterpText,
        overrideMessage,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Prediction failed — check console.");
    } finally {
      setBusy(false);
    }
  };

  function shortRiskLabel(prob) {
    if (prob < 0.4) return "Low risk";
    if (prob < 0.7) return "Medium risk";
    return "High risk";
  }

  useEffect(() => {
    if (!result || !resultRef.current) return;
    const el = resultRef.current;
    const pct = Math.min(100, Math.max(0, result.prob * 100));

    el.style.setProperty("--ctp-result-color", result.color);
    el.style.setProperty("--ctp-risk-percent", pct.toString());
    el.setAttribute("data-risk-percent", pct.toFixed(2) + "%");
  }, [result]);

  // ================================================
  // UI MARKUP
  // ================================================
  return (
    <section className="hero">
      <h1 className="hero-heading">
        Welcome To <br />
        <span className="catch">Catch</span>
        <span className="the">The</span>
        <span className="phish">Phish</span>
      </h1>

      <div className="search-container">
        {/* INPUT FORM */}
        <form className="d-flex search-form" onSubmit={handleSubmit}>
          <input
            className="form-control search-input"
            placeholder="Enter URL to check…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className={`search-btn dynamic-search-btn ${busy ? "busy-search-btn" : ""}`}
            type="submit"
            disabled={busy || loadingModel}
          >
            {busy ? <Spinner size="sm" /> : null}
            {loadingModel ? "Loading..." : busy ? "Checking..." : "Search"}
          </button>
        </form>

        {/* RESULT */}
        {result && (
          <div className="result-wrapper" ref={resultRef}>
            <div className="result-box">

              {/* OUTPUT */}
              <div className="output-section">
                <div className="result-label">OUTPUT — {result.label}</div>

                <div className="risk-text">
                  <strong>RISK — Phishing probability:</strong>{" "}
                  {(result.prob * 100).toFixed(2)}%
                </div>

                <div className="short-interpretation">— {result.shortInterpText}</div>

                {result.overrideMessage && (
                  <div className="override-message">{result.overrideMessage}</div>
                )}
              </div>

              {/* RISK BAR */}
              <div className="risk-bar-header">
                <div className="risk-bar-left">
                  <div className="risk-track">
                    <div className="risk-fill" />
                  </div>

                  <div className="interpretation-small">
                    <strong>Interpretation:</strong>&nbsp;
                    <span>{shortRiskLabel(result.prob)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetails((s) => !s)}
                  className="details-btn"
                >
                  {showDetails ? "Hide detailed report" : "Generate detailed report"}
                </button>
              </div>

              <div className="caution-text">
                CatchThePhish can make mistakes. Check important info.
              </div>

              {/* DETAILED REPORT */}
              {showDetails && (
                <div className="detailed-report">
                  <div className="detail-box">
                    <div className="detail-heading">Summary & Recommendations</div>

                    <div className="summary-line">
                      <strong>Short verdict:</strong> {result.label} — Phishing probability{" "}
                      {(result.prob * 100).toFixed(2)}%
                    </div>

                    {/* PRIMARY REASONS */}
                    <div className="primary-reasons">
                      <strong>Primary reasons detected:</strong>
                      <ul className="reasons-list">
                        {result.features.is_ip && <li>URL uses IP address</li>}
                        {result.features.contains_email_pattern && <li>Email pattern found</li>}
                        {!result.features.is_https && <li>No HTTPS present</li>}
                        {result.features.subdomain_count > 3 && <li>Excessive subdomains</li>}
                        {result.features.count_digits > 6 && <li>High number of digits</li>}
                        {result.features.contains_encoded_chars && <li>Encoded characters present</li>}
                        {result.features.count_slashes > 6 && <li>Deep path structure</li>}
                      </ul>
                    </div>
                  </div>

                  {/* TECHNICAL FEATURE TABLE */}
                  <div className="detail-box">
                    <div className="detail-heading">Technical Feature Breakdown</div>
                    <table className="feature-table">
                      <tbody>
                        {Object.entries(result.features).map(([k, v]) => (
                          <tr key={k}>
                            <td className="feature-key"><strong>{k}</strong></td>
                            <td className="feature-val">{String(v)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="caution-text">
                      CatchThePhish can make mistakes. Check important info.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
