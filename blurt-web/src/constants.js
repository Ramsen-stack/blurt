export const COLORS = {
  paper: "#F7F3FA",
  ink: "#2D2640",
  blurt: "#E84393",
  blurtDark: "#C72E78",
  moss: "#5B4FCF",
  mossDark: "#453BA8",
  mustard: "#7FB3D5",
  card: "#F0E6F5",
  cardEdge: "#DCC9E8",
};

export const MOODS = [
  { id: "spark", label: "spark", color: "#E84393", emoji: "✦" },
  { id: "low", label: "low", color: "#6B7AA1", emoji: "○" },
  { id: "rage", label: "rage", color: "#D6336C", emoji: "▲" },
  { id: "soft", label: "soft", color: "#C9A6E8", emoji: "❀" },
  { id: "calm", label: "calm", color: "#5B4FCF", emoji: "≈" },
  { id: "chaos", label: "chaos", color: "#9B4FE0", emoji: "✺" },
  { id: "numb", label: "numb", color: "#9088A8", emoji: "—" },
  { id: "glow", label: "glow", color: "#4FB4E8", emoji: "☀" },
];

export const STICKERS = [
  "🐟", "🍋", "🫐", "🍓", "🍅", "🌻", "🪼", "🐱", "⭐", "🌸",
  "🍒", "🥂", "🪩", "☀️", "🎈", "🧃", "🔮", "🌙", "👁️", "🍬",
  "📼", "💌", "🧷", "🪷", "🥪", "🛟", "🪢", "🍉", "🦋", "✨",
];

export const STREAMING = [
  { id: "netflix", label: "Netflix", color: "#E50914" },
  { id: "prime", label: "Prime Video", color: "#00A8E1" },
  { id: "hotstar", label: "Hotstar", color: "#0F1F49" },
  { id: "hbo", label: "HBO Max", color: "#9B30FF" },
  { id: "hulu", label: "Hulu", color: "#1CE783" },
  { id: "appletv", label: "Apple TV+", color: "#000000" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "theatre", label: "Theatre", color: "#9B4FE0" },
  { id: "other", label: "Other", color: "#5C6B73" },
];

const BAD_WORDS = ["kill yourself", "kys", "child porn", "cp link", "rape her", "rape him"];

export function containsFlaggable(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function dateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function prettyDate(key) {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  borderRadius: 9,
  border: `1.5px solid ${COLORS.cardEdge}`,
  background: COLORS.paper,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: COLORS.ink,
  outline: "none",
};
