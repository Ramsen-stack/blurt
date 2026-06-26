import React, { useState, useEffect, useCallback } from "react";
import { Flag, Globe, Sparkles } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { COLORS, MOODS, containsFlaggable, timeAgo } from "./constants.js";
import { PaperButton, Tag } from "./ui.jsx";
import StickerPicker from "./StickerPicker.jsx";

function BlurtComposer({ userId, username, onPosted }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [stickers, setStickers] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [posting, setPosting] = useState(false);
  const [warn, setWarn] = useState("");
  const [err, setErr] = useState("");

  const post = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setWarn("");
    setErr("");
    if (containsFlaggable(trimmed)) {
      setWarn("this reads like it could be about self-harm or something illegal — want to keep posting anyway? if you're struggling, you deserve real support, not just a public post.");
    }
    setPosting(true);
    const { error } = await supabase.from("blurt_posts").insert({
      user_id: userId,
      username,
      text: trimmed,
      mood: mood.id,
      stickers,
    });
    setPosting(false);
    if (error) return setErr(error.message);
    setText("");
    setStickers([]);
    onPosted();
  };

  return (
    <div style={{
      background: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 22,
      border: `1px solid ${COLORS.cardEdge}`, position: "relative",
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="blurt it out. no filter, no word limit..."
        style={{
          width: "100%", minHeight: 90, resize: "vertical", border: "none", background: "transparent",
          fontFamily: "'Inter', sans-serif", fontSize: 16, color: COLORS.ink, outline: "none", boxSizing: "border-box",
        }}
      />
      {warn && (
        <div style={{
          background: "#FBE8F2", border: `1px solid ${COLORS.blurt}55`, borderRadius: 10,
          padding: "10px 12px", fontSize: 12.5, color: COLORS.blurtDark, marginBottom: 10, lineHeight: 1.5,
        }}>
          {warn}
        </div>
      )}
      {err && <div style={{ color: COLORS.blurtDark, fontSize: 12.5, marginBottom: 10 }}>{err}</div>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMood(m)}
            style={{
              border: mood.id === m.id ? `2px solid ${m.color}` : "1.5px solid transparent",
              background: mood.id === m.id ? m.color + "22" : "#FBF8FD",
              borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", color: COLORS.ink,
            }}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {showStickers && (
        <div style={{ marginBottom: 10 }}>
          <StickerPicker
            selected={stickers}
            onToggle={(s) => setStickers((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 3 ? [...prev, s] : prev))}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setShowStickers((v) => !v)}
          style={{
            border: "none", background: "transparent", cursor: "pointer", fontSize: 13,
            color: "#736B8C", fontFamily: "'JetBrains Mono', monospace", display: "flex", gap: 4, alignItems: "center",
          }}
        >
          <Sparkles size={14} /> decorate {stickers.length > 0 && `(${stickers.length}/3)`}
        </button>
        <PaperButton onClick={post} disabled={!text.trim() || posting}>
          {posting ? "blurting..." : "blurt it"}
        </PaperButton>
      </div>
    </div>
  );
}

function BlurtCard({ post, onFlagged }) {
  const mood = MOODS.find((m) => m.id === post.mood) || MOODS[0];
  const rotation = (post.id.charCodeAt(0) % 5) - 2;
  const [flagging, setFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const flag = async () => {
    setFlagging(true);
    const { error } = await supabase.rpc("flag_post", { post_id: post.id });
    setFlagging(false);
    if (!error) {
      setFlagged(true);
      onFlagged();
    }
  };

  return (
    <div style={{
      background: COLORS.card, borderRadius: 14, padding: "18px 18px 14px",
      border: `1px solid ${COLORS.cardEdge}`, position: "relative",
      transform: `rotate(${rotation}deg)`,
      borderLeft: `5px solid ${mood.color}`,
      marginBottom: 18,
    }}>
      {post.stickers && post.stickers.length > 0 && (
        <div style={{ position: "absolute", top: -12, right: 10, fontSize: 22, display: "flex", gap: 2 }}>
          {post.stickers.map((s, i) => <span key={i} style={{ filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.2))" }}>{s}</span>)}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: COLORS.ink }}>@{post.username}</span>
          <Tag color={mood.color}>{mood.emoji} {mood.label}</Tag>
        </div>
        <span style={{ fontSize: 11, color: "#9D93B5", fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(post.created_at)}</span>
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: COLORS.ink, whiteSpace: "pre-wrap", margin: "6px 0 12px" }}>
        {post.text}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={flag}
          disabled={flagging || flagged}
          title="flag this post"
          style={{
            border: "none", background: "transparent", cursor: flagged ? "default" : "pointer", color: "#9D93B5",
            display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Flag size={12} /> {flagged ? "flagged" : "flag"}
        </button>
      </div>
    </div>
  );
}

export default function PublicFeed({ userId, username }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMood, setFilterMood] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("blurt_posts")
      .select("*")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) setFeed(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = feed.filter((p) => !filterMood || p.mood === filterMood);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 60px" }}>
      <div style={{
        background: "#FBE8F2", border: `1px solid ${COLORS.blurt}40`, borderRadius: 10,
        padding: "10px 14px", fontSize: 12.5, color: COLORS.blurtDark, marginBottom: 18, lineHeight: 1.5,
      }}>
        <Globe size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />
        public — anyone in the world can read everything posted here, including this entry.
      </div>

      <BlurtComposer userId={userId} username={username} onPosted={load} />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          onClick={() => setFilterMood(null)}
          style={{
            border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 12, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            background: !filterMood ? COLORS.ink : "#FBF8FD", color: !filterMood ? COLORS.paper : COLORS.ink,
          }}
        >
          all moods
        </button>
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterMood(filterMood === m.id ? null : m.id)}
            style={{
              border: filterMood === m.id ? `2px solid ${m.color}` : "none",
              borderRadius: 999, padding: "5px 11px", fontSize: 12, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              background: filterMood === m.id ? m.color + "22" : "#FBF8FD", color: COLORS.ink,
            }}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#9D93B5", textAlign: "center", marginTop: 40 }}>loading the noise...</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "#9D93B5", textAlign: "center", marginTop: 40, fontStyle: "italic" }}>
          nothing here yet. be the first to blurt.
        </p>
      ) : (
        visible.map((post) => <BlurtCard key={post.id} post={post} onFlagged={load} />)
      )}
    </div>
  );
}
