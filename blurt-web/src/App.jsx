import React, { useState, useEffect } from "react";
import { LogOut, Lock, Globe } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { COLORS } from "./constants.js";
import AuthScreen from "./AuthScreen.jsx";
import PublicFeed from "./PublicFeed.jsx";
import DailyDigestEditor from "./DailyDigestEditor.jsx";

function tabBtnStyle(active, color) {
  return {
    display: "flex", alignItems: "center", gap: 5, border: "none", cursor: "pointer",
    padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    background: active ? color : "transparent",
    color: active ? "#fff" : COLORS.ink,
  };
}

export default function App() {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState(null);
  const [tab, setTab] = useState("public");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setUsername(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("blurt_profiles")
        .select("username")
        .eq("id", session.user.id)
        .maybeSingle();
      setUsername(data?.username || null);
    })();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (checking) return <div style={{ background: COLORS.paper, height: "100%" }} />;
  if (!session) return <AuthScreen onLogin={() => {}} />;
  if (!username) {
    return (
      <div style={{ background: COLORS.paper, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#736B8C", fontFamily: "'Inter', sans-serif" }}>
        setting up your profile...
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.paper, minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea, input { font-family: inherit; }
        ::placeholder { color: #B6AECF; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 10, background: COLORS.paper, borderBottom: `1px solid ${COLORS.cardEdge}`, padding: "14px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 20, color: COLORS.ink }}>
            blurt<span style={{ color: COLORS.blurt }}>.</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: COLORS.card, borderRadius: 999, padding: 4 }}>
            <button onClick={() => setTab("public")} style={tabBtnStyle(tab === "public", COLORS.blurt)}>
              <Globe size={13} /> public
            </button>
            <button onClick={() => setTab("private")} style={tabBtnStyle(tab === "private", COLORS.moss)}>
              <Lock size={13} /> private
            </button>
          </div>
          <button onClick={handleLogout} title="log out" style={{ border: "none", background: "transparent", cursor: "pointer", color: "#9D93B5", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {tab === "public" ? (
        <PublicFeed userId={session.user.id} username={username} />
      ) : (
        <DailyDigestEditor userId={session.user.id} username={username} />
      )}
    </div>
  );
}
