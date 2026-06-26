import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { COLORS, STREAMING, inputStyle } from "./constants.js";
import { PaperButton } from "./ui.jsx";

async function searchTVMaze(query) {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.slice(0, 6).map((d) => ({
      id: `tv-${d.show.id}`,
      title: d.show.name,
      year: d.show.premiered ? d.show.premiered.slice(0, 4) : "",
      poster: d.show.image ? d.show.image.medium : null,
      type: "show",
    }));
  } catch {
    return [];
  }
}

async function searchITunesMovies(query) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=6`);
    const data = await res.json();
    return (data.results || []).map((d) => ({
      id: `mv-${d.trackId}`,
      title: d.trackName,
      year: d.releaseDate ? d.releaseDate.slice(0, 4) : "",
      poster: d.artworkUrl100 ? d.artworkUrl100.replace("100x100", "300x300") : null,
      type: "movie",
    }));
  } catch {
    return [];
  }
}

export default function ShowSearchPicker({ onAdd, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [platform, setPlatform] = useState(STREAMING[0]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const [tv, movies] = await Promise.all([searchTVMaze(query), searchITunesMovies(query)]);
      setResults([...tv, ...movies]);
      setSearching(false);
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(45,38,64,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.paper, borderRadius: 16, padding: 22, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>add what you watched</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: 13, color: "#9D93B5" }} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search a movie or show title..." style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#736B8C" }}>watched on</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {STREAMING.map((s) => (
              <button
                key={s.id}
                onClick={() => setPlatform(s)}
                style={{
                  border: platform.id === s.id ? `2px solid ${s.color}` : `1.5px solid ${COLORS.cardEdge}`,
                  background: platform.id === s.id ? s.color + "1A" : "#fff",
                  borderRadius: 8, padding: "5px 10px", fontSize: 11.5, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: COLORS.ink,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {searching && <p style={{ color: "#9D93B5", fontSize: 13 }}>searching...</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => { onAdd({ ...r, platform: platform.id, platformLabel: platform.label, platformColor: platform.color }); onClose(); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", border: `1.5px solid ${COLORS.cardEdge}`, borderRadius: 10, padding: 8, cursor: "pointer", background: COLORS.card }}
            >
              {r.poster ? (
                <img src={r.poster} alt={r.title} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 6, marginBottom: 6 }} />
              ) : (
                <div style={{ width: "100%", height: 110, background: COLORS.cardEdge, borderRadius: 6, marginBottom: 6 }} />
              )}
              <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.3 }}>{r.title}</span>
              <span style={{ fontSize: 10.5, color: "#9D93B5" }}>{r.year} · {r.type}</span>
            </button>
          ))}
        </div>

        {!searching && query && results.length === 0 && (
          <div>
            <p style={{ color: "#9D93B5", fontSize: 13, marginBottom: 10 }}>no matches — add it manually:</p>
            <PaperButton
              variant="moss"
              onClick={() => {
                onAdd({
                  id: `manual-${Date.now()}`,
                  title: query, year: "", poster: null, type: "manual",
                  platform: platform.id, platformLabel: platform.label, platformColor: platform.color,
                });
                onClose();
              }}
            >
              add "{query}" manually
            </PaperButton>
          </div>
        )}
      </div>
    </div>
  );
}
