import React from "react";
import "./footer.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="new-footer">
        {/* Logo + Title */}
        <div className="footer-brand">
          <img src="/media/logo.png" alt="logo" className="footer-logo" />
          <h3 className="footer-title">CatchThePhish</h3>
          <p className="footer-tagline">
            Smarter. Safer. Browsing. Helping users detect phishing instantly.
          </p>
        </div>

        {/* Links */}
        <div className="footer-sections">
          <div className="footer-group">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#extension">Extension</a>
            <a href="#about">About Us</a>
          </div>

          <div className="footer-group">
            <h4>Creators</h4>
            <a
              href="https://www.linkedin.com/in/abhishekwarke21/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abhishek Warke
            </a>
            <a
              href="https://www.linkedin.com/in/aditya-maheshwari4/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Aditya Maheshwari
            </a>
          </div>

          <div className="footer-group">
            <h4>Contact</h4>
            <a href="mailto:en22cs301036@medicaps.ac.in">Abhishek's Email</a>
            <a href="mailto:en22cs301054@medicaps.ac.in">Aditya's Email</a>
          </div>
        </div>

        {/* Social Icons */}
        <div className="footer-socials">

          {/* LinkedIn dropdown */}
          <div className="social-dropdown" aria-haspopup="true">
            <FaLinkedin className="social-main linkedin-main" />
            <div className="social-menu linkedin-menu" role="menu">
              <a
                href="https://www.linkedin.com/in/abhishekwarke21/"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
              >
                Abhishek Warke
              </a>
              <a
                href="https://www.linkedin.com/in/aditya-maheshwari4/"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
              >
                Aditya Maheshwari
              </a>
            </div>
          </div>

          {/* GitHub dropdown (mirrors LinkedIn behavior) */}
          <div className="social-dropdown" aria-haspopup="true">
            <FaGithub className="social-main github-main" />
            <div className="social-menu github-menu" role="menu">
              <a
                href="https://github.com/AbhishekWarke"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
              >
                Abhishek Warke
              </a>
              <a
                href="https://github.com/AdityaMaheshwari30114"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
              >
                Aditya Maheshwari
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <p className="footer-copy">
          © {new Date().getFullYear()} CatchThePhish — Made with ❤️ in India.
        </p>
      </div>
    </footer>
  );
}
