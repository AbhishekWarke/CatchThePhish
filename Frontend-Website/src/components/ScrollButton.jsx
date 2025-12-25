import React, { useEffect, useState } from "react";
import "./scrollbutton.css";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";

export default function ScrollButton() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    function handleScroll() {
      setAtTop(window.scrollY < 150);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      className="scroll-btn"
      onClick={atTop ? scrollToBottom : scrollToTop}
      title={atTop ? "Scroll to Bottom" : "Scroll to Top"}
    >
      {atTop ? (
        <IoChevronDown size={28} />
      ) : (
        <IoChevronUp size={28} />
      )}
    </button>
  );
}
