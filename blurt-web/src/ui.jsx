import React from "react";
import { COLORS } from "./constants.js";

export function PaperButton({ children, onClick, variant = "blurt", style = {}, disabled, type = "button", title }) {
  const bg = variant === "blurt" ? COLORS.blurt : variant === "moss" ? COLORS.moss : variant === "ghost" ? "transparent" : COLORS.mustard;
  const color = variant === "ghost" ? COLORS.ink : COLORS.paper;
  const border = variant === "ghost" ? `2px solid ${COLORS.ink}` : "none";
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: bg,
        color,
        border,
        borderRadius: 10,
        padding: "10px 18px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
        boxShadow: variant === "ghost" ? "none" : "0 3px 0 rgba(45,38,64,0.25)",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(2px)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </button>
  );
}

export function Tag({ children, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        background: color ? `${color}22` : "#2D264011",
        color: color || COLORS.ink,
        border: `1px solid ${color ? color + "55" : "#2D264033"}`,
      }}
    >
      {children}
    </span>
  );
}
