import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import { COLORS, inputStyle } from "./constants.js";
import { PaperButton } from "./ui.jsx";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const submit = async () => {
    setError("");
    setInfo("");
    const mail = email.trim().toLowerCase();
    if (!mail || !mail.includes("@")) return setError("enter a valid email.");
    if (!password || password.length < 6) return setError("password needs at least 6 characters.");

    if (mode === "signup") {
      const uname = username.trim().toLowerCase();
      if (!uname || uname.length < 3) return setError("username needs at least 3 characters.");
      if (!/^[a-z0-9_]+$/.test(uname)) return setError("username: letters, numbers, underscores only.");
      if (!agreed) return setError("you have to agree to the public disclaimer first.");

      setBusy(true);
      const { data: existingProfile } = await supabase
        .from("blurt_profiles")
        .select("username")
        .eq("username", uname)
        .maybeSingle();
      if (existingProfile) {
        setBusy(false);
        return setError("that username's taken. try another.");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: mail,
        password,
      });
      if (signUpError) {
        setBusy(false);
        return setError(signUpError.message);
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("blurt_profiles")
          .insert({ id: data.user.id, username: uname });
        if (profileError) {
          setBusy(false);
          return setError("account created, but couldn't save your username: " + profileError.message);
        }
      }

      setBusy(false);
      if (!data.session) {
        setInfo("check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        onLogin();
      }
    } else {
      setBusy(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: mail,
        password,
      });
      setBusy(false);
      if (signInError) return setError(signInError.message);
      onLogin();
    }
  };

  return (
    <div style={{
      minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: COLORS.paper, padding: 24, fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-block", transform: "rotate(-3deg)",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 52,
            color: COLORS.ink, letterSpacing: -2,
          }}>
            blurt<span style={{ color: COLORS.blurt }}>.</span>
          </div>
          <p style={{ color: "#736B8C", fontSize: 14, marginTop: 6, fontStyle: "italic" }}>
            say it before you think better of it.
          </p>
        </div>

        <div style={{
          background: COLORS.card, borderRadius: 16, padding: 28,
          border: `1px solid ${COLORS.cardEdge}`,
          boxShadow: "0 8px 0 rgba(45,38,64,0.06)",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setInfo(""); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13,
                  background: mode === m ? COLORS.ink : "transparent",
                  color: mode === m ? COLORS.paper : COLORS.ink,
                }}
              >
                {m === "login" ? "log in" : "sign up"}
              </button>
            ))}
          </div>

          <label style={labelStyle}>email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />

          {mode === "signup" && (
            <>
              <label style={{ ...labelStyle, marginTop: 14 }}>username (public)</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="how others will see you" style={inputStyle} />
            </>
          )}

          <label style={{ ...labelStyle, marginTop: 14 }}>password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 6 characters"
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {mode === "signup" && (
            <label style={{
              display: "flex", gap: 8, alignItems: "flex-start", marginTop: 16,
              fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5, cursor: "pointer",
            }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                <b>everything you post on the public side is visible to anyone in the world</b>, forever searchable by other users. don't post anything you wouldn't want a stranger — or your mum — to read. your private digest stays just for you.
              </span>
            </label>
          )}

          {error && <div style={{ color: COLORS.blurtDark, fontSize: 13, marginTop: 12, fontWeight: 600 }}>{error}</div>}
          {info && <div style={{ color: COLORS.mossDark, fontSize: 13, marginTop: 12, fontWeight: 600 }}>{info}</div>}

          <PaperButton onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 18, padding: "12px 0" }}>
            {busy ? "..." : mode === "login" ? "log in" : "create account"}
          </PaperButton>

          <p style={{ fontSize: 11, color: "#9D93B5", marginTop: 14, textAlign: "center" }}>
            your account is secured by Supabase Auth — real password hashing, real sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#736B8C", marginBottom: 4, display: "block",
};
