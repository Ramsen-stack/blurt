import React, { useState, useEffect, useCallback } from "react";
import { Droplet, Lock, Plus } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { COLORS, MOODS, dateKey, prettyDate, inputStyle } from "./constants.js";
import { PaperButton } from "./ui.jsx";
import ShowSearchPicker from "./ShowSearchPicker.jsx";

const sectionStyle = { background: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14, border: `1px solid ${COLORS.cardEdge}` };
const labelStyle = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: COLORS.ink };

function WaterTracker({ value, onChange }) {
  const glasses = 8;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Droplet size={16} color={COLORS.moss} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13 }}>water — {value}/{glasses} glasses</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: glasses }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1 === value ? i : i + 1)}
            style={{ width: 26, height: 32, borderRadius: "4px 4px 8px 8px", cursor: "pointer", border: `2px solid ${COLORS.moss}`, background: i < value ? COLORS.moss : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}

const emptyEntry = { water: 0, work: "", shows: [], mood: null, notes: "" };

export default function DailyDigestEditor({ userId, username }) {
  const [date] = useState(dateKey());
  const [entry, setEntry] = useState(emptyEntry);
  const [loaded, setLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blurt_digest")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();
      if (data) {
        setEntry({
          water: data.water || 0,
          work: data.work || "",
          shows: data.shows || [],
          mood: data.mood ? MOODS.find((m) => m.id === data.mood) || null : null,
          notes: data.notes || "",
        });
      }
      setLoaded(true);
    })();
  }, [userId, date]);

  const save = useCallback(async (next) => {
    setSaving(true);
    const { error } = await supabase.from("blurt_digest").upsert({
      user_id: userId,
      date,
      water: next.water,
      work: next.work,
      shows: next.shows,
      mood: next.mood?.id || null,
      notes: next.notes,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    }
  }, [userId, date]);

  const update = (patch) => {
    const next = { ...entry, ...patch };
    setEntry(next);
    save(next);
  };

  const addShow = (show) => update({ shows: [...entry.shows, show] });
  const removeShow = (id) => update({ shows: entry.shows.filter((s) => s.id !== id) });

  const shareDigestPublicly = async () => {
    const lines = [];
    if (entry.water) lines.push(`💧 ${entry.water}/8 glasses of water`);
    if (entry.work.trim()) lines.push(`💼 ${entry.work.trim()}`);
    if (entry.shows.length) lines.push(`📺 watched: ${entry.shows.map((s) => s.title).join(", ")}`);
    if (entry.notes.trim()) lines.push(entry.notes.trim());
    if (lines.length === 0) return;
    const text = `today's log —\n${lines.join("\n")}`;
    const { error } = await supabase.from("blurt_posts").insert({
      user_id: userId,
      username,
      text,
      mood: entry.mood?.id || "calm",
      stickers: [],
    });
    if (!error) {
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  };

  if (!loaded) return <p style={{ color: "#9D93B5", textAlign: "center", marginTop: 40 }}>loading today...</p>;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 60px" }}>
      <div style={{ background: "#ECE9F9", border: `1px solid ${COLORS.moss}30`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: COLORS.mossDark, marginBottom: 18 }}>
        <Lock size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />
        private — only you can see this, enforced at the database level. share pieces of it publicly if you want, below.
      </div>

      <h2 style={{ fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{prettyDate(date)}</h2>
      <p style={{ color: "#9D93B5", fontSize: 12, marginBottom: 20 }}>{saving ? "saving..." : saved ? "saved ✓" : "autosaves as you go"}</p>

      <section style={sectionStyle}>
        <WaterTracker value={entry.water} onChange={(v) => update({ water: v })} />
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle}>what did you work on today?</label>
        <textarea value={entry.work} onChange={(e) => update({ work: e.target.value })} placeholder="shipped the landing page, fixed that annoying bug..." style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />
      </section>

      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={labelStyle}>what did you watch?</label>
          <button onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: COLORS.moss, color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            <Plus size={13} /> add
          </button>
        </div>
        {entry.shows.length === 0 ? (
          <p style={{ color: "#9D93B5", fontSize: 13, fontStyle: "italic" }}>nothing logged yet today.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {entry.shows.map((s) => (
              <div key={s.id} style={{ position: "relative" }}>
                <button onClick={() => removeShow(s.id)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", border: "none", background: COLORS.ink, color: "#fff", cursor: "pointer", fontSize: 11, zIndex: 2 }}>×</button>
                {s.poster ? (
                  <img src={s.poster} alt={s.title} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                ) : (
                  <div style={{ width: "100%", height: 100, background: COLORS.cardEdge, borderRadius: 8 }} />
                )}
                <p style={{ fontSize: 11, fontWeight: 700, margin: "4px 0 0", lineHeight: 1.25 }}>{s.title}</p>
                <span style={{ fontSize: 9.5, color: s.platformColor, fontWeight: 700 }}>{s.platformLabel}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle}>mood today</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
          {MOODS.map((m) => (
            <button key={m.id} onClick={() => update({ mood: m })} style={{ border: entry.mood?.id === m.id ? `2px solid ${m.color}` : "1.5px solid transparent", background: entry.mood?.id === m.id ? m.color + "22" : "#fff", borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle}>anything else?</label>
        <textarea value={entry.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="free space for whatever..." style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
      </section>

      <PaperButton variant="moss" onClick={shareDigestPublicly} style={{ width: "100%" }}>
        {shared ? "shared ✓" : "share today's log publicly"}
      </PaperButton>
      <p style={{ fontSize: 11, color: "#9D93B5", textAlign: "center", marginTop: 8 }}>
        this posts a summary to the public feed under @{username}. the rest of your private log stays private.
      </p>

      {showPicker && <ShowSearchPicker onAdd={addShow} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
