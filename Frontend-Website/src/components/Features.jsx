import React from "react";
import { GiSpeedometer } from "react-icons/gi";
import { TbNetwork } from "react-icons/tb";
import { FaChartBar, FaThumbsUp } from "react-icons/fa";
import "./Features.css";


export default function Features() {
  const items = [
    {
      Icon: GiSpeedometer,
      title: "Real-Time Detection",
      desc: "Instant analysis of URLs with near real-time results."
    },
    {
      Icon: TbNetwork,
      title: "Network & Heuristics",
      desc: "Multi-signal detection using domain, heuristics and WHOIS features."
    },
    {
      Icon: FaChartBar,
      title: "Comprehensive Reporting",
      desc: "Collect evidence and generate a clear risk report for each URL."
    },
    {
      Icon: FaThumbsUp,
      title: "User Friendly",
      desc: "Designed for non-technical users — simple, clear results."
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-inner">
        <h2 className="features-title">Features</h2>

        <div className="features-grid">
          {items.map(({ Icon, title, desc }, i) => (
            <article className="feature-card" key={i}>
              <div className="feature-icon">
                <Icon />
              </div>
              <h3 className="feature-name">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
