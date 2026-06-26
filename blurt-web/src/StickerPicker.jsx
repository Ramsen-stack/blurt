import React from "react";
import { STICKERS, COLORS } from "./constants.js";

export default function StickerPicker({ selected, onToggle, max = 3 }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 110, overflowY: "auto", padding: 4 }}>
      {STICKERS.map((s) => {
        const active = selected.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(s)}
            disabled={!active && selected.length >= max}
            style={{
              fontSize: 20, width: 36, height: 36, borderRadius: 8, cursor: "pointer",
              background: active ? COLORS.mustard + "55" : "transparent",
              border: active ? `2px solid ${COLORS.mustard}` : "2px solid transparent",
              opacity: !active && selected.length >= max ? 0.3 : 1,
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
