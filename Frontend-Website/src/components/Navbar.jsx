import React from "react";
import "./navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#home">
          <img src="/media/logo.png" alt="logo" className="logoImg" />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <a className="nav-link" href="#features">
              Features
            </a>
            <a className="nav-link" href="#about">
              About Us
            </a>
            <a className="nav-link" href="#report" aria-disabled="true">
              URL Phishing Report
            </a>
            <a className="nav-link" href="#extension" aria-disabled="true">
              Download Our Extension
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
