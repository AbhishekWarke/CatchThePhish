import React from "react";
import { FaChrome } from "react-icons/fa";
import "./extension.css";

export default function ExtensionSection() {
  return (
    <section className="extension-section" id="extension">
      <div className="extension-inner">

        <h2 className="extension-title">Download Our Extension</h2>

        <p className="extension-sub">
          Enhance your browsing safety with our real-time URL phishing detection browser extension.  
          Instantly know whether a website is safe — without copying and pasting links manually.
        </p>

        <div className="extension-buttons">
          <a className="ext-btn chrome" href="#">
            <FaChrome className="ext-icon" />
            Add to Chrome
          </a>
        </div>

      </div>
    </section>
  );
}
