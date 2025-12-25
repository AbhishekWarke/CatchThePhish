import React from "react";
import "./about.css";
import { FaUserTie } from "react-icons/fa";

export default function AboutUs() {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">

        <h2 className="about-title">About Us</h2>

        <p className="about-desc">
          CatchThePhish is a modern phishing detection platform built with the 
          mission to make browsing safer for everyone. We focus on intelligent 
          URL inspection, real-time threat evaluation, and seamless user safety —
          all built with passion and innovation.
        </p>

        <div className="team-wrapper">

          {/* Abhishek */}
          <a
            href="https://www.linkedin.com/in/abhishekwarke21/"
            target="_blank"
            rel="noopener noreferrer"
            className="team-card-link"
          >
            <div className="team-card">
              <FaUserTie className="team-icon" />
              <h3 className="team-name">Abhishek Warke</h3>
              <p className="team-role">Co-Creator of CatchThePhish</p>
            </div>
          </a>

          {/* Aditya */}
          <a
            href="https://www.linkedin.com/in/aditya-maheshwari4/"
            target="_blank"
            rel="noopener noreferrer"
            className="team-card-link"
          >
            <div className="team-card">
              <FaUserTie className="team-icon" />
              <h3 className="team-name">Aditya Maheshwari</h3>
              <p className="team-role">Co-Creator of CatchThePhish</p>
            </div>
          </a>

        </div>

        <p className="about-footer">
          Built with dedication and the vision of providing a safer online experience for everyone.
        </p>

      </div>
    </section>
  );
}
